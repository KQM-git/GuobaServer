import { NextApiRequest, NextApiResponse } from "next"
import { getUserFromCookie, prisma } from "../../utils/db"
import { isValidDataline } from "../../utils/utils"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.send({ error: "Method not allowed!" })
    const cookie = req.headers.cookie
    const user = await getUserFromCookie(cookie)
    if (!user) return res.send({ error: "Not logged in!" })
    if (!user.admin) return res.send({ error: "No permission!" })

    try {
        const { id, experimentId, name, data } = JSON.parse(req.body)

        if (id && data === null) {
            console.log(`Deleting dataline ${name} (${id} / ${experimentId}) for ${user.id}`)
            await prisma.staticDataline.delete({ where: { id } })
            return res.send({ ok: true })
        }

        if (!name) return res.send({ error: "Invalid name!" })
        if (typeof data !== "string" || !isValidDataline(data)) return res.send({ error: "Invalid data!" })

        console.log(`Updating dataline ${name} (${id} / ${experimentId}) for ${user.id}`)

        if (id)
            await prisma.staticDataline.upsert({
                where: {
                    id
                },
                create: {
                    name,
                    dataLine: JSON.parse(data),
                    experiment: { connect: { id: experimentId } }
                },
                update: {
                    name,
                    dataLine: JSON.parse(data)
                }
            })
        else await prisma.staticDataline.create({
            data: {
                name,
                dataLine: JSON.parse(data),
                experiment: { connect: { id: experimentId } }
            }
        })

        return res.send({ ok: true })
    } catch (error) {
        return res.send({ error: "An unknown error occurred!" })
    }
}
