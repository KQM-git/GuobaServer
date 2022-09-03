import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../utils/db"
import { GOODData } from "../../utils/types"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.send({ error: "Method not allowed!" })

  try {
    const { token, id, output, computeTime } = JSON.parse(req.body)
    if (!token || typeof token != "string" || typeof id != "number" || !output || typeof computeTime !== "number") return res.send({ error: "Invalid data!" })

    const computer = await prisma.computer.findUnique({ where: { token } })
    if (computer == null) return res.send({ error: "Unknown token!" })

    console.log(`Received GOOD response for ${token.slice(0, 27)}`)
    const queued = await prisma.calculationQueue.findUnique({
      where: { id },
      include: {
        experiment: {
          select: { character: true }
        },
        good: {
          select: {
            data: true,
            hasChars: true
          }
        }
      }
    })

    if (!queued)
      return res.send({ error: "Couldn't find queue ID!" })
    if (queued.computerId !== computer.id)
      return res.send({ error: "Not your queue ID!" })

    let ownsCharacter: boolean | undefined = undefined
    if (queued.good.hasChars) {
      const good = queued.good.data as unknown as GOODData
      ownsCharacter = good.characters?.some(c => c.key == queued.experiment.character)
    }

    await prisma.$transaction([
      prisma.experimentData.create({
        data: {
          computeTime,
          dataLine: output,
          ownsCharacter,
          computedBy: {
            connect: {
              id: queued.computerId
            }
          },
          experiment: {
            connect: {
              id: queued.experimentId
            }
          },
          user: {
            connect: {
              id: queued.userId
            }
          },
          good: {
            connect: {
              id: queued.GOODId
            }
          }
        }
      }),
      prisma.calculationQueue.delete({
        where: {
          id
        }
      })
    ])

    return res.send({ status: "OK!" })
  } catch (error) {
    console.log(error)
    return res.send({ error: "An unknown error occurred!" })
  }
}
