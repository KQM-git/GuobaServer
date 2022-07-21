import { PrismaClient, User } from "@prisma/client"
import { parse, serialize } from "cookie"
import { GetServerSidePropsContext, GetServerSidePropsResult, PreviewData } from "next"
import { ParsedUrlQuery } from "querystring"
import { config } from "./config"
import { DiscordUser, GOODData } from "./types"
export const prisma = new PrismaClient()

export async function getExperiments() {
    return await prisma.experiment.findMany({
        select: {
            id: true,
            name: true,
            active: true
        }
    })
}

export async function fetchExperimentData(experimentName: string) {
    return await prisma.experiment.findUnique({
        where: {
            id: experimentName
        },
        include: {
            experimentData: true,
            staticDataline: true
        }
    })
}

export async function registerOrLogin(user: DiscordUser, token: string) {
    console.log(`Creating/updating user records for ${user.id} (${user.username}#${user.discriminator})`)
    await prisma.user.upsert({
        where: {
            id: user.id
        },
        create: {
            id: user.id,
            avatar: user.avatar,
            username: user.username,
            tag: user.discriminator,
        },
        update: {
            avatar: user.avatar,
            username: user.username,
            tag: user.discriminator,
        }
    })
    await prisma.authentication.upsert({
        where: {
            userId: user.id
        },
        create: {
            token,
            userId: user.id
        },
        update: {
            token
        }
    })
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

export async function addGOOD(user: string, good: GOODData, hasChars: boolean, hasWeapons: boolean, uid: string) {
    console.log(`Adding GOOD for ${user} (UID: ${uid})`)
    await prisma.$transaction([
        prisma.user.update({
            where: {
                id: user
            },
            data: {
                uid
            }
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
            }
        })
    ])
}
