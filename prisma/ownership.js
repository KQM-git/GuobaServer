const { PrismaClient } = require("@prisma/client")

async function main() {
    const prisma = new PrismaClient()

    const data = await prisma.experimentData.findMany({
        orderBy: {
            GOODId: "asc"
        },
        select: {
            experiment: {
                select: {
                    character: true
                }
            },
            id: true,
            GOODId: true,
            ownsCharacter: true
        }
    })

    let lastGood = undefined

    for (const ed of data) {
        if (ed.GOODId !== lastGood?.id) {
            lastGood = await prisma.gOOD.findUnique({
                where: {
                    id: ed.GOODId
                },
                select: {
                    hasChars: true,
                    data: true,
                    id: true
                }
            })
        }

        if (!lastGood || !lastGood.hasChars) continue
        if (!lastGood.data.characters) continue

        console.log(`Converting data ${ed.id} w/ good ${ed.GOODId}, ${lastGood.id}: ${lastGood.hasChars}`)

        const ownsCharacter = lastGood.data.characters.some(x => x.key == ed.experiment.character)
        if (ed.ownsCharacter === ownsCharacter) continue

        await prisma.experimentData.update({
            where: {
                id: ed.id
            },
            data: {
                ownsCharacter
            }
        })
    }
}

main()
