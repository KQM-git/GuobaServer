import { User } from "@prisma/client"
import { GetServerSideProps } from "next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
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
        <title>Manage {experiment.name} | The GUOBA Project</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Manage experiment | The GUOBA Project" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <div className="text-sm breadcrumbs">
        <ul>
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

      <label className="cursor-pointer label justify-start" >
        <span className="font-semibold">Name</span>
        <input
          type="text"
          className={"input input-bordered input-sm w-full max-w-xs mx-3"}
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </label>

      <label className="cursor-pointer label justify-start" >
        <span className="font-semibold">Slug (.../experiments/[slug])</span>
        <input
          type="text"
          className={"input input-bordered input-sm w-full max-w-xs mx-3"}
          placeholder={urlify(name, true)}
          value={slug}
          onChange={e => setSlug(e.target.value)}
        />
      </label>

      <label className="cursor-pointer label justify-start" >
        <span className="font-semibold">List on homepage</span>
        <input
          type="checkbox"
          className="checkbox checkbox-accent mx-3"
          onChange={e => setPublicExp(e.target.checked)}
          checked={publicExp}
        />
      </label>

      <label className="cursor-pointer label justify-start" >
        <span className="font-semibold">Actively start processing data</span>
        <input
          type="checkbox"
          className="checkbox checkbox-accent mx-3"
          onChange={e => setActive(e.target.checked)}
          checked={active}
        />
      </label>

      <button
        className={"btn btn-primary my-2"}
        onClick={async () => {
          await doFetch("/api/update-experiment", JSON.stringify({
            id: experiment.id,
            name,
            slug: slug || urlify(name, true),
            active,
            publicExp
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

function getChar(text: string) {
  try {
    const json = JSON.parse(text)
    return json.char ?? "Unknown character"
  } catch (error) {
    return "No file provided"
  }
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
