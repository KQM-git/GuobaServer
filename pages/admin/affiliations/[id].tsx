import { Affiliation, User } from "@prisma/client"
import { GetServerSideProps } from "next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { AffiliationLabel } from "../../../components/Affiliation"
import { DiscordUser } from "../../../components/DiscordAvatar"
import FormattedLink from "../../../components/FormattedLink"
import { LoginInfo } from "../../../components/LoginInfo"
import { getUser, getUserFromCtx, isUser, prisma } from "../../../utils/db"
import { DetailedUserInfo, GOODData } from "../../../utils/types"
import { dateFormatter, copy, mergeTemplate, doFetch } from "../../../utils/utils"

interface Props {
  user: User,
  affiliation: Affiliation
}

export default function UserPage({ user, affiliation }: Props) {
  const desc = "Manage affiliation"

  const router = useRouter()
  const [toast, setToast] = useState("")
  const [name, setName] = useState(affiliation.name)
  const [description, setDescription] = useState(affiliation.description)
  const [color, setColor] = useState(affiliation.color)
  const [server, setServer] = useState(affiliation.serverId ?? "")

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
        <title>{`Manage ${affiliation.name} | The GUOBA Project`}</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Manage affiliation | The GUOBA Project" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <div className="text-sm breadcrumbs">
        <ul>
          <li><Link href={"/admin"}>Admin stuff</Link></li>
          <li><Link href={"/admin/affiliations"}>Affiliation management</Link></li>
          <li><span><AffiliationLabel affiliation={affiliation} /></span></li>
        </ul>
      </div>
      <LoginInfo user={user} />

      <h3 className="text-xl font-semibold py-2">Manage <AffiliationLabel affiliation={affiliation} /></h3>


      <label className={`cursor-pointer label justify-start ${name.length == 0 ? "text-error" : ""}`} >
        <span className="font-semibold">Name</span>
        <input
          type="text"
          className={"input input-bordered input-sm mx-3"}
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </label>

      <label className={`cursor-pointer label justify-start ${description.length == 0 ? "text-error" : ""}`} >
        <span className="font-semibold">Description</span>
        <input
          type="text"
          className={"input input-bordered input-sm max-w-md w-full mx-3"}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </label>

      <label className="cursor-pointer label justify-start" >
        <span className="font-semibold">Color</span>
        <input
          type="color"
          className={"input input-bordered input-sm mx-3"}
          value={color}
          onChange={e => setColor(e.target.value)}
        />
      </label>

      <label className={`cursor-pointer label justify-start ${!(server.match(/^\d{17,21}$/) || server.length == 0) ? "text-error" : ""}`} >
        <span className="font-semibold">Server ID</span>
        <input
          type="text"
          className={"input input-bordered input-sm mx-3"}
          value={server}
          onChange={e => setServer(e.target.value)}
        />
      </label>

      <div>
        Preview: <AffiliationLabel affiliation={{ color, description, id: 0, name }} />
      </div>

      <button
        className={"btn btn-primary my-2"}
        onClick={async () => {
          await doFetch("/api/update-affiliation", JSON.stringify({
            id: affiliation.id, name, description, color, server
          }), setToast, router)
        }}
      >
        Update affiliation
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

  const id = +(ctx.params?.id ?? "0")
  const affiliation = await prisma.affiliation.findUnique({
    where: { id }
  })
  if (!affiliation) return {
    notFound: true
  }

  return {
    props: {
      user,
      affiliation: affiliation
    }
  }
}
