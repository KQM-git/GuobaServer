import { PrismaClient, StaticDataline, User } from "@prisma/client"
import { parse, serialize } from "cookie"
import { GetServerSidePropsContext, GetServerSidePropsResult, PreviewData } from "next"
import { ParsedUrlQuery } from "querystring"
import { config } from "./config"
import { artifactInfo, slotInfo, statInfo } from "./data"
import { DiscordGuild, DiscordUser, EnkaData, ExperimentInfo, ExperimentInfoWithLines, GOODData, IArtifact } from "./types"
import { isGUOBAActive } from "./utils"
export const prisma = new PrismaClient()

export async function getExperimentList() {
    return await prisma.experiment.findMany({
        select: {
            name: true,
            slug: true,
            active: true
        },
        orderBy: [
            { character: "asc", },
            { name: "asc" },
            { id: "asc" },
        ],
        where: {
            public: true
        }
    })
}

export async function fetchExperimentData(slug: string) {
    return await prisma.experiment.findUnique({
        where: {
            slug
        },
        include: {
            experimentData: true,
            staticDataline: true
        }
    })
}

export async function registerOrLogin(user: DiscordUser, guilds: DiscordGuild[], token: string) {
    console.log(`Creating/updating user records for ${user.id} (${user.username}#${user.discriminator})`)
    await prisma.$transaction([
        ...guilds.map(g => prisma.guild.upsert({ where: { id: g.id }, create: { id: g.id, name: g.name }, update: { name: g.name } })),
        prisma.user.upsert({
            where: {
                id: user.id
            },
            create: {
                id: user.id,
                avatar: user.avatar ?? undefined,
                username: user.username,
                tag: user.discriminator,
                admin: user.id == "127393188729192448",
                guilds: {
                    connect: guilds.map(x => ({ id: x.id }))
                }
            },
            update: {
                avatar: user.avatar ?? undefined,
                username: user.username,
                tag: user.discriminator,
                guilds: {
                    set: guilds.map(x => ({ id: x.id }))
                }
            },
            select: { id: true }
        }),
        prisma.authentication.upsert({
            where: {
                userId: user.id
            },
            create: {
                token,
                userId: user.id
            },
            update: {
                token
            },
            select: { userId: true }
        })
    ])
}

export async function logout(cookie?: string) {
    if (!cookie) {
        return null
    }
    const token = parse(cookie)[config.cookieName]
    if (!token) {
        return null
    }
    await prisma.authentication.delete({
        where: { token }
    })
}
export async function getUserFromCtx<T>(ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>): Promise<User | GetServerSidePropsResult<T>> {
    const user = await getUserFromCookie(ctx.req.headers.cookie)

    if (!user) {
        ctx.res.setHeader(
            "Set-Cookie",
            serialize("oauth-redirect", ctx.resolvedUrl, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== "development",
                maxAge: 3600,
                sameSite: "lax",
                path: "/",
            })
        )

        return {
            redirect: {
                destination: "/api/oauth",
                permanent: false,
            }
        }
    }

    if (user.banned)
        return {
            notFound: true
        }

    return user
}

export function isUser(user: unknown): user is User {
    return !!(user as User).id
}

export async function getUserFromCookie(cookie?: string) {
    if (!cookie) {
        return null
    }
    const token = parse(cookie)[config.cookieName]
    if (!token) {
        return null
    }
    return await getUserData(token)
}

export async function getUserData(token: string) {
    return await prisma.user.findFirst({
        where: {
            authentication: {
                token
            }
        }
    })
}

