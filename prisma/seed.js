const { PrismaClient } = require("@prisma/client")
const { readdir, readFile } = require("fs/promises")

const folder = "../good"

async function main() {
    const prisma = new PrismaClient()

    const folder = await readdir(folder)

    console.log("Creating users...")
    await prisma.user.createMany({
        data: await Promise.all(folder.filter(user => user.endsWith(".json")).map(async (user) => ({
            avatar: "",
            id: user,
            tag: "1234",
            username: "Legacy user",
            currentGOOD: {
                create: {
                    data: JSON.parse(await readFile(`${folder}/${user}`)),
                    verified: true
                }
            }
        })))
    })
}

main()
