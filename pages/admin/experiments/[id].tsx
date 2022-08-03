import { User } from "@prisma/client"
import { GetServerSideProps } from "next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { CheckboxInput, TextInput } from "../../../components/Input"
import { LoginInfo } from "../../../components/LoginInfo"
import { getExperiment, getUserFromCtx, isUser } from "../../../utils/db"
import { ExperimentInfo } from "../../../utils/types"
import { doFetch, urlify } from "../../../utils/utils"

interface Props {
  user: User,
  experiment: ExperimentInfo
}

export default function ExperimentsPage({ user, experiment }: Props) {
  const desc = "Manage experiment"

  const router = useRouter()
  const [toast, setToast] = useState("")
  const [templateText, setTemplateText] = useState(JSON.stringify({ char: experiment.character, template: experiment.template }, undefined, 2))
  const [name, setName] = useState(experiment.name)
  const [slug, setSlug] = useState(experiment.slug)
  const [publicExp, setPublicExp] = useState(experiment.public)
  const [active, setActive] = useState(experiment.active)
  const [x, setX] = useState(experiment.x)
  const [y, setY] = useState(experiment.y)
  const [notes, setNotes] = useState(experiment.note)

  useEffect(() => {
    if (toast.length > 0) {
      const id = setTimeout(() => {
        setToast("")
      }, 10000)
      return () => clearTimeout(id)
    }
  }, [toast])

  return (
    <main className="max-w-5xl w-full px-1">
      <Head>
        <title>{`Manage ${experiment.name} | The GUOBA Project`}</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Manage experiment | The GUOBA Project" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <div className="text-sm breadcrumbs">
        <ul>
          <li><Link href={"/"}>Home</Link></li>
          <li><Link href={"/admin"}>Admin stuff</Link></li>
          <li><Link href={"/admin/experiments"}>Experiment management</Link></li>
          <li>{experiment.name}</li>
        </ul>
      </div>
      <LoginInfo user={user} />

      <h3 className="text-xl font-semibold pb-2">Edit experiment</h3>
      <div className="font-semibold">Template File</div>
      <div className="flex w-full">
        <textarea
          className={"textarea textarea-bordered w-full font-mono"}
          placeholder="Paste your template json here"
          disabled
          value={templateText}
        />
      </div>

      <label className="cursor-pointer label justify-start" >
        <span className="font-semibold">Character (from file)</span>
        <input
          type="text"
          className={"input input-bordered input-sm w-full max-w-xs mx-3"}
          disabled
          value={experiment.character}
        />
      </label>

      <TextInput label="Name" value={name} set={setName}/>

      <TextInput label="Slug (.../experiments/[slug])" placeholder={urlify(name, true)} value={slug} set={setSlug}/>

      <TextInput label="X-axis (leave empty for one-shots)" value={x} set={setX} validation={() => true}/>
      <TextInput label="Y-axis" value={y} set={setY} />

      <TextInput label="Notes" value={notes} set={setNotes} validation={() => true}/>

      <CheckboxInput label="List on homepage" labelClass="font-semibold" set={setPublicExp} value={publicExp} />

      <CheckboxInput label="Actively start processing data" labelClass="font-semibold" set={setActive} value={active} />

      <button
        className={"btn btn-primary my-2"}
        onClick={async () => {
          await doFetch("/api/update-experiment", JSON.stringify({
            id: experiment.id,
            name,
            slug: slug || urlify(name, true),
            active,
            publicExp,
            x, y, notes
          }), setToast, router)
        }}
      >
        Update experiment
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

  if (!user.admin)
    return {
      redirect: {
        destination: "/",
        permanent: false
      }
    }

  const id = +(ctx.params?.id ?? 0)
  const experiment = await getExperiment(id)
  if (!experiment)
    return {
      notFound: true
    }

  return {
    props: {
      user,
      experiment
    }
  }
}
