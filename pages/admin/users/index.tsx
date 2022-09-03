import { User } from "@prisma/client"
import { GetServerSideProps } from "next"
import Head from "next/head"
import Link from "next/link"
import { AffiliationLabel } from "../../../components/Affiliation"
import { DiscordUser } from "../../../components/DiscordAvatar"
import FormattedLink from "../../../components/FormattedLink"
import { LoginInfo } from "../../../components/LoginInfo"
import { getUserFromCtx, isUser, prisma } from "../../../utils/db"
import { UserInfo } from "../../../utils/types"
import { dateFormatter } from "../../../utils/utils"

interface Props {
  user: User,
  users: UserInfo[]
}

export default function UsersPage({ user, users }: Props) {
  const desc = "Manage users"

  return (
    <main className="max-w-6xl w-full px-1">
      <Head>
        <title>Manage users | The GUOBA Project</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Manage users | The GUOBA Project" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <div className="text-sm breadcrumbs">
        <ul>
          <li><Link href={"/"}>Home</Link></li>
          <li><Link href={"/admin"}>Admin stuff</Link></li>
          <li>User management</li>
        </ul>
      </div>
      <LoginInfo user={user} />

      <h3 className="text-xl font-semibold py-2">Users</h3>
      <table className="table table-zebra table-compact w-full table-auto">
        <thead>
          <tr>
            <th>User</th>
            <th>Created on</th>
            <th>Affiliations</th>
            <th>Verified</th>
            <th>UID</th>
            <th>Banned</th>
            <th>Processed</th>
            <th>More</th>
          </tr>
        </thead>
        <tbody>
          {users.sort((a, b) =>
            (a.admin ? 1 : 2) - (b.admin ? 1 : 2) ||
            (b.banned ? 1 : 2) - (a.banned ? 1 : 2) ||
            (a.currentGOOD ? 1 : 2) - (b.currentGOOD ? 1 : 2) ||
            (a.currentGOOD?.verified ? 1 : 2) - (b.currentGOOD?.verified ? 1 : 2) ||
            a.createdOn.getTime() - b.createdOn.getTime()
            ).map(c => <tr key={c.id}>
            <th>
              <DiscordUser user={c} />
            </th>
            <th suppressHydrationWarning>{dateFormatter.format(c.createdOn)}</th>
            <td>{c.affiliations.map(a => <AffiliationLabel key={a.id} affiliation={a} />)}</td>
            <th>
              <input
                type="checkbox"
                className="checkbox checkbox-primary mx-3"
                disabled
                checked={c.currentGOOD?.verified}
              />
            </th>
            <th>{c.uid}</th>
            <th>
              <input
                type="checkbox"
                className="checkbox checkbox-primary mx-3"
                disabled
                checked={c.banned}
              />
            </th>
            <th>{c._count.experimentData}</th>
            <th><FormattedLink href={`/admin/users/${c.id}`}><button className="btn btn-sm btn-primary">Detailed info</button></FormattedLink></th>
          </tr>)}
        </tbody>
      </table>
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
      users: await prisma.user.findMany({
        include: {
            _count: {
                select: {
                    experimentData: true
                }
            },
            currentGOOD: {
                select: { verified: true }
            },
            affiliations: {
              select: {
                id: true,
                name: true,
                sort: true,
                description: true,
                color: true
              }
            }
        }
    })
    }
  }
}
