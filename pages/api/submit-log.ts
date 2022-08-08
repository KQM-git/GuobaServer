import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../utils/db"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.send({ error: "Method not allowed!" })

    try {
        const { token, log, serverTime } = JSON.parse(req.body)
        if (!token || typeof token != "string" || !log || typeof log != "string" || !serverTime || typeof serverTime != "number" ) return res.send({ error: "Invalid data!" })

        console.log(`Received computer log for ${token.slice(0, 27)}: ${log}`)
        await prisma.computerLogs.create({
            data: {
                log,
                serverTime: new Date(serverTime),
                computer: {
                    connect: { token }
                }
            },
            select: { id: true }
        })
        return res.send({ ok: true })
    } catch (error) {
        return res.send({ error: "An unknown error occurred!" })
    }
}
