import { User } from "@prisma/client"
import { GetServerSideProps } from "next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { AffiliationLabel } from "../../../components/Affiliation"
import { DiscordUser } from "../../../components/DiscordAvatar"
import FormattedLink from "../../../components/FormattedLink"
import { LoginInfo } from "../../../components/LoginInfo"
import { getUser, getUserFromCtx, isUser } from "../../../utils/db"
import { DetailedUserInfo, GOODData } from "../../../utils/types"
import { copy, dateFormatter, doFetch, mergeTemplate } from "../../../utils/utils"

interface Props {
  user: User,
  targetUser: DetailedUserInfo
}

export default function UserPage({ user, targetUser }: Props) {
  const desc = "Manage user"

  const router = useRouter()
  const [toast, setToast] = useState("")
  const [loadedData, setLoadedData] = useState(null as GOODData | null)

  useEffect(() => {
    async function fetchGOOD() {
      setLoadedData(await (await fetch(`/api/good?id=${user.GOODId}`)).json())
    }
    fetchGOOD()
  }, [user.GOODId])

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
        <title>{`Manage ${targetUser.username}#${targetUser.tag} | The GUOBA Project`}</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Manage user | The GUOBA Project" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <div className="text-sm breadcrumbs">
        <ul>
          <li><Link href={"/"}>Home</Link></li>
          <li><Link href={"/admin"}>Admin stuff</Link></li>
          <li><Link href={"/admin/users"}>User management</Link></li>
          <li><span><DiscordUser user={targetUser} /></span></li>
        </ul>
      </div>
      <LoginInfo user={user} />

      <h3 className="text-xl font-semibold py-2">Manage <DiscordUser user={targetUser} /></h3>
      Registered on <span className="font-semibold" suppressHydrationWarning>{dateFormatter.format(targetUser.createdOn)}</span>
      <h4 className="text-lg font-semibold py-2">Experiment data</h4>
      <table className="table table-zebra table-compact w-full table-auto">
        <thead>
          <tr>
            <th>Experiment</th>
            <th>GOOD ID</th>
            <th>Processed on</th>
            <th>Processed by</th>
            <th>Processing time</th>
            <th>Pre-merged</th>
          </tr>
        </thead>
        <tbody>
          {targetUser.experimentData.sort((a, b) => a.GOODId - b.GOODId || a.experiment.name.localeCompare(b.experiment.name)).map(c => <tr key={c.experiment.name + ";" + c.GOODId}>
            <th>
              <FormattedLink href={`/experiments/${c.experiment.slug}`}>{c.experiment.name}</FormattedLink>
            </th>
            <th>{c.GOODId}</th>
            <th suppressHydrationWarning>{dateFormatter.format(c.createdOn)}</th>
            <th>#{c.computerId}</th>
            <th>{(c.computeTime / 1000).toFixed(1)}s</th>
            <th>
              {loadedData && targetUser.GOODId == c.GOODId ? <button
                className="btn btn-primary btn-sm"
                onClick={() => copy(JSON.stringify(mergeTemplate(loadedData, c.experiment.template)))}
              >
                Copy
              </button> : <>{loadedData ? <>Outdated information</> : <>No data</>}</>}
            </th>
          </tr>)}
        </tbody>
      </table>

      <div className="divider" />
      <h4 className="text-lg font-semibold py-2">User data</h4>

      <label className="justify-start label" >
        <span className="font-semibold">UID</span>
        <input
          type="text"
          className="input input-bordered input-sm w-full max-w-xs mx-3"
          disabled
          value={targetUser.uid ?? "?"}
        />
      </label>

      <label className="justify-start label" >
        <span className="font-semibold">Affiliations</span>
        <div className="m-1">{targetUser.affiliations.map(a => <AffiliationLabel key={a.id} affiliation={a} />)}</div>
      </label>

      <label className="justify-start label" >
        <span className="font-semibold">Banned</span>
        <input
          type="checkbox"
          className="checkbox checkbox-accent mx-3"
          checked={targetUser.banned}
          onChange={async () => {
            await doFetch("/api/ban", JSON.stringify({
              target: targetUser.id,
              banned: !targetUser.banned
            }), setToast, router)
          }}
        />
      </label>

      <label className="justify-start label" >
        <span className="font-semibold">Premium</span>
        <input
          type="checkbox"
          className="checkbox checkbox-accent mx-3"
          disabled
          checked={targetUser.premium}
        />
      </label>

      <label className="justify-start label" >
        <span className="font-semibold">Admin</span>
        <input
          type="checkbox"
          className="checkbox checkbox-accent mx-3"
          disabled
          checked={targetUser.admin}
        />
      </label>

      {targetUser.currentGOOD && <div>
        <div className="divider" />
        <h4 className="text-lg font-semibold py-2">Current GOOD information</h4>

        <div>
          Created on <span className="font-semibold" suppressHydrationWarning>{dateFormatter.format(targetUser.currentGOOD.createdOn)}</span>. ID: {targetUser.GOODId}
        </div>

        {loadedData && <button
          className="btn btn-primary m-2 btn-sm"
          onClick={() => copy(JSON.stringify(loadedData))}
        >
          Copy GOOD data
        </button>}

        <label className="justify-start label" >
          <span className="font-semibold">Has characters</span>
          <input
            type="checkbox"
            className="checkbox checkbox-accent mx-3"
            disabled
            checked={targetUser.currentGOOD.hasChars}
          />
        </label>

        <label className="justify-start label" >
          <span className="font-semibold">Has weapons</span>
          <input
            type="checkbox"
            className="checkbox checkbox-accent mx-3"
            disabled
            checked={targetUser.currentGOOD.hasWeapons}
          />
        </label>

        <label className="justify-start label" >
          <span className="font-semibold">Verified</span>
          <input
            type="checkbox"
            className="checkbox checkbox-accent mx-3"
            disabled
            checked={targetUser.currentGOOD.verified}
          />
        </label>

        {targetUser.currentGOOD.verifiedTime && <div>
          Verified on <span className="font-semibold" suppressHydrationWarning>{dateFormatter.format(targetUser.currentGOOD.verifiedTime)}</span>
        </div>}

        <button
          className="btn btn-error m-2"
          onClick={async () => {
            await doFetch("/api/unlink-good", JSON.stringify({
              target: targetUser.id
            }), setToast, router)
          }}
        >
          Unlink GOOD data
        </button>
      </div>}

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

  const id = (ctx.params?.id ?? "").toString()
  const targetUser = await getUser(id, true)
  if (!targetUser)
    return {
      notFound: true
    }

  return {
    props: {
      user,
      targetUser
    }
  }
}
