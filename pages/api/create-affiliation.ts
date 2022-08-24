import { NextApiRequest, NextApiResponse } from "next"
import { getUserFromCookie, prisma } from "../../utils/db"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.send({ error: "Method not allowed!" })
    const cookie = req.headers.cookie
    const user = await getUserFromCookie(cookie)
    if (!user) return res.send({ error: "Not logged in!" })
    if (!user.admin) return res.send({ error: "No permission!" })

    try {
        const { name, description, color, server, sort } = JSON.parse(req.body)
        if (!name || name.length < 1) return res.send({ error: "Invalid name!" })
        if (!description || description.length < 1) return res.send({ error: "Invalid description!" })
        if (!color || !color.match(/^#[a-zA-Z0-9]+$/)) return res.send({ error: "Invalid color!" })
        if (!(server.match(/^\d{17,21}$/) || server.length == 0)) return res.send({ error: "Invalid server!" })
        if (typeof sort !== "number") return res.send({ error: "Invalid sort!" })

        console.log(`Creating affiliation ${name} for ${user.id}`)

        await prisma.affiliation.create({
            data: {
                name,
                color,
                description,
                sort,
                guild: server != "" ? {
                    connect: {
                        id: server
                    }
                } : undefined
            }
        })

        return res.send({ ok: true })
    } catch (error) {
        console.error(error)
        return res.send({ error: "An unknown error occurred!" })
    }
}
