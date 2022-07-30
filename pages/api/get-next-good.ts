import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../utils/db"
import { GOODData } from "../../utils/types"
import { mergeTemplate } from "../../utils/utils"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.send({ error: "Method not allowed!" })

  try {
    const { token } = JSON.parse(req.body)
    if (!token || typeof token != "string") return res.send({ error: "Invalid data!" })

    const computer = await prisma.computer.findUnique({ where: { token } })
    if (computer == null) return res.send({ error: "Unknown token!" })

    console.log(`Received GOOD request for ${token}`)
    const queued = await prisma.calculationQueue.findFirst({
      where: { computerId: computer.id },
      include: {
        user: {
          include: {
            currentGOOD: {
              select: {
                data: true
              }
            }
          }
        },
        experiment: {
          select: {
            template: true,
            character: true,
          }
        }
      }
    })

    if (queued) {
      if (queued.createdOn.getTime() < Date.now() - 30 * 60 * 1000)
        await prisma.calculationQueue.delete({ where: { id: queued.id } })
      else {
        console.log(`Already found GOOD request for ${token}`)
        const { character, template } = queued.experiment
        const goodData = queued.user.currentGOOD?.data
        if (!goodData) {
          console.log(`Although, user GOOD is gone? For ${token}`)
          await prisma.calculationQueue.delete({ where: { id: queued.id } })
        } else
          return res.send({
            status: "Already queued",
            id: queued.id,
            character,
            good: mergeTemplate(goodData as unknown as GOODData, template as unknown as GOODData)
          })
      }
    }

    const experiments = await prisma.experiment.findMany({
      where: { active: true },
      orderBy: { experimentData: { _count: "asc" } },
      select: { id: true, template: true, character: true, experimentData: { select: { userId: true, GOODId: true } } },
      take: 10
    })

    const alreadyQueued = await prisma.calculationQueue.findMany({
      where: { createdOn: { gte: new Date(Date.now() - 30 * 60 * 1000) } },
      select: { experimentId: true, userId: true, GOODId: true }
    })

    const users = await prisma.user.findMany({
      where: { banned: false, currentGOOD: { verified: true } },
      orderBy: [{ admin: "desc" }, { premium: "desc" }, { experimentData: { _count: "asc" } }, { createdOn: "asc" }],
      select: { id: true, GOODId: true }
    })

    for (const experiment of experiments)
      for (const user of users)
        if (
          !alreadyQueued.some(aq => aq.experimentId == experiment.id && aq.userId == user.id && aq.GOODId == user.GOODId) &&
          !experiment.experimentData.some(ed => ed.userId == user.id && ed.GOODId == user.GOODId)
        ) {
          const good = await prisma.gOOD.findUnique({ where: { id: user.GOODId! }, select: { data: true } })
          if (!good) continue

          const queue = await prisma.calculationQueue.create({
            data: {
              computingBy: {
                connect: {
                  token
                }
              },
              experiment: {
                connect: {
                  id: experiment.id
                }
              },
              user: {
                connect: {
                  id: user.id
                }
              },
              good: {
                connect: {
                  id: user.GOODId!
                }
              }
            },
            select: { id: true }
          })

          const { character, template } = experiment
          return res.send({
            status: "New experiment found!",
            id: queue.id,
            character,
            good: mergeTemplate(good.data as unknown as GOODData, template as unknown as GOODData)
          })
        }

    return res.send({ status: "No experiment found" })
  } catch (error) {
    console.log(error)
    return res.send({ error: "An unknown error occurred!" })
  }
}
