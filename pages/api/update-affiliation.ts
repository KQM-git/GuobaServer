import { NextApiRequest, NextApiResponse } from "next"
import { getUserFromCookie, prisma } from "../../utils/db"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.send({ error: "Method not allowed!" })
    const cookie = req.headers.cookie
    const user = await getUserFromCookie(cookie)
    if (!user) return res.send({ error: "Not logged in!" })
    if (!user.admin) return res.send({ error: "No permission!" })

    try {
        const { name, description, color, server, id } = JSON.parse(req.body)
        if (!id) return res.send({ error: "Invalid ID!" })
        if (!name || name.length < 1) return res.send({ error: "Invalid name!" })
        if (!description || description.length < 1) return res.send({ error: "Invalid description!" })
        if (!color || !color.match(/^#[a-zA-Z0-9]+$/)) return res.send({ error: "Invalid color!" })
        if (!(server.match(/^\d{17,21}$/) || server.length == 0)) return res.send({ error: "Invalid server!" })

        console.log(`Creating affiliation ${name} for ${user.id}`)

        await prisma.affiliation.update({
            where: {
                id: +id
            },
            data: {
                name,
                color,
                description,
                serverId: server == "" ? null : server
            }
        })

        return res.send({ ok: true })
    } catch (error) {
        return res.send({ error: "An unknown error occurred!" })
    }
}
