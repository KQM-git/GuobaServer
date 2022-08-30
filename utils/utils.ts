import { NextRouter } from "next/router"
import { artifactInfo, slotInfo } from "./data"
import { GOODData, IArtifact, SubStatKey } from "./types"

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

const start = new Date("2022-08-30T21:00:00Z").getTime()
const end   = new Date("2022-09-06T20:59:59Z").getTime()
export function isGUOBAActive() {
    return Date.now() > start && Date.now() < end
}

export const artifactKeys = artifactInfo.map(x => x.artifactKey)

export const charKeys = [
    "Albedo", "Aloy", "Amber", "AratakiItto", "Barbara", "Beidou", "Bennett", "Chongyun", "Diluc", "Diona",
    "Eula", "Fischl", "Ganyu", "Gorou", "HuTao", "Jean", "KaedeharaKazuha", "Kaeya", "KamisatoAyaka",
    "KamisatoAyato", "Keqing", "Klee", "KujouSara", "KukiShinobu", "Lisa", "Mona", "Ningguang", "Noelle",
    "Qiqi", "RaidenShogun", "Razor", "Rosaria", "SangonomiyaKokomi", "Sayu", "Shenhe", "ShikanoinHeizou",
    "Sucrose", "Tartaglia", "Thoma", "Traveler", "Venti", "Xiangling", "Xiao", "Xingqiu", "Xinyan", "YaeMiko",
    "Yanfei", "Yelan", "Yoimiya", "YunJin", "Zhongli",
    "Collei", "Tighnari", "Dori"
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
    "WhiteIronGreatsword", "WhiteTassel", "Whiteblind", "WindblumeOde", "WineAndSong", "WolfsGravestone",
    "EndOfTheLine", "ForestRegalia", "FruitOfFulfillment", "HuntersPath", "KingsSquire", "Moonpiercer", "SapwoodBlade"
]

export const slotKeys = slotInfo.map(x => x.slotKey)

export const mainStatKeys = [
    "hp", "atk", "hp_", "atk_", "def_", "eleMas", "enerRech_", "heal_", "critRate_", "critDMG_",
    "physical_dmg_", "anemo_dmg_", "geo_dmg_", "electro_dmg_", "hydro_dmg_", "pyro_dmg_", "cryo_dmg_", "dendro_dmg_"
]

export const substats: Record<SubStatKey, number> = {
    "hp": 298.75,
    "hp_": 5.83,
    "atk": 19.45,
    "atk_": 5.83,
    "def": 23.15,
    "def_": 7.29,
    "enerRech_": 6.48,
    "eleMas": 23.31,
    "critRate_": 3.89,
    "critDMG_": 7.77,
}

export function pickArtifacts(userGood: GOODData) {
    const value = userGood.artifacts.sort((a, b) => getRVValue(b) - getRVValue(a)).slice(0)
    const sum = userGood.artifacts.sort((a, b) => getRVSum(b) - getRVSum(a) || getRVValue(b) - getRVValue(a)).slice(0, 2)
    const max = userGood.artifacts.sort((a, b) => getRVMax(b) - getRVMax(a) || getRVValue(b) - getRVValue(a)).slice(0, 1)

    const final: IArtifact[] = [
        ...sum.splice(0, 1),
        ...max,
        ...value.slice(0, 6),
        ...sum,
        ...value,
    ].filter((v, i, arr) => arr.indexOf(v) == i)
     .filter((v, i, arr) => arr.filter((a, j) => j < i && a.slotKey == v.slotKey).length < 3)
     .slice(0, 9)
     .sort((a, b) => slotKeys.indexOf(a.slotKey) - slotKeys.indexOf(b.slotKey) || getRVValue(b) - getRVValue(a))

    return final
}

const value: Record<SubStatKey, number> = {
    "hp":   0.9,
    "hp_":  1.5,
    "atk":  0.9,
    "atk_": 1.5,
    "def":  0.9,
    "def_": 1.5,
    "enerRech_": 3,
    "eleMas": 3,
    "critRate_": 4,
    "critDMG_": 4,
}

const multi: Record<string, number|undefined> = {
    "hp": 0.9,
    "atk": 0.9,

    "hp_": 0.95,
    "atk_": 0.95,
    "def_": 0.95,

    "physical_dmg_": 1.15,
    "anemo_dmg_": 1.15,
    "geo_dmg_": 1.15,
    "electro_dmg_": 1.15,
    "hydro_dmg_": 1.15,
    "pyro_dmg_": 1.15,
    "cryo_dmg_": 1.15,

    "critRate_": 1.2,
    "critDMG_": 1.2,

    "dendro_dmg_": 1.3,
}

export function getRVValue(artifact: IArtifact) {
    const mult = multi[artifact.mainStatKey] ?? 1
    return getSubs(artifact).reduce((p, c) => p + (c.value / substats[c.key] * value[c.key]), 0) * mult
}

export function getRVSum(artifact: IArtifact) {
    return getSubs(artifact).reduce((p, c) => p + (c.value / substats[c.key]), 0)
}

export function getRVMax(artifact: IArtifact) {
    return Math.max(...getSubs(artifact).map(c =>c.value / substats[c.key]))
}

