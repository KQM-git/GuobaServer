import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../utils/db"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.send({ error: "Method not allowed!" })

    try {
        const { id } = req.query
        if (!id || typeof id != "string" || isNaN(+id)) return res.send({ error: "Invalid data!" })
        console.log(`Fetching GOOD ${id}`)

        const data = await prisma.gOOD.findUnique({
            where: { id: +id },
            select: { data: true }
        })
        if (!data) return res.status(404).send({ error: "Not found" })

        return res.setHeader("Cache-Control", "public, max-age=604800").send(data.data)
    } catch (error) {
        return res.send({ error: "An unknown error occurred!" })
    }
}
