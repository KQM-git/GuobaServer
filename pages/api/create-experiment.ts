import { NextApiRequest, NextApiResponse } from "next"
import { getUserFromCookie, prisma } from "../../utils/db"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.send({ error: "Method not allowed!" })
    const cookie = req.headers.cookie
    const user = await getUserFromCookie(cookie)
    if (!user) return res.send({ error: "Not logged in!" })
    if (!user.admin) return res.send({ error: "No permission!" })

    try {
        const { name, slug, char, template, x, y, notes } = JSON.parse(req.body)
        if (!char || char.includes(" ")) return res.send({ error: "Invalid character!" })
        if (!name) return res.send({ error: "Invalid name!" })
        if (!slug || !slug.match(/^[a-z0-9-]+$/)) return res.send({ error: "Invalid slug!" })
        if (!template || template.source !== "Genshin Optimizer") return res.send({ error: "Invalid template!" })
        if (typeof x != "string") return res.send({ error: "Invalid x!" })
        if (typeof y != "string" || !y) return res.send({ error: "Invalid y!" })
        if (typeof notes != "string") return res.send({ error: "Invalid notes!" })

        console.log(`Creating experiment ${name} for ${user.id}`)

        await prisma.experiment.create({
            data: {
                character: char,
                name,
                slug,
                template,
                x,
                y,
                note: notes,
                creator: {
                    connect: {
                        id: user.id
                    }
                }
            }
        })

        return res.send({ ok: true })
    } catch (error) {
        return res.send({ error: "An unknown error occurred!" })
    }
}
