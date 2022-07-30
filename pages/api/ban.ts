import { NextApiRequest, NextApiResponse } from "next"
import { getUserFromCookie, prisma } from "../../utils/db"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.send({ error: "Method not allowed!" })
    const cookie = req.headers.cookie
    const user = await getUserFromCookie(cookie)
    if (!user) return res.send({ error: "Not logged in!" })
    if (!user.admin) return res.send({ error: "No permission!" })

    try {
        const { target, banned } = JSON.parse(req.body)
        if (!target || typeof banned !== "boolean") return res.send({ error: "Invalid id?" })

        const targetUser = await prisma.user.findUnique({
            where:{ id: target },
            select: { admin: true }
        })

        if (targetUser?.admin) return res.send({ error: "Cannot ban admins" })

        console.log(`Setting banned to ${banned} for ${target} by ${user.id}`)

        await prisma.user.update({
            where: {
                id: target
            },
            data: {
                banned
            }
        })

        return res.send({ ok: true })
    } catch (error) {
        return res.send({ error: "An unknown error occurred!" })
    }
}