export async function getUser(id: string, showAll: boolean) {
    return await prisma.user.findUnique({
        where: {
            id
        },
        include: {
            ...(showAll ? { goods:{ select: { id: true } } } : {}),
            currentGOOD: {
                select: {
                    createdOn: true,
                    hasChars: true,
                    hasWeapons: true,
                    verified: true,
                    verifiedArtifacts: true,
                    verificationArtifacts: true,
                    verifiedTime: true
                }
            },
            experimentData: {
                where: {
                    experiment: {
                        public: showAll ? undefined : true
                    }
                },
                select: {
                    createdOn: true,
                    GOODId: true,
                    computeTime: true,
                    computerId: true,
                    experiment: {
                        select: {
                            name: true,
                            slug: true,
                            template: true,
                        }
                    }
                }
            },
            affiliations: {
                select: {
                    id: true,
                    name: true,
                    sort: true,
                    description: true,
                    color: true,
                }
            }
        }
    })
}

export async function canSelfReset(user: string) {
    if (!isGUOBAActive()) return false

    const userGOOD = await prisma.gOOD.findMany({
        where: {
            ownerId: user,
            createdOn: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
        },
        select: {
            verified: true
        }
    })

    return userGOOD.length < 2 && !userGOOD.some(x => x.verified)
}

export async function addGOOD(user: string, good: GOODData, hasChars: boolean, hasWeapons: boolean, uid: string, affiliations: number[], ping: number, stablePing: boolean, arXP: number) {
    console.log(`Adding GOOD for ${user} (UID: ${uid})`)
    const oldAffiliations = await getUserAffiliations(user)

    await prisma.$transaction([
        prisma.user.update({
            where: {
                id: user
            },
            data: {
                uid,
                ping, stablePing,
                arXP,
                affiliations: {
                    disconnect: oldAffiliations?.affiliations.filter(x => !affiliations.find(a => a == x.id)) ?? [],
                    connect: affiliations.map(x => ({
                        id: x
                    }))
                }
            },
            select: { id: true }
        }),
        prisma.gOOD.create({
            data: {
                data: good as any,
                hasChars,
                hasWeapons,
                owner: {
                    connect: {
                        id: user
                    }
                },
                currentOf: {
                    connect: {
                        id: user
                    }
                }
            },
            select: { id: true }
        })
    ])
}

export async function verifyData(user: string) {
    const userInfo = await prisma.user.findUnique({
        where: { id: user },
        select: {
            uid: true,
            currentGOOD: {
                select: {
                    id: true,
                    verified: true,
                    verificationArtifacts: true,
                    verifiedArtifacts: true,
                 }
            }
        }
    })

    console.log(`Verifying user data ${user} with enka (UID: ${userInfo?.uid})...`)

    if (!userInfo || !userInfo.currentGOOD)
        throw "No user data linked?"

    if (userInfo.currentGOOD.verified)
        return true

    const enkaResponse = await (await fetch(`https://enka.network/u/${userInfo.uid}/__data.json?key=${config.enka}`, { headers: { "User-Agent": "GUOBA - Tibot/5.0" } })).json() as EnkaData
    if (!enkaResponse.playerInfo)
        throw "No data found on Enka.Network? Please try again later or contact us if this keeps persisting."

    if (!enkaResponse.avatarInfoList)
        throw "Profile is not public"

    const artifacts = enkaResponse.avatarInfoList.flatMap(x => x.equipList.filter(e => e.reliquary))

    let verifiedArtifacts = userInfo.currentGOOD.verifiedArtifacts

    ;(userInfo.currentGOOD.verificationArtifacts as any as IArtifact[]).forEach((a, i) => {
        const artifact = artifactInfo.find(x => x.artifactKey == a.setKey)
        if (!artifact) throw `Could not find artifact key ${a.setKey}`

        const slot = slotInfo.find(x => x.slotKey == a.slotKey)
        if (!slot) throw `Could not find slot key ${a.slotKey}`

        const main = statInfo.find(x => x.statKey == a.mainStatKey)
        if (!main) throw `Could not find main key ${a.mainStatKey}`

        const veriSubs = a.substats.filter(a => a.key).sort((a, b) => a.key.localeCompare(b.key))
        if (artifacts.some(({ flat }, j) => {
            if (flat.equipType != slot.data) return false
            if (!flat.icon.startsWith(`UI_RelicIcon_${artifact.data}_`)) return false
            if (flat.reliquaryMainstat?.mainPropId != main.data) return false

            const eaSubs = flat.reliquarySubstats?.filter(x => x.appendPropId).sort((a, b) => {
                const subKeyA = statInfo.find(x => x.data == a.appendPropId)
                if (!subKeyA) throw `Could not find substat ${a.appendPropId}`
                const subKeyB = statInfo.find(x => x.data == b.appendPropId)
                if (!subKeyB) throw `Could not find substat ${b.appendPropId}`

                return subKeyA.statKey.localeCompare(subKeyB.statKey)
            })
            if (!eaSubs) return false

            if (veriSubs.length != eaSubs.length) return false
            for (let i = 0; i < veriSubs.length; i++) {
                const veriSub = veriSubs[i], eaSub = eaSubs[i]

                const eaSubInfo = statInfo.find(x => x.data == eaSub.appendPropId)
                if (veriSub.key !== eaSubInfo?.statKey) return false
                const maxDiff = veriSub.key.endsWith("_") ? 0.1 : 1
                if (Math.abs(veriSub.value - eaSub.statValue) > maxDiff) return false
            }

            artifacts.splice(j, 1)
            // console.log("Verified", i, flat, a)
            return true
        }))
            verifiedArtifacts.push(i)
    })
    verifiedArtifacts = verifiedArtifacts.filter((v, i, arr) => arr.indexOf(v) == i).sort((a, b) => a - b)

    const verified = verifiedArtifacts.length == userInfo.currentGOOD.verificationArtifacts.length

    await prisma.user.update({
        where: { id: user },
        data: {
            ar: enkaResponse.playerInfo.level,
            currentGOOD: {
                update: {
                    verified,
                    verifiedArtifacts,
                    verifiedTime: new Date(),
                    enkaResponses: {
                        create: {
                            data: enkaResponse as any
                        }
                    }
                }
            }
        },
        select: { id: true }
    })

   return verified
}

