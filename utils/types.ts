import { Computer, ComputerLogs, Experiment, User } from "@prisma/client"

export interface DiscordUser {
    id: string
    username: string
    avatar: string
    discriminator: string
    public_flags: number
    flags: number
    locale: string
    mfa_enabled: boolean
    premium_type: number
}

export interface DiscordGuild {
    id: string
    name: string
}

export interface GOODData {
    format: "GOOD" // A way for people to recognize this format.
    version: number // GOOD API version.
    source: string // The app that generates this data.
    artifacts: IArtifact[]
    characters?: ICharacter[]
    weapons?: IWeapon[]
    /*
    materials?: { // Added in version 2
        [key: string]: number
    }
    */

    // GO Settings
    states?: any[]
    buildSettings?: any[]
}

interface IArtifact {
    setKey: string // e.g. "GladiatorsFinale"
    slotKey: SlotKey // e.g. "plume"
    level: number // 0-20 inclusive
    rarity: number // 1-5 inclusive
    mainStatKey: string
    // location: string | "" // where "" means not equipped.
    // lock: boolean // Whether the artifact is locked in game.
    substats: ISubstat[]
}

interface ISubstat {
    key: string // e.g. "critDMG_"
    value: number // e.g. 19.4
}

type SlotKey = "flower" | "plume" | "sands" | "goblet" | "circlet"

interface IWeapon {
    key: string // "CrescentPike"
    level: number // 1-90 inclusive
    ascension: number // 0-6 inclusive. need to disambiguate 80/90 or 80/80
    refinement: number // 1-5 inclusive
    location?: string | "" // where "" means not equipped.
    lock?: boolean // Whether the weapon is locked in game.
}

interface ICharacter {
    key: string // e.g. "Rosaria"
    level: number // 1-90 inclusive
    constellation: number // 0-6 inclusive
    ascension: number // 0-6 inclusive. need to disambiguate 80/90 or 80/80
    talent: { // does not include boost from constellations. 1-15 inclusive
        auto: number
        skill: number
        burst: number
    }
    conditional?: { [k: string]: any }
    customMultiTarget?: any[]
}

export type ComputerInfo = Computer & {
    user: User
    computerLogs: ComputerLogs[]
}

export type ExperimentInfo = Experiment & {
    creator: User
    _count: {
        experimentData: number
    }
}

export type UserInfo = User & {
    _count: {
        experimentData: number
    }
    affiliations: PartialAffiliation[],
    currentGOOD: {
        verified: boolean
    } | null
}

export type DetailedUserInfo = User & {
    experimentData: {
        experiment: {
            name: string
            slug: string
            template: any // Should be GOODData
        }
        GOODId: number
        createdOn: Date
        computeTime: number
        computerId: number
    }[]
    currentGOOD: {
        createdOn: Date
        hasChars: boolean
        hasWeapons: boolean
        verified: boolean
        verificationArtifacts: any[]
        verifiedTime: Date | null
    } | null
    affiliations: PartialAffiliation[]
}

export interface SmallExperimentMeta {
    name: string
    slug: string
    active: boolean
}

export interface PartialAffiliation {
    id: number
    name: string
    description: string
    color: string
}

export interface ExperimentData {
    id: string
    GOODId: number
    username: string
    tag: string
    avatar: string
    stats: [number, number][]
    affiliations: number[]
    ar: number
}
