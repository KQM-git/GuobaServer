import { PrismaClient, User } from "@prisma/client"
import { parse, serialize } from "cookie"
import { GetServerSidePropsContext, GetServerSidePropsResult, PreviewData } from "next"
import { ParsedUrlQuery } from "querystring"
import { config } from "./config"
import { DiscordGuild, DiscordUser, ExperimentInfo, GOODData } from "./types"
export const prisma = new PrismaClient()

export async function getExperimentList() {
    return await prisma.experiment.findMany({
        select: {
            name: true,
            slug: true,
            active: true
        },
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
                avatar: user.avatar,
                username: user.username,
                tag: user.discriminator,
                admin: user.id == "127393188729192448",
                guilds: {
                    connect: guilds.map(x => ({ id: x.id }))
                }
            },
            update: {
                avatar: user.avatar,
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
                    description: true,
                    color: true,
                }
            }
        }
    })
}

export async function addGOOD(user: string, good: GOODData, hasChars: boolean, hasWeapons: boolean, uid: string, affiliations: number[], ping: number, stablePing: boolean) {
    console.log(`Adding GOOD for ${user} (UID: ${uid})`)
    await prisma.$transaction([
        prisma.user.update({
            where: {
                id: user
            },
            data: {
                uid,
                ping, stablePing,
                affiliations: {
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
    console.log(`Verifying user data ${user}`)
    const current = await prisma.user.findUnique({
        where: { id: user },
        select: {
            currentGOOD: {
                select: { id: true }
            }
        }
    })

    if (!current || !current.currentGOOD)
        return false

    await prisma.gOOD.update({
        where: { id: current.currentGOOD.id },
        data: {
            // TODO store enka
            verified: true,
            verifiedTime: new Date()
        },
        select: { id: true }
    })
}

export async function getGOOD(id: number) {
    return await prisma.gOOD.findUnique({
        where: { id }
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
        orderBy: { id: "asc" },
        include: {
            creator: true,
            _count: { select: { experimentData: true } }
        }
    })
}

export async function getExperiment(id: number): Promise<ExperimentInfo | null> {
    return await prisma.experiment.findUnique({
        where: { id },
        include: {
            creator: true,
            _count: { select: { experimentData: true } }
        }
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
