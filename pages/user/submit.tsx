import { User } from "@prisma/client"
import { GetServerSideProps } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { AffiliationSelector } from "../../components/Affiliation"
import FormattedLink from "../../components/FormattedLink"
import { CheckboxInput, NumberInput } from "../../components/Input"
import { LoginInfo } from "../../components/LoginInfo"
import { getAffiliations, getUserFromCtx, isUser } from "../../utils/db"
import { PartialAffiliation } from "../../utils/types"
import { cleanCopy, doFetch, getIfGOOD, isGUOBAActive, isValidSubmission, validateChars, validateJson, validateUID, validateWeapons } from "../../utils/utils"


interface Props {
  user: User,
  affiliations: PartialAffiliation[]
}

export default function SubmitPage({ user, affiliations }: Props) {
  const desc = "Submit your GOOD data to the GUOBA overlords!"

  const enkaDesc = "Your UID will be used for artifact verification (required) and server grouping."
  const [validation, setValidation] = useState({
    goodError: "",
    goodWarn: "Please paste your GO database here or drag/drop/upload it into the field on the right.",
    charError: "",
    weaponError: "",
    uidError: enkaDesc
  })
  const router = useRouter()

  const [goodText, setGoodText] = useState("")
  const [hasChars, setHasChars] = useState(false)
  const [hasWeapons, setHasWeapons] = useState(false)
  const [uid, setUID] = useState("")
  const [selectedAffiliations, setSelected] = useState([] as number[])

  const [ping, setPing] = useState(0)
  const [stablePing, setStablePing] = useState(false)

  const [arxp, setARXP] = useState(0)

  const [toast, setToast] = useState("")

  useEffect(() => {
    if (toast.length > 0)
      setTimeout(() => {
        setToast("")
      }, 10000)
  }, [toast])

  async function update(file?: File) {
    if (!file) return
    if (file.size > 10_000_000) return
    const buffer = await file.arrayBuffer()
    const text = new TextDecoder().decode(buffer)
    setGoodText(text)
    setValidation({
      ...validation,
      ...validateJson(text, hasChars, hasWeapons)
    })
  }

  return (
    <main className="max-w-6xl w-full px-1">
      <Head>
        <title>Data submission | The GUOBA Project</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Data submission | The GUOBA Project" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <LoginInfo user={user} />
      <div className="flex justify-center">
        <ul className="steps">
          <li className="step step-primary font-semibold">Submitting data</li>
          <li className="step">Verify data</li>
          <li className="step">Processing</li>
        </ul>
      </div>

      <h3 className="text-2xl font-bold pt-1" id="instructions">Instructions</h3>
      <p>
        Enter your artifacts (and optionally, weapon and character data) into <FormattedLink href="https://frzyc.github.io/genshin-optimizer/"
          target="go">Genshin Optimizer</FormattedLink> by either manually entering them (not recommended) or via some scanner (read <FormattedLink
            href="https://frzyc.github.io/genshin-optimizer/#/scanner" target="go-scan">GenshinOptimizer&apos;s scanner page</FormattedLink> for more information).
        Next, a GOOD export can be taken via the <FormattedLink href="https://frzyc.github.io/genshin-optimizer/#/setting"
          target="go-setting">Settings</FormattedLink> page under <i>Database Download</i>.
        Please <b>make sure</b> that this artifact data is correct since you&apos;ll need to verify ownership of a subset of the submitted artifacts via your UID.
      </p>
      <br />

      <div className="font-semibold">GOOD File</div>
      <div className="flex w-full">
        <div
          className={`flex-grow rounded-box place-items-center ${validation.goodError ? "tooltip tooltip-error tooltip-open" :
            validation.goodWarn ? "tooltip tooltip-warning" : ""
            }`}
          data-tip={validation.goodError || validation.goodWarn}
        >
          <textarea
            className={`textarea textarea-bordered w-full font-mono ${validation.goodError ? "textarea-error" : ""} ${validation.goodWarn ? "textarea-warning" : ""}`}
            placeholder="Paste your GOOD json here"
            value={goodText}
            onChange={e => {
              setGoodText(e.target.value)
              setValidation({
                ...validation,
                ...validateJson(e.target.value, hasChars, hasWeapons)
              })
            }}
          />
          <label className="label">
            {getIfGOOD(goodText)?.artifacts.length ?
              <span className="label-text-alt">
                Found {getIfGOOD(goodText)?.artifacts.length} artifacts.
              </span>
              :
              <span className="label-text-alt text-warning">
                Didn&apos;t find any artifacts!
              </span>
            }
          </label>
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

      <div
        className={`tooltip ${validation.charError ? "tooltip-error text-error" : ""}`}
        data-tip={
          validation.charError ||
          "Check this if your GOOD dump contains all your characters, of which character level/ascensions and talent levels are correct. Equipped artifacts/weapons are ignored."
        }>
        <label className="cursor-pointer label pl-0" >
          <span className="font-semibold">Contains correct character data</span>
          <input
            type="checkbox"
            className="checkbox checkbox-accent mx-3"
            checked={hasChars}
            onChange={e => {
              setHasChars(e.target.checked)
              setValidation({
                ...validation,
                ...validateChars(e.target.checked, goodText)
              })
            }}
          />
          {getIfGOOD(goodText)?.characters?.length ?
            <span className="font-thin">Found {getIfGOOD(goodText)?.characters?.length} characters.</span>
            :
            <span className="font-thin text-warning">Didn&apos;t find any characters!</span>}
        </label>
      </div>
      <br />

      <div
        className={`tooltip ${validation.weaponError ? "tooltip-error text-error" : ""}`}
        data-tip={
          validation.weaponError ||
          "Check this if your GOOD dump contains all your 4 and 5 star weapons, of which level/ascension and refinement are correct. Which character it's equipped by are ignored."
        }>
        <label className="cursor-pointer label pl-0" >
          <span className="font-semibold">Contains correct weapon data</span>
          <input
            type="checkbox"
            className="checkbox checkbox-accent mx-3 "
            checked={hasWeapons}
            onChange={e => {
              setHasWeapons(e.target.checked)
              setValidation({
                ...validation,
                ...validateWeapons(e.target.checked, goodText)
              })
            }}
          />
          {getIfGOOD(goodText)?.weapons?.length ?
            <span className="font-thin">Found {getIfGOOD(goodText)?.weapons?.length} weapons.</span>
            :
            <span className="font-thin text-warning">Didn&apos;t find any weapons!</span>}
        </label>
      </div>
      <br />

      <div
        className={`tooltip ${validation.uidError ? "tooltip-error text-error" : ""}`}
        data-tip={validation.uidError || enkaDesc}>
        <label className="cursor-pointer label pl-0" >
          <span className="font-semibold">UID</span>
          <input
            type="text"
            placeholder="Type here"
            maxLength={9}
            className={`input input-bordered input-sm w-full max-w-xs mx-3 ${validation.uidError ? "outline outline-error" : ""}`}
            value={uid}
            onChange={e => {
              setUID(e.target.value)
              setValidation({
                ...validation,
                ...validateUID(e.target.value)
              })
            }}
          />
        </label>
      </div>
      <br />

      <NumberInput label="Average in-game ping" labelClass="font-semibold" value={ping} set={setPing} />

      <CheckboxInput label="Stable in-game ping" labelClass="font-semibold" value={stablePing} set={setStablePing} />

      <NumberInput label="Current Adventure Rank XP" labelClass="font-semibold" value={arxp} set={setARXP} min={0} max={340125} />
      <p>
        Please enter the amount visible on the pause menu. Adventure Rank will be extracted from your UID during artifact verification.
      </p>

      <h4 className="font-semibold mt-2">Select which affiliation/flag(s) you&apos;d like to run under:</h4>
      <AffiliationSelector selectedAffiliations={selectedAffiliations} setSelected={setSelected} affiliations={affiliations} />

      <button
        className={`btn btn-primary w-full ${Object.values(validation).some(x => x && x.length > 0) ? "btn-disabled" : ""} my-8`}
        onClick={async () => {
          try {
            if (arxp > 340125) {
              setToast("Please correctly set your AR XP")
              return
            }
            if (ping == 0) {
              setToast("Please set your average ping")
              return
            }
            if (!isValidSubmission(goodText, hasChars, hasWeapons, uid)) {
              setToast("Invalid submission! Please check the required things")
              return
            }
            const clean = cleanCopy(JSON.parse(goodText))
            if (!isValidSubmission(JSON.stringify(clean), hasChars, hasWeapons, uid)) {
              setToast("An error occurred while cleaning up GOOD data")
              return
            }
            await doFetch("/api/submit", JSON.stringify({
              hasChars, hasWeapons,
              uid, good: clean,
              affiliations: selectedAffiliations,
              ping, stablePing, arxp
            }), setToast, router)
          } catch (error) {
            setToast(`An error occurred while submitting data:\n${error}`)
          }
        }}
      >
        Submit
      </button>

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


export const getServerSideProps: GetServerSideProps<Props> = async function (ctx) {
  const user = await getUserFromCtx<Props>(ctx)

  if (!isUser(user))
    return user

  if (!isGUOBAActive())
    return {
      redirect: {
        destination: "/",
        permanent: false
      }
    }

  if (user.GOODId !== null)
    return {
      redirect: {
        destination: "/user/verification",
        permanent: false
      }
    }

  return { props: { user, affiliations: await getAffiliations(user.id) } }
}
