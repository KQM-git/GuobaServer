import { NextApiRequest, NextApiResponse } from "next"
import { canSelfReset, getUserFromCookie, prisma } from "../../utils/db"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.send({ error: "Method not allowed!" })
    const cookie = req.headers.cookie
    const user = await getUserFromCookie(cookie)
    if (!user) return res.send({ error: "Not logged in!" })
    if (!await canSelfReset(user.id)) return res.send({ error: "Unable to self reset!" })

    try {
        console.log(`Self-unlinking good for ${user.id}`)

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                currentGOOD: {
                    disconnect: true
                }
            }
        })

        return res.send({ redirect: "/user/submit" })
    } catch (error) {
        return res.send({ error: "An unknown error occurred!" })
    }
}
