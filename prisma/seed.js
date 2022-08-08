const { PrismaClient } = require("@prisma/client")
const { readdir, readFile } = require("fs/promises")

const goodFolder = "../good"

async function main() {
    const prisma = new PrismaClient()

    const folder = await readdir(goodFolder)
    const users = folder.filter(user => user.endsWith(".json"))

    let i = 0
    for (const user of users) {
        if (i++ % 50 == 0)
            console.log(`Creating ${i}/${users.length} users...`)

        await prisma.user.create({
            data: {
                avatar: "",
                id: user,
                tag: "1234",
                username: "Legacy user",
                currentGOOD: {
                    create: {
                        data: JSON.parse(await readFile(`${goodFolder}/${user}`)),
                        verified: true
                    }
                }
            }
        })
    }
}

main()
