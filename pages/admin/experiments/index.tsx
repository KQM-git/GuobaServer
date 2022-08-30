import { User } from "@prisma/client"
import { GetServerSideProps } from "next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { DiscordUser } from "../../../components/DiscordAvatar"
import FormattedLink from "../../../components/FormattedLink"
import { TextAreaInput, TextInput } from "../../../components/Input"
import { LoginInfo } from "../../../components/LoginInfo"
import { getExperiments, getUserFromCtx, isUser, prisma } from "../../../utils/db"
import { ExperimentInfo } from "../../../utils/types"
import { doFetch, getIfGOOD, urlify } from "../../../utils/utils"

interface Props {
  user: User,
  experiments: ExperimentInfo[],
  totalTimes: { experimentId: number, _sum: { computeTime: number|null }}[]
}

export default function ExperimentsPage({ user, experiments, totalTimes }: Props) {
  const desc = "Manage experiments"

  const router = useRouter()
  const [toast, setToast] = useState("")
  const [templateText, setTemplateText] = useState("")
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [x, setX] = useState("")
  const [y, setY] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (y === "" && x === "" && templateText) {
      try {
        const good = JSON.parse(templateText).template
        const target = good.buildSettings[0].optimizationTarget
        if (target[0] == "custom")
          setY(good.characters[0].customMultiTarget[0].name)
        else
          setY(target.join(" ").replace(/_$/, "%").replace(/^[a-z]/, (dn: string) => dn.toUpperCase()))
        setX(good.buildSettings[0].plotBase.replace(/_$/, "%").replace(/^[a-z]/, (dn: string) => dn.toUpperCase()))
      } catch (error) {
        setToast("Invalid template!")
      }
    }
  }, [templateText, x, y])

  useEffect(() => {
    if (toast.length > 0) {
      const id = setTimeout(() => {
        setToast("")
      }, 10000)
      return () => clearTimeout(id)
    }
  }, [toast])

  async function update(file?: File) {
    if (!file) return
    if (file.size > 10_000_000) return
    const buffer = await file.arrayBuffer()
    const text = new TextDecoder().decode(buffer)
    setTemplateText(text)
  }

  return (
    <main className="max-w-5xl w-full px-1">
      <Head>
        <title>Manage experiments | The GUOBA Project</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Manage experiments | The GUOBA Project" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <div className="text-sm breadcrumbs">
        <ul>
          <li><Link href={"/"}>Home</Link></li>
          <li><Link href={"/admin"}>Admin stuff</Link></li>
          <li>Experiment management</li>
        </ul>
      </div>
      <LoginInfo user={user} />

      <h3 className="text-xl font-semibold py-2">Experiments</h3>
      <table className="table table-zebra table-compact w-full table-auto">
        <thead>
          <tr>
            <th>ID</th>
            <th>Public</th>
            <th>Active</th>
            <th>Name</th>
            <th>Creator</th>
            <th>Character</th>
            <th>Processed</th>
            <th>Processing time</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {experiments.map(c => <tr key={c.id}>
            <th>
              {c.id}
            </th>
            <th>
              <input
                type="checkbox"
                className="checkbox checkbox-primary mx-3"
                disabled
                checked={c.public}
              />
            </th>
            <th>
              <input
                type="checkbox"
                className="checkbox checkbox-primary mx-3"
                disabled
                checked={c.active}
              />
            </th>
            <th>
              <FormattedLink href={`/experiments/${c.slug}`}>{c.name}</FormattedLink>
            </th>
            <th>
              <DiscordUser user={c.creator} />
            </th>
            <th>{c.character}</th>
            <th>{c._count.experimentData}</th>
            <th>{((totalTimes.find(t => t.experimentId == c.id)?._sum.computeTime ?? 0) / 1000 / 60).toFixed(1)}m</th>
            <th><FormattedLink href={`/admin/experiments/${c.id}`}><button className="btn btn-sm btn-primary">Edit</button></FormattedLink></th>
          </tr>)}
        </tbody>
      </table>

      <div className="divider" />
      <h3 className="text-xl font-semibold pb-2">Create experiment</h3>
      <div className="font-semibold">Template File</div>
      <p>View the <FormattedLink href="/template-creator">template creator</FormattedLink> to convert your GOOD database into a template</p>
      <div className="flex w-full tooltip tooltip-warning" data-tip="This cannot be edited once submitted!">
        <div
          className={"flex-grow rounded-box place-items-center"}
        >
          <textarea
            className={"textarea textarea-bordered w-full font-mono border-warning"}
            placeholder="Paste your template json here"
            value={templateText}
            onChange={e => setTemplateText(e.target.value)}
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


      <label className="cursor-pointer label justify-start" >
        <span className="font-semibold">Character (from file)</span>
        <input
          type="text"
          className={"input input-bordered input-sm w-full max-w-xs mx-3"}
          id="char"
          disabled
          value={getChar(templateText)}
        />
      </label>

      <TextInput label="Name" value={name} set={setName}/>

      <TextInput label="Slug (.../experiments/[slug])" placeholder={urlify(name, true)} value={slug} set={setSlug} validation={() => true} />

      <TextInput label="X-axis (leave empty for one-shots)" value={x} set={setX} validation={() => true} />
      <TextInput label="Y-axis" value={y} set={setY} />

      <TextAreaInput label="Notes" value={notes} set={setNotes} validation={() => true} />

      <button
        className={"btn btn-primary my-2"}
        onClick={async () => {
          await doFetch("/api/create-experiment", JSON.stringify({
            name,
            slug: slug || urlify(name, true),
            char: getChar(templateText),
            template: JSON.parse(templateText).template,
            x, y, notes
          }), setToast, router)
        }}
      >
        Create experiment
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

  const totalTimes = await prisma.experimentData.groupBy({
    _sum: {
      computeTime: true
    },
    by: ["experimentId"]
  })

  return {
    props: {
      user,
      experiments: await getExperiments(),
      totalTimes
    }
  }
}
