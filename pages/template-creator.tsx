import Head from "next/head"
import Link from "next/link"
import { useEffect, useState } from "react"
import FormattedLink from "../components/FormattedLink"
import { SelectInput } from "../components/Input"
import { GOODData } from "../utils/types"
import { copy, getIfGOOD, validateGOOD, validateJson } from "../utils/utils"


export default function TemplateCreatorPage() {
  const desc = "Create templates for GUOBA"

  const [toast, setToast] = useState("")
  const [goodText, setGoodText] = useState("")
  const [char, setChar] = useState("")

  const good = getIfGOOD(goodText, false)
  const template = good ? createTemplate(good, char) : undefined
  const validation = validateJson(goodText, false, false, false)

  async function update(file?: File) {
    if (!file) return
    if (file.size > 10_000_000) return
    const buffer = await file.arrayBuffer()
    const text = new TextDecoder().decode(buffer)
    setGoodText(text)
  }

  useEffect(() => {
    if (toast.length > 0)
      setTimeout(() => {
        setToast("")
      }, 10000)
  }, [toast])

  return (
    <main className="max-w-6xl w-full px-1">
      <Head>
        <title>Template Creator | The GUOBA Project</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Template Creator | The GUOBA Project" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <div className="text-sm breadcrumbs">
        <ul>
          <li><Link href={"/"}>Home</Link></li>
          <li>Template creator</li>
        </ul>
      </div>

      <h1 className="text-4xl font-semibold pb-2">Template creator</h1>
      <div className="font-semibold">GOOD File</div>
      <div className="flex w-full">
        <div
          className={`flex-grow rounded-box place-items-center ${validation.goodError ? "tooltip tooltip-error tooltip-open" :
            validation.goodWarn ? "tooltip tooltip-warning" : ""
            }`}
          suppressHydrationWarning
          data-tip={validation.goodError || validation.goodWarn}
        >
          <textarea
            className={`textarea textarea-bordered w-full font-mono ${validation.goodError ? "textarea-error" : ""} ${validation.goodWarn ? "textarea-warning" : ""}`}
            placeholder="Paste your GOOD json here"
            value={goodText}
            onChange={e => setGoodText(e.target.value)}
          />
        </div>
        <div className="divider divider-horizontal" />
        <label className="flex justify-center px-4 border-2 border-dashed rounded-md cursor-pointer appearance-none focus:outline-none"
          onDrop={e => {
            update(e.dataTransfer.files?.[0])
            e.preventDefault()
            e.stopPropagation()
          }}
          onDragOver={e => {
            e.preventDefault()
            e.stopPropagation()
          }}>
          <span className="flex items-center space-x-2">
            <span className="font-medium">
              Drop file, or click to browse
            </span>
          </span>
          <input
            type="file"
            id="file"
            className="hidden"
            accept=".json"
            onChange={e => update(e.target.files?.[0])}
          />
        </label>
      </div>

      <SelectInput label="Character" options={[
        { label: "Select", value: "" },
        ...good?.characters?.map(c => ({ label: c.key, value: c.key })).sort((a, b) => a.label.localeCompare(b.label)) ?? []
      ]} set={({ value }) => setChar(value)} value={char} />

      <div className="divider" />

      <div className="font-semibold">Generated Template File</div>
      {good ? <div className="flex flex-col w-full">
        <textarea
          className={"textarea textarea-bordered w-full font-mono h-96"}
          disabled
          value={typeof template == "string" ? template : JSON.stringify(template, undefined, 2)}
        />
        {typeof template == "object" && <>
          {template.template.buildSettings[0].plotBase == "" &&
          <p className="text-error my-1">
            Setting a plotbase is required for Theorycrafting mode in GO. Please set an &apos;Optimization Target vs ...&apos;.
            </p>
          }
          {(template.template.characters[0].team ?? []).filter((x: string) => x).length > 0 &&
            <p className="text-error my-1">
              Team mates are defined! These are&apos;t properly supported in AutoGO!
            </p>
          }
          {Object.keys(template.template.buildSettings[0].artSetExclusion ?? {}).length > 0 &&
            <p className="text-warning my-1">
              This template contains <code>artSetExclusion</code> which might not be what you want. If you want to <i>include</i> only certain artifacts
              instead of <i>excluding</i> certain, consider using GUOBA&apos;s custom <code>artSetExclusionOverrides</code>.
              Please take a look at the <Link href="https://github.com/Tibowl/AutoGO/blob/master/templates/kazuha-er-em.json#L37" target="_blank">
                Kazuha EM vs. ER template
              </Link> for an example.
            </p>
          }
          {template.template.buildSettings[0].levelLow == 0 &&
            <p className="text-warning my-1">
              No minimum artifact level provided, this could cause high compute times! Consider setting minimum to level 16.
            </p>
          }
          {Object.values(template.template.buildSettings[0].mainStatKeys).some(x => Array.isArray(x) && x.length == 0) &&
            <p className="text-warning my-1">
              No main stat filtering provided, this could cause high compute times! Consider setting them up in GO.
            </p>
          }
          {template.template.weapons[0].level != 90 &&
            <p className="text-warning my-1">
              Weapon is not level 90! Are you sure about this?
            </p>
          }
          {template.template.characters[0].level != 90 &&
            <p className="text-warning my-1">
              Character is not level 90! Are you sure about this?
            </p>
          }
          {(template.template.characters[0].talent.auto != 9 || template.template.characters[0].talent.skill != 9 || template.template.characters[0].talent.burst != 9) &&
            <p className="text-warning my-1">
              Character talents aren&apos;t 9/9/9. Are you sure about this?
            </p>
          }
          {Object.keys(template.template.characters[0].enemyOverride ?? {}).length > 0 &&
            <p className="text-warning my-1">
              Enemy overrides are defined! Are you sure about this?
            </p>
          }
          <button
            className="btn btn-primary m-2 btn-sm"
            onClick={() => copy(JSON.stringify(template, undefined, 2))}
          >
            Copy template
          </button>
        </>}
      </div> : <p className="text-warning">Invalid GOOD provided!</p>}

      {toast.length > 0 &&
        <div className="toast">
          <div className="alert alert-error">
            <div>
              <span>{toast}</span>
            </div>
          </div>
        </div>}
    </main>
  )
}

