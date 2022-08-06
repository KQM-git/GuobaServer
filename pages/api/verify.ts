import { NextApiRequest, NextApiResponse } from "next"
import { getUserFromCookie, verifyData } from "../../utils/db"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.send({ error: "Method not allowed!" })
    const cookie = req.headers.cookie
    const user = await getUserFromCookie(cookie)
    if (!user) return res.send({ error: "Not logged in!" })

    try {
        if (await verifyData(user.id))
            return res.send({ redirect: "/user/processing" })
        return res.send({ ok: "Not fully verified" })
    } catch (error) {
        return res.send({ error: "An unknown error occurred!" })
    }
}
