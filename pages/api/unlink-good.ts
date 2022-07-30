import { NextApiRequest, NextApiResponse } from "next"
import { getUserFromCookie, prisma } from "../../utils/db"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.send({ error: "Method not allowed!" })
    const cookie = req.headers.cookie
    const user = await getUserFromCookie(cookie)
    if (!user) return res.send({ error: "Not logged in!" })
    if (!user.admin) return res.send({ error: "No permission!" })

    try {
        const { target } = JSON.parse(req.body)
        if (!target) return res.send({ error: "Invalid id?" })

        console.log(`Unlinking good for ${target} for ${user.id}`)

        await prisma.user.update({
            where: {
                id: target
            },
            data: {
                currentGOOD: {
                    disconnect: true
                }
            }
        })

        return res.send({ ok: true })
    } catch (error) {
        return res.send({ error: "An unknown error occurred!" })
    }
}
