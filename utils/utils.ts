import { NextRouter } from "next/router"
import { GOODData } from "./types"

export function urlify(input: string, shouldRemoveBrackets: boolean): string {
    if (shouldRemoveBrackets)
        input = removeBrackets(input)
    return input.toLowerCase().replace(/[():"'-]/g, "").trim().replace(/ +/g, "-")
}

export function removeBrackets(input: string) {
    return input.replace(/\(.*\)/g, "").replace(/ +:/, ":")
}

export function clean(input: string) {
    return input.replace(/ ?\$\{.*?\}/g, "").replace(/ ?\(.*?\)/g, "").replace(/[*[\]]/g, "").split("\n")[0]
}

export function isValidDataline(value: string) {
    try {
        const parsed = JSON.parse(value)
        if (!Array.isArray(parsed))
            return false
        if (parsed.some(x => !Array.isArray(x) || x.length != 2 || !x.every(v => typeof v == "number")))
            return false
        return true
    } catch (error) {
        return false
    }
}

const end = new Date("2022-09-01").getTime()
export function isGUOBAActive() {
    return Date.now() < end
}

export const artifactKeys = [
    "Adventurer", "ArchaicPetra", "Berserker", "BlizzardStrayer", "BloodstainedChivalry", "BraveHeart",
    "CrimsonWitchOfFlames", "DefendersWill", "EchoesOfAnOffering", "EmblemOfSeveredFate", "Gambler",
    "GladiatorsFinale", "HeartOfDepth", "HuskOfOpulentDreams", "Instructor", "Lavawalker", "LuckyDog",
    "MaidenBeloved", "MartialArtist", "NoblesseOblige", "OceanHuedClam", "PaleFlame", "ResolutionOfSojourner",
    "RetracingBolide", "Scholar", "ShimenawasReminiscence", "TenacityOfTheMillelith", "TheExile",
    "ThunderingFury", "Thundersoother", "TinyMiracle", "TravelingDoctor", "VermillionHereafter",
    "ViridescentVenerer", "WanderersTroupe"
]

export const charKeys = [
    "Albedo", "Aloy", "Amber", "AratakiItto", "Barbara", "Beidou", "Bennett", "Chongyun", "Diluc", "Diona",
    "Eula", "Fischl", "Ganyu", "Gorou", "HuTao", "Jean", "KaedeharaKazuha", "Kaeya", "KamisatoAyaka",
    "KamisatoAyato", "Keqing", "Klee", "KujouSara", "KukiShinobu", "Lisa", "Mona", "Ningguang", "Noelle",
    "Qiqi", "RaidenShogun", "Razor", "Rosaria", "SangonomiyaKokomi", "Sayu", "Shenhe", "ShikanoinHeizou",
    "Sucrose", "Tartaglia", "Thoma", "Traveler", "Venti", "Xiangling", "Xiao", "Xingqiu", "Xinyan", "YaeMiko",
    "Yanfei", "Yelan", "Yoimiya", "YunJin", "Zhongli"
]

export const weaponKeys = [
    "Akuoumaru", "AlleyHunter", "AmenomaKageuchi", "AmosBow", "ApprenticesNotes", "AquaSimulacra", "AquilaFavonia",
    "BeginnersProtector", "BlackTassel", "BlackcliffAgate", "BlackcliffLongsword", "BlackcliffPole",
    "BlackcliffSlasher", "BlackcliffWarbow", "BloodtaintedGreatsword", "CalamityQueller", "CinnabarSpindle",
    "CompoundBow", "CoolSteel", "CrescentPike", "DarkIronSword", "Deathmatch", "DebateClub", "DodocoTales",
    "DragonsBane", "DragonspineSpear", "DullBlade", "ElegyForTheEnd", "EmeraldOrb", "EngulfingLightning",
    "EverlastingMoonglow", "EyeOfPerception", "FadingTwilight", "FavoniusCodex", "FavoniusGreatsword",
    "FavoniusLance", "FavoniusSword", "FavoniusWarbow", "FerrousShadow", "FesteringDesire", "FilletBlade",
    "FreedomSworn", "Frostbearer", "HakushinRing", "Halberd", "Hamayumi", "HaranGeppakuFutsu", "HarbingerOfDawn",
    "HuntersBow", "IronPoint", "IronSting", "KagotsurubeIsshin", "KagurasVerity", "KatsuragikiriNagamasa",
    "KitainCrossSpear", "LionsRoar", "LithicBlade", "LithicSpear", "LostPrayerToTheSacredWinds", "LuxuriousSeaLord",
    "MagicGuide", "MappaMare", "MemoryOfDust", "Messenger", "MistsplitterReforged", "MitternachtsWaltz", "MouunsMoon",
    "OathswornEye", "OldMercsPal", "OtherworldlyStory", "PocketGrimoire", "PolarStar", "Predator", "PrimordialJadeCutter",
    "PrimordialJadeWingedSpear", "PrototypeAmber", "PrototypeArchaic", "PrototypeCrescent", "PrototypeRancour",
    "PrototypeStarglitter", "Rainslasher", "RavenBow", "RecurveBow", "RedhornStonethresher", "RoyalBow", "RoyalGreatsword",
    "RoyalGrimoire", "RoyalLongsword", "RoyalSpear", "Rust", "SacrificialBow", "SacrificialFragments", "SacrificialGreatsword",
    "SacrificialSword", "SeasonedHuntersBow", "SerpentSpine", "SharpshootersOath", "SilverSword", "SkyriderGreatsword",
    "SkyriderSword", "SkywardAtlas", "SkywardBlade", "SkywardHarp", "SkywardPride", "SkywardSpine", "Slingshot", "SnowTombedStarsilver",
    "SolarPearl", "SongOfBrokenPines", "StaffOfHoma", "SummitShaper", "SwordOfDescension", "TheAlleyFlash", "TheBell", "TheBlackSword",
    "TheCatch", "TheFlute", "TheStringless", "TheUnforged", "TheViridescentHunt", "TheWidsith", "ThrillingTalesOfDragonSlayers",
    "ThunderingPulse", "TravelersHandySword", "TwinNephrite", "VortexVanquisher", "WasterGreatsword", "WavebreakersFin",
    "WhiteIronGreatsword", "WhiteTassel", "Whiteblind", "WindblumeOde", "WineAndSong", "WolfsGravestone"
]

export const slotKeys = ["flower", "plume", "sands", "goblet", "circlet"]

export const statKeys = [
    "hp", "hp_", "atk", "atk_", "def", "def_", "eleMas", "enerRech_", "heal_", "critRate_", "critDMG_",
    "physical_dmg_", "anemo_dmg_", "geo_dmg_", "electro_dmg_", "hydro_dmg_", "pyro_dmg_", "cryo_dmg_"
]

export function mergeTemplate(userGood: GOODData, template: GOODData) {
    const good = Object.assign({}, template, { artifacts: userGood.artifacts })

    // Clean up artifact settings
    good.artifacts = good.artifacts.map(a => Object.assign(a, {
        "location": "",
        "exclude": false,
        "lock": false
    }))

    // Enable TC mode
    good.states = [{
        "tcMode": true,
        "key": "GlobalSettings"
    }]

    // Map artifact set exclusion overrides (Excluding all sets by default)
    const artifactSets = [
        "rainbow",
        ...artifactKeys
    ]
    good.buildSettings = (good.buildSettings ?? []).map(bs => {
        if (bs.artSetExclusionOverrides) {
            bs.artSetExclusion = Object.assign(
                {},
                Object.fromEntries(artifactSets.map(x => [x, [2, 4]])),
                bs.artSetExclusionOverrides
            )
            delete bs.artSetExclusionOverrides
        }
        return bs
    })

    return good
}

export function validateGOOD(input: unknown) {
    const json = input as GOODData

    if (json.format !== "GOOD")
        throw { goodError: "This isn't a GOOD file!" }
    if (json.source !== "Genshin Optimizer")
        throw { goodError: `Please import the ${json.source} output into Genshin Optimizer and export again.` }
    if (typeof json.version !== "number")
        throw { goodError: `Version ${json.version} is invalid.` }

    if (!json.artifacts)
        throw { goodError: "No artifact data provided" }

    if (!Array.isArray(json.artifacts))
        throw { goodError: "Invalid artifact data" }

    if (json.artifacts.length > 1520)
        throw { goodError: `Too many artifacts (found ${json.artifacts.length})` }

    for (const artifact of json.artifacts) {
        if (typeof artifact.setKey !== "string" || !artifactKeys.includes(artifact.setKey))
            throw { goodError: `Unknown artifact type ${artifact.setKey}` }
        // TODO check artifact specific rarity

        if (typeof artifact.slotKey !== "string" || !slotKeys.includes(artifact.slotKey))
            throw { goodError: `Unknown artifact type ${artifact.slotKey}` }

        if (typeof artifact.level !== "number" || artifact.level < 0 || artifact.level > 20)
            throw { goodError: `Invalid artifact level ${artifact.level}` }
        if (typeof artifact.rarity !== "number" || artifact.rarity < 1 || artifact.rarity > 5)
            throw { goodError: `Invalid artifact rarity ${artifact.rarity}` }


        if (typeof artifact.mainStatKey !== "string" || !statKeys.includes(artifact.mainStatKey))
            throw { goodError: `Unknown artifact stat ${artifact.mainStatKey}` }
        // TODO Check slotKey specific mainstats

        if (!Array.isArray(artifact.substats))
            throw { goodError: `Unknown artifact substats ${JSON.stringify(artifact.substats)}` }
        for (const substat of artifact.substats) {
            if (typeof substat !== "object")
                throw { goodError: `Unknown artifact substat ${JSON.stringify(substat)}` }
            if (typeof substat.key !== "string" || !["", ...statKeys].includes(substat.key))
                throw { goodError: `Unknown artifact substat type ${JSON.stringify(substat.key)}` }

            if (typeof substat.value !== "number")
                throw { goodError: `Unknown artifact substat value ${JSON.stringify(substat.key)}` }

            // TODO Check mainstat specific substats / value range
        }
    }

    if (json.characters) {
        if (!Array.isArray(json.characters))
            throw { goodError: "Invalid character data" }

        for (const char of json.characters) {
            if (typeof char.key !== "string" || !charKeys.includes(char.key))
                throw { goodError: `Unknown character ${char.key}` }
            if (json.characters.filter(c => c.key == char.key).length > 1)
                throw { goodError: `Duplicate character ${char.key}` }

            if (typeof char.level !== "number" || char.level < 1 || char.level > 90)
                throw { goodError: `Invalid character level ${char.level} for ${char.key}` }
            if (typeof char.constellation !== "number" || char.constellation < 0 || char.constellation > 6)
                throw { goodError: `Invalid character constellation ${char.constellation} for ${char.key}` }
            if (typeof char.ascension !== "number" || char.ascension < 0 || char.ascension > 6)
                throw { goodError: `Invalid character ascension ${char.ascension} for ${char.key}` }

            if (typeof char.talent !== "object")
                throw { goodError: `Invalid character talents ${JSON.stringify(char.talent)} for ${char.key}` }
            if (typeof char.talent.auto !== "number" || char.talent.auto < 0 || char.talent.auto > 10)
                throw { goodError: `Invalid character auto talent level ${char.talent.auto} for ${char.key}` }
            if (typeof char.talent.skill !== "number" || char.talent.skill < 0 || char.talent.skill > 10)
                throw { goodError: `Invalid character skill talent level ${char.talent.skill} for ${char.key}` }
            if (typeof char.talent.burst !== "number" || char.talent.burst < 0 || char.talent.burst > 10)
                throw { goodError: `Invalid character burst talent level ${char.talent.burst} for ${char.key}` }
        }
    }

    if (json.weapons) {
        if (!Array.isArray(json.weapons))
            throw { goodError: "Invalid weapon data" }

        if (json.weapons.length > 2020)
            throw { goodError: `Too many weapons (found ${json.weapons.length})` }

        for (const weapon of json.weapons) {
            if (typeof weapon.key !== "string" || !weaponKeys.includes(weapon.key))
                throw { goodError: `Unknown weapon ${weapon.key}` }

            if (typeof weapon.level !== "number" || weapon.level < 1 || weapon.level > 90)
                throw { goodError: `Invalid weapon level ${weapon.level} for ${weapon.key}` }
            if (typeof weapon.ascension !== "number" || weapon.ascension < 0 || weapon.ascension > 6)
                throw { goodError: `Invalid weapon ascension ${weapon.ascension} for ${weapon.key}` }
            if (typeof weapon.refinement !== "number" || weapon.refinement < 1 || weapon.refinement > 5)
                throw { goodError: `Invalid weapon refinement ${weapon.refinement} for ${weapon.key}` }

            // TODO Invalid weapon refinements, eh whatever
        }
    }
}

export function cleanCopy(json: GOODData): GOODData {
    return {
        format: json.format,
        version: json.version,
        source: json.source,
        artifacts: json.artifacts.map(({ setKey, slotKey, level, rarity, mainStatKey, substats }) => ({
            setKey, slotKey, level, rarity, mainStatKey,
            substats: substats.map(({ key, value }) => ({ key, value }))
        })),
        characters: json.characters ? json.characters.map(({ key, level, constellation, ascension, talent: { auto, skill, burst } }) => ({
            key, level, constellation, ascension,
            talent: {
                auto, skill, burst
            }
        })) : json.characters,
        weapons: json.weapons ? json.weapons.map(({ key, level, ascension, refinement }) => ({
            key, level, ascension, refinement
        })) : json.weapons,
    }
}

export function isGOOD(json: unknown): json is GOODData {
    try {
        validateGOOD(json)
        return true
    } catch (error) {
        return false
    }
}

export function getIfGOOD(text: string): GOODData | undefined {
    try {
        const parsed = JSON.parse(text)
        if (!isGOOD(parsed))
            return
        return parsed
    } catch (error) {
        return
    }
}

export function validateJson(text: string, chars: boolean, weapons: boolean): Record<string, string> {
    try {
        const parsed = JSON.parse(text)
        validateGOOD(parsed)
        return {
            goodError: "", goodWarn: "",
            ...validateChars(chars, text),
            ...validateWeapons(weapons, text)
        }
    } catch (error: any) {
        if (error.goodError || error.goodWarn) return error
        return { goodError: error?.toString() ?? "Unknown error", goodWarn: "" }
    }
}

export function validateChars(toggle: boolean, text: string): {} | { charError: string } {
    const parsed = getIfGOOD(text)
    if (!parsed)
        return {}

    if (toggle) {
        if (!parsed.characters)
            return { charError: "No character data provided!" }

        if (parsed.characters.length < 5)
            return { charError: `Character data might be incomplete! Data only contains ${parsed.characters.length} character(s)!` }

        for (const required of ["Traveler", "Amber", "Kaeya", "Lisa", "Barbara", "Xiangling"])
            if (!parsed.characters.some(x => x.key == required))
                return { charError: `Character data might be incomplete! Data doesn't contain ${required == "Traveler" ? "the Traveler" : required}!` }
    }

    return { charError: "" }
}

export function validateWeapons(toggle: boolean, text: string): {} | { weaponError: string } {
    const parsed = getIfGOOD(text)
    if (!parsed)
        return {}

    if (toggle) {
        if (!parsed.weapons)
            return { weaponError: "No weapon data provided!" }

        if (parsed.weapons.length < 10)
            return { weaponError: `Weapon data might be incomplete! Data only contains ${parsed.weapons.length} weapon(s)!` }
    }

    return { weaponError: "" }
}

export function validateUID(uid: string) {
    if (uid.length !== 9)
        return { uidError: "Incomplete UID" }
    if (!uid.match(/^\d+$/))
        return { uidError: "Invalid UID" }
    if (!uid.match(/^[6-9]([0-9]{8})$/))
        return { uidError: "Unknown server" }

    return { uidError: "" }
}

export function isValidSubmission(goodText: string, chars: boolean, weapons: boolean, uid: string) {
    return !Object.values({
        ...validateJson(goodText, chars, weapons),
        ...validateUID(uid)
    }).some(x => x && x.length > 0)
}

export const dateFormatter = new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", weekday: "short" })

export function copy(contents: string) {
    navigator.clipboard.writeText(contents)
}

export function download(filename: string, contents: string, mime = "text/plain") {
    const blob = new Blob([contents], { type: mime }), url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    document.body.appendChild(link) // Firefox requires the link to be in the body
    link.download = filename
    link.href = url
    link.click()
    document.body.removeChild(link) // remove the link when done
    URL.revokeObjectURL(url)
}

export async function doFetch(url: `/api/${string}`, body: string, setToast: (response: string) => void, router: NextRouter) {
    try {
        const response = await (await fetch(url, {
            method: "POST",
            body
        })).json()

        if (response.error) {
            setToast(response.error)
            return
        }
        if (response.redirect) {
            router.push(response.redirect)
            return
        }
        if (response.ok) {
            router.reload()
            return
        }
        setToast("Unknown response")
    } catch (error) {
        setToast(`An error occurred:\n${error}`)
    }
}
