import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../utils/db"
import { GOODData } from "../../utils/types"
import { mergeTemplate } from "../../utils/utils"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.send({ error: "Method not allowed!" })

  try {
    const { token, id, output, computeTime } = JSON.parse(req.body)
    if (!token || typeof token != "string" || typeof id != "number" || !output || typeof computeTime !== "number") return res.send({ error: "Invalid data!" })

    const computer = await prisma.computer.findUnique({ where: { token } })
    if (computer == null) return res.send({ error: "Unknown token!" })

    console.log(`Received GOOD response for ${token}`)
    const queued = await prisma.calculationQueue.findUnique({
      where: { id },
    })

    if (!queued)
      return res.send({ error: "Couldn't find queue ID!" })
    if (queued.computerId !== computer.id)
      return res.send({ error: "Not your queue ID!" })

    await prisma.$transaction([
      prisma.experimentData.create({
        data: {
          computeTime,
          dataLine: output,
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
