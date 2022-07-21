import { serialize } from "cookie"
import { NextApiRequest, NextApiResponse } from "next"
import { config } from "../../utils/config"
import { logout } from "../../utils/db"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.redirect("/")
    const cookie = req.headers.cookie
    await logout(cookie)
    res.setHeader(
        "Set-Cookie",
        serialize(config.cookieName, "", {
          httpOnly: true,
          secure: process.env.NODE_ENV !== "development",
          sameSite: "lax",
          path: "/",
        })
      )

    return res.status(204).send("")
}
