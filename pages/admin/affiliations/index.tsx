import { Affiliation, User } from "@prisma/client"
import { GetServerSideProps } from "next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { AffiliationLabel } from "../../../components/Affiliation"
import FormattedLink from "../../../components/FormattedLink"
import { NumberInput, TextInput } from "../../../components/Input"
import { LoginInfo } from "../../../components/LoginInfo"
import { getUserFromCtx, isUser, prisma } from "../../../utils/db"
import { doFetch } from "../../../utils/utils"

interface Props {
  user: User,
  affiliations: Affiliation[]
}

export default function AffiliationsPage({ user, affiliations }: Props) {
  const desc = "Manage affiliations"

  const router = useRouter()

  const [toast, setToast] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [sort, setSort] = useState(0)
  const [color, setColor] = useState("#CB71F1")
  const [server, setServer] = useState("")

  return (
    <main className="max-w-5xl w-full px-1">
      <Head>
        <title>Manage affiliations | The GUOBA Project</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Manage affiliations | The GUOBA Project" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <div className="text-sm breadcrumbs">
        <ul>
          <li><Link href={"/"}>Home</Link></li>
          <li><Link href={"/admin"}>Admin stuff</Link></li>
          <li>Affiliation management</li>
        </ul>
      </div>
      <LoginInfo user={user} />

      <h3 className="text-xl font-semibold py-2">Affiliations</h3>
      <table className="table table-zebra table-compact w-full table-auto">
        <thead>
          <tr>
            <th>ID</th>
            <th>Sort</th>
            <th>Name</th>
            <th>Description</th>
            <th>Preview</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {affiliations.sort((a, b) => a.sort - b.sort || a.id - b.id).map(c => <tr key={c.id}>
            <th>{c.id}</th>
            <th>{c.sort}</th>
            <th>{c.name}</th>
            <th>{c.description}</th>
            <th>
              <AffiliationLabel affiliation={c} />
            </th>
            <th><FormattedLink href={`/admin/affiliations/${c.id}`}><button className="btn btn-sm btn-primary">Edit</button></FormattedLink></th>
          </tr>)}
        </tbody>
      </table>

      <div className="divider" />
      <h3 className="text-xl font-semibold pb-2">Create affiliation</h3>

      <TextInput label="Name" set={setName} value={name} />

      <TextInput label="Description" set={setDescription} value={description} />

      <NumberInput label="Sort" set={setSort} value={sort} />

      <label className="cursor-pointer label justify-start" >
        <span className="font-semibold">Color</span>
        <input
          type="color"
          className={"input input-bordered input-sm mx-3"}
          value={color}
          onChange={e => setColor(e.target.value)}
        />
      </label>

      <TextInput label="Server ID" set={setServer} value={server} validation={(value) => !!(value.match(/^\d{17,21}$/) || value.length == 0)}/>

      <div>
        Preview: <AffiliationLabel affiliation={{ color, description, id: 0, name, sort }} />
      </div>

      <button
        className={"btn btn-primary my-2"}
        onClick={async () => {
          await doFetch("/api/create-affiliation", JSON.stringify({
            name, description, color, server, sort
          }), setToast, router)
        }}
      >
        Create affiliation
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


  return {
    props: {
      user,
      affiliations: await prisma.affiliation.findMany({})
    }
  }
}
