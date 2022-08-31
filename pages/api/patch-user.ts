import { NextApiRequest, NextApiResponse } from "next"
import { addGOOD, getUserAffiliations, getUserFromCookie, prisma } from "../../utils/db"
import { GOODData } from "../../utils/types"
import { isGOOD, isGUOBAActive, isValidSubmission } from "../../utils/utils"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.send({ error: "Method not allowed!" })
    const cookie = req.headers.cookie
    const user = await getUserFromCookie(cookie)
    if (!user) return res.send({ error: "Not logged in!" })

    try {
        const body: {
            affiliations: number[]
        } = JSON.parse(req.body)


        if (!Array.isArray(body.affiliations) || !body.affiliations.every(a => typeof a == "number") || body.affiliations.length > 3)
            return res.send({ error: "Invalid request!" })

        const oldAffiliations = await getUserAffiliations(user.id)

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                // ping, stablePing,
                // arXP,
                affiliations: {
                    disconnect: oldAffiliations?.affiliations.filter(x => !body.affiliations.find(a => a == x.id)) ?? [],
                    connect: body.affiliations.map(id => ({ id }))
                }
            },
        })
        return res.send({ ok: true })
    } catch (error) {
        return res.send({ error: "An unknown error occurred!" })
    }
}
