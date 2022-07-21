import { User } from "@prisma/client"
import { GetServerSideProps } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { LoginInfo } from "../../components/LoginInfo"
import { getUserFromCtx, isUser } from "../../utils/db"
import { cleanCopy, getIfGOOD, isValidSubmission, validateChars, validateJson, validateUID, validateWeapons } from "../../utils/utils"


interface Props {
  user: User
}

export default function SubmitPage({ user }: Props) {
  const desc = "Submit your GOOD data to the GUOBA overlords!"

  const enkaDesc = "Your UID will be used for artifact verification (required) and server grouping. Note that since only America, Europe, Asia and SAR servers are supported by enka.network, only they are allowed."
  const [validation, setValidation] = useState({
    goodError: "",
    goodWarn: "Please paste your GO database here or drag/drop/upload it into the field on the right.",
    charError: "",
    weaponError: "",
    uidError: enkaDesc
  })
  const router = useRouter()

  const [goodText, setGoodText] = useState("")

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
      ...validateJson(text, (document.getElementById("characters") as HTMLInputElement).checked, (document.getElementById("weapons") as HTMLInputElement).checked)
    })
  }

  return (
    <main className="max-w-5xl w-full px-1">
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


      <div className="font-semibold">GOOD File</div>
      <div className="flex w-full">
        <div
          className={`flex-grow rounded-box place-items-center ${validation.goodError ? "tooltip tooltip-error tooltip-open" :
            validation.goodWarn ? "tooltip tooltip-warning" : ""
            }`}
          data-tip={validation.goodError || validation.goodWarn}
        >
          <textarea
            id="good-json"
            className={`textarea textarea-bordered w-full font-mono ${validation.goodError ? "textarea-error" : ""} ${validation.goodWarn ? "textarea-warning" : ""}`}
            placeholder="Paste your GOOD json here"
            value={goodText}
            onChange={e => {
              setGoodText(e.target.value)
              setValidation({
                ...validation,
                ...validateJson(e.target.value, (document.getElementById("characters") as HTMLInputElement).checked, (document.getElementById("weapons") as HTMLInputElement).checked)
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
        <label className="cursor-pointer label justify-start" >
          <span className="font-semibold">Contains correct character data</span>
          <input
            type="checkbox"
            className="checkbox checkbox-accent mx-3"
            id="characters"
            onChange={e => setValidation({
              ...validation,
              ...validateChars(e.target.checked, goodText)
            })}
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
        <label className="cursor-pointer label justify-start" >
          <span className="font-semibold">Contains correct weapon data</span>
          <input
            type="checkbox"
            className="checkbox checkbox-accent mx-3 "
            id="weapons"
            onChange={e => setValidation({
              ...validation,
              ...validateWeapons(e.target.checked, goodText)
            })}
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
        <label className="cursor-pointer label justify-start" >
          <span className="font-semibold">UID</span>
          <input
            type="text"
            placeholder="Type here"
            maxLength={9}
            className={`input input-bordered input-sm w-full max-w-xs mx-3 ${validation.charError ? "outline outline-error" : ""}`}
            id="uid"
            onChange={e => setValidation({
              ...validation,
              ...validateUID(e.target.value)
            })}
          />
        </label>
      </div>
      <br />

      <button
        className={`btn btn-primary w-full ${Object.values(validation).some(x => x && x.length > 0) ? "btn-disabled" : ""} my-2`}
        onClick={async () => {
          try {
            const hasChars = (document.getElementById("characters") as HTMLInputElement).checked, hasWeapons = (document.getElementById("weapons") as HTMLInputElement).checked
            const uid = (document.getElementById("uid") as HTMLInputElement).value
            if (!isValidSubmission(goodText, hasChars, hasWeapons, uid)) {
              setToast("Invalid submission! Please check the required things")
              return
            }
            const clean = cleanCopy(JSON.parse(goodText))
            if (!isValidSubmission(JSON.stringify(clean), hasChars, hasWeapons, uid)) {
              setToast("An error occurred while cleaning up GOOD data")
              return
            }

            const response = await (await fetch("/api/submit", {
              method: "POST",
              body: JSON.stringify({
                hasChars, hasWeapons,
                uid, good: clean
              })
            })).json()

            if (response.error) {
              setToast(response.error)
              return
            }
            if (response.redirect) {
              router.push(response.redirect)
              return
            }
            setToast("Unknown response")
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

  if (user.GOODId !== null)
    return {
      redirect: {
        destination: "/user/verification",
        permanent: false
      }
    }

  return { props: { user } }
}
