import { NextApiRequest, NextApiResponse } from "next"
import { addGOOD, getUserFromCookie } from "../../utils/db"
import { GOODData } from "../../utils/types"
import { isGOOD, isValidSubmission } from "../../utils/utils"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.send({ error: "Method not allowed!" })
    const cookie = req.headers.cookie
    const user = await getUserFromCookie(cookie)
    if (!user) return res.send({ error: "Not logged in!" })

    try {
        const body: {
            hasChars: boolean,
            hasWeapons: boolean
            uid: string
            good: GOODData
        } = JSON.parse(req.body)

        if (typeof body.hasChars !== "boolean" || typeof body.hasWeapons !== "boolean" || typeof body.uid !== "string" || !isGOOD(body.good))
            return res.send({ error: "Invalid request!" })

        if (!isValidSubmission(JSON.stringify(body.good), body.hasChars, body.hasWeapons, body.uid))
            return res.send({ error: "Invalid request!" })

        await addGOOD(user.id, body.good, body.hasChars, body.hasWeapons, body.uid)
        return res.send({ redirect: "/user/verification" })
    } catch (error) {
        return res.send({ error: "An unknown error occurred!" })
    }
}
