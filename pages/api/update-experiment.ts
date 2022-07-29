import { NextApiRequest, NextApiResponse } from "next"
import { getUserFromCookie, prisma } from "../../utils/db"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.send({ error: "Method not allowed!" })
    const cookie = req.headers.cookie
    const user = await getUserFromCookie(cookie)
    if (!user) return res.send({ error: "Not logged in!" })
    if (!user.admin) return res.send({ error: "No permission!" })

    try {
        const { id, name, slug, active, publicExp } = JSON.parse(req.body)
        if (!id) return res.send({ error: "Invalid id?" })
        if (!name) return res.send({ error: "Invalid name!" })
        if (!slug || !slug.match(/^[a-z0-9-]+$/)) return res.send({ error: "Invalid slug!" })
        if (typeof active != "boolean") return res.send({ error: "Invalid active state!" })
        if (typeof publicExp != "boolean") return res.send({ error: "Invalid public state!" })

        console.log(`Updating experiment ${name} for ${user.id}`)

        await prisma.experiment.update({
            where: {
                id
            },
            data: {
                name,
                slug,
                active,
                public: publicExp
            }
        })

        return res.send({ ok: true })
    } catch (error) {
        return res.send({ error: "An unknown error occurred!" })
    }
}