export async function getGOOD(id: number) {
    return await prisma.gOOD.findUnique({
        where: { id },
        select: {
            data: true,
            verified: true,
            verificationArtifacts: true,
            verifiedArtifacts: true,
            enkaResponses: {
                orderBy: { createdOn: "desc" },
                select: { createdOn: true, data: true },
                take: 1
            }
        }
    })
}

export async function getComputers() {
    return (await prisma.computer.findMany({
        orderBy: { id: "asc" },
        include: {
            user: true,
            computerLogs: {
                orderBy: { id: "desc" },
                take: 10
            }
        }
    })).map(x => {
        x.token = "dn"
        return x
    })
}

export async function getExperiments(): Promise<ExperimentInfo[]> {
    return await prisma.experiment.findMany({
        orderBy: [
            { character: "asc", },
            { name: "asc" },
            { id: "asc" },
        ],
        include: {
            creator: true,
            _count: { select: { experimentData: true } }
        }
    })
}

export async function getExperiment(id: number): Promise<ExperimentInfoWithLines | null> {
    return await prisma.experiment.findUnique({
        where: { id },
        include: {
            creator: true,
            _count: { select: { experimentData: true } },
            staticDataline: true
        }
    })
}
export async function getUserAffiliations(user: string) {
    return await prisma.user.findUnique({
        where: { id: user },
        select: { affiliations: { select: { id: true } } }
    })
}

export async function getAffiliations(id: string) {
    const user = (await prisma.user.findUnique({
        where: {
            id
        },
        include: {
            guilds: {
                select: { id: true }
            },
            affiliations: {
                select: { id: true }
            }
        }
    }))

    return await prisma.affiliation.findMany({
        select: {
            id: true,
            name: true,
            description: true,
            sort: true,
            color: true
        },
        where: {
            OR: [{
                serverId: null
            }, {
                serverId: {
                    in: user?.guilds.map(x => x.id) ?? []
                }
            }, {
                id: {
                    in: user?.affiliations.map(x => x.id) ?? []
                }
            }]
        }
    })
}