export function getSubs(artifact: IArtifact) {
    return artifact.substats.filter(x => x.key !== null && x.key.length > 0)
}

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

export function validateGOOD(input: unknown, artifacts: boolean = true) {
    const json = input as GOODData

    if (json.format !== "GOOD")
        throw { goodError: "This isn't a GOOD file!" }
    if (json.source !== "Genshin Optimizer")
        throw { goodError: `Please import the ${json.source} output into Genshin Optimizer and export again.` }
    if (typeof json.version !== "number")
        throw { goodError: `Version ${json.version} is invalid.` }

    if (artifacts) {
        if (!json.artifacts)
            throw { goodError: "No artifact data provided" }

        if (!Array.isArray(json.artifacts))
            throw { goodError: "Invalid artifact data" }

        if (json.artifacts.length > 1520)
            throw { goodError: `Too many artifacts (found ${json.artifacts.length})` }

        if (json.artifacts.length < 10)
            throw { goodError: `Not enough artifacts provided (found ${json.artifacts.length}) - Please add more artifacts, we need the data for lunch ;-).` }

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


            if (typeof artifact.mainStatKey !== "string" || !mainStatKeys.includes(artifact.mainStatKey))
                throw { goodError: `Unknown artifact stat ${artifact.mainStatKey}` }
            // TODO Check slotKey specific mainstats

            if (!Array.isArray(artifact.substats))
                throw { goodError: `Unknown artifact substats ${JSON.stringify(artifact.substats)}` }
            for (const substat of artifact.substats) {
                if (typeof substat !== "object")
                    throw { goodError: `Unknown artifact substat ${JSON.stringify(substat)}` }
                if (typeof substat.key !== "string" || !["", ...Object.keys(substats)].includes(substat.key))
                    throw { goodError: `Unknown artifact substat type ${JSON.stringify(substat.key)}` }

                if (typeof substat.value !== "number")
                    throw { goodError: `Unknown artifact substat value ${JSON.stringify(substat.key)}` }

                // TODO Check mainstat specific substats / value range
            }
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

export function isGOOD(json: unknown, artifacts: boolean = true): json is GOODData {
    try {
        validateGOOD(json, artifacts)
        return true
    } catch (error) {
        return false
    }
}

export function getIfGOOD(text: string, artifacts: boolean = true): GOODData | undefined {
    try {
        const parsed = JSON.parse(text)
        if (!isGOOD(parsed, artifacts))
            return
        return parsed
    } catch (error) {
        return
    }
}

export function validateJson(text: string, chars: boolean, weapons: boolean, artifacts: boolean = true): Record<string, string> {
    try {
        const parsed = JSON.parse(text)
        validateGOOD(parsed, artifacts)
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
    if (!uid.match(/^[125-9][0-9]{8}$/))
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

// https://github.com/sveinn-steinarsson/flot-downsample
export function decimate(data: [number, number][], threshold: number): [number, number][] {
    const data_length = data.length
    if (threshold >= data_length || threshold == 0) {
        return data // Nothing to do
    }

    const sampled: [number, number][] = []
    let sampled_index = 0

    // Bucket size. Leave room for start and end data points
    const every = (data_length - 2) / (threshold - 2)

    let a = 0,  // Initially a is the first point in the triangle
        max_area_point,
        max_area,
        area,
        next_a

    sampled[sampled_index++] = data[a] // Always add the first point

    for (let i = 0; i < threshold - 2; i++) {

        // Calculate point average for next bucket (containing c)
        let avg_x = 0,
            avg_y = 0,
            avg_range_start = Math.floor((i + 1) * every) + 1,
            avg_range_end = Math.floor((i + 2) * every) + 1
        avg_range_end = avg_range_end < data_length ? avg_range_end : data_length

        const avg_range_length = avg_range_end - avg_range_start

        for (; avg_range_start < avg_range_end; avg_range_start++) {
            avg_x += data[avg_range_start][0] * 1 // * 1 enforces Number (value may be Date)
            avg_y += data[avg_range_start][1] * 1
        }
        avg_x /= avg_range_length
        avg_y /= avg_range_length

        // Get the range for this bucket
        let range_offs = Math.floor((i + 0) * every) + 1
        const range_to = Math.floor((i + 1) * every) + 1

        // Point a
        const point_a_x = data[a][0] * 1, // enforce Number (value may be Date)
            point_a_y = data[a][1] * 1

        max_area = area = -1

        for (; range_offs < range_to; range_offs++) {
            // Calculate triangle area over three buckets
            area = Math.abs((point_a_x - avg_x) * (data[range_offs][1] - point_a_y) -
                (point_a_x - data[range_offs][0]) * (avg_y - point_a_y)
            ) * 0.5
            if (area > max_area) {
                max_area = area
                max_area_point = data[range_offs]
                next_a = range_offs // Next a is this b
            }
        }

        if (max_area_point)
            sampled[sampled_index++] = max_area_point // Pick this point from the bucket
        if (next_a)
            a = next_a // This a is the next a (chosen b)
    }

    sampled[sampled_index++] = data[data_length - 1] // Always add last

    return sampled
}