function createTemplate(good: GOODData, char: string): string | { char: string, template: any } {
  const template: GOODData & { artifacts: any } = JSON.parse(JSON.stringify(good))
  if (!template.characters) return "No characters in GOOD"

  const chars = template.characters.map(x => x.key)
  if (char.length == 0)
    if (chars.length == 1)
      char = chars[0]
    else
      return `No character provided, multiple found in GOOD: ${chars.sort().join(", ")}`

  // Delete artifacts and settings from template
  delete template.artifacts
  delete template.charMetas
  delete template.dbMeta
  delete template.display_weapon
  delete template.display_artifact
  delete template.display_optimize
  delete template.display_character
  delete template.display_tool

  // Filter out other characters
  if (!template.characters.find(x => x.key == char))
    return `Could not find char ${char}; chars in GOOD: ${chars.sort().join(", ")}`

  template.characters = template.characters.filter(x => x.key == char)
  template.buildSettings = template.buildSettings?.filter(x => x.id == char)
  if (!template.buildSettings || template.buildSettings.length == 0)
    return `Could not find build settings for ${char}`

  // Filter out other weapons
  const weapons = template.weapons?.map(x => x.key)
  template.weapons = template.weapons?.filter(x => x.location == char)

  const weapon = template.weapons?.[0]?.key
  if (!weapon)
    return `Could not find weapon of ${char}`

  template.characters.forEach(x => {
    delete x.equippedArtifacts

    // Clean up other custom targets
    const target = template.buildSettings?.[0]?.optimizationTarget
    if (x.customMultiTarget && target?.[0] == "custom")
      x.customMultiTarget = [x.customMultiTarget[+target[1]]]
    else
      delete x.customMultiTarget

    // Cleanup conditional settings
    if (x.conditional)
      x.conditional = Object.fromEntries(Object.entries(x.conditional).filter(x => x[0] == weapon || !weapons?.includes(x[0])))
  })

  template.buildSettings?.forEach(x => {
    // Fix index of custom target after filtering
    if (x.optimizationTarget?.[0] == "custom")
      x.optimizationTarget[1] = "0"

    // Force certain settings
    x.useExcludedArts = false
    x.useEquippedArts = false
    x.builds = []
    x.buildDate = 0
    x.maxBuildsToShow = 1
  })

  const templateWeapons = template.weapons
  templateWeapons?.forEach(x => {
    // Lock weapons
    x.lock = true
  })

  // Sort object a bit (put weapons at bottom)
  delete template.weapons
  template.weapons = templateWeapons


  return { char, template }
}
