import { User } from "@prisma/client"
import { GetServerSideProps } from "next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { DiscordUser } from "../../components/DiscordAvatar"
import { LoginInfo } from "../../components/LoginInfo"
import { getComputers, getUserFromCtx, isUser } from "../../utils/db"
import { ComputerInfo } from "../../utils/types"
import { randomUUID } from "crypto"

interface Props {
  user: User,
  computers: ComputerInfo[],
  token: string
}

export default function ComputersPage({ user, computers, token }: Props) {
  const desc = "Manage computers"

  const router = useRouter()
  const [toast, setToast] = useState("")
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setTimeout(() => {
      setNow(Date.now())
    }, 1000 - Date.now() % 1000)
    return () => clearTimeout(id)
  }, [now])

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
        <title>Manage computers | The GUOBA Project</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Manage computers | The GUOBA Project" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <div className="text-sm breadcrumbs">
        <ul>
          <li><Link href={"/admin"}>Admin stuff</Link></li>
          <li>Computer management</li>
        </ul>
      </div>
      <LoginInfo user={user} />

      <h3 className="text-xl font-semibold py-2">Computers</h3>
      <table className="table table-zebra table-compact w-full -z-50 table-auto">
        <thead>
          <tr>
            <th>ID</th>
            <th>Owner</th>
            <th>Logs</th>
          </tr>
        </thead>
        <tbody>
          {computers.map(c => <tr key={c.id}>
            <th className={
              c.computerLogs.every(cl => cl.createdOn.getTime() < now - 60 * 60 * 1000) || c.computerLogs.length == 0 ? "text-error" :
                c.computerLogs.every(cl => cl.createdOn.getTime() < now - 5 * 60 * 1000) ? "text-warning" :
                  ""}>
              {c.id}
            </th>
            <th>
              <DiscordUser user={c.user} />
            </th>
            <th>
              {c.computerLogs
                .sort((a, b) => a.serverTime.getTime() - b.serverTime.getTime())
                .map((cl, i) => <div key={i} className="mx-1">
                  <code>[{cl.createdOn.toLocaleString("en-uk", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  })}] {cl.log}</code>
                </div>)
              }
            </th>
          </tr>)}
        </tbody>
      </table>

      <div className="divider" />
      <h3 className="text-xl font-semibold pb-2">Create computer</h3>

      <div
        className="tooltip tooltip-warning w-full max-w-lg block"
        data-tip="STORE THIS VALUE BEFORE CLICKING CREATE. This cannot be recovered later.">
        <label className="cursor-pointer label justify-start" >
          <span className="font-semibold text-warning">Token</span>
          <input
            type="text"
            className={"input input-bordered input-sm w-full mx-3 input-disabled select-all cursor-pointer select-warning"}
            id="token"
            readOnly
            value={token}
            onMouseOver={e => {
              const element = e.target as HTMLInputElement
              element.select()
              element.selectionStart = 0
              element.selectionEnd = element.value.length
            }}
            onClick={e => {
              e.preventDefault()
              const element = e.target as HTMLInputElement
              element.select()
              element.selectionStart = 0
              element.selectionEnd = element.value.length
            }}
          />
        </label>
      </div>

      <button
        className={"btn btn-primary my-2 tooltip tooltip-warning normal-case"}
        data-tip="STORE THIS VALUE BEFORE CLICKING CREATE. This cannot be recovered later."
        onClick={async () => {
          try {
            const response = await (await fetch("/api/create-computer", {
              method: "POST",
              body: (document.getElementById("token") as HTMLInputElement).value
            })).json()

            if (response.error) {
              setToast(response.error)
              return
            }
            if (response.ok) {
              router.reload()
              return
            }
            setToast("Unknown response")
          } catch (error) {
            setToast(`An error occurred while creating computer:\n${error}`)
          }
        }}
      >
        CREATE COMPUTER
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
      computers: await getComputers(),
      token: user.id + "-" + randomUUID()
    }
  }
}
