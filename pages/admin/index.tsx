import { User } from "@prisma/client"
import { GetServerSideProps } from "next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { LoginInfo } from "../../components/LoginInfo"
import { getUserFromCtx, isUser } from "../../utils/db"


interface Props {
  user: User
}

export default function AdminPage({ user }: Props) {
  const desc = "Admin page"

  const router = useRouter()
  const [toast, setToast] = useState("")

  useEffect(() => {
    if (toast.length > 0)
      setTimeout(() => {
        setToast("")
      }, 10000)
  }, [toast])

  return (
    <main className="max-w-5xl w-full px-1">
      <Head>
        <title>Admin status page | The GUOBA Project</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Admin status page | The GUOBA Project" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <div className="text-sm breadcrumbs">
        <ul>
          <li><Link href={"/"}>Home</Link></li>
          <li>Admin stuff</li>
        </ul>
      </div>
      <LoginInfo user={user} />
      <h3 className="text-xl font-semibold pb-2">Panels</h3>
      <button className="btn btn-primary m-2" onClick={() => router.push("/admin/computers")}>
        Manage computers
      </button>
      <button className="btn btn-primary m-2" onClick={() => router.push("/admin/experiments")}>
        Manage experiments
      </button>
      <button className="btn btn-primary m-2" onClick={() => router.push("/admin/users")}>
        Manage users
      </button>
      <button className="btn btn-primary m-2" onClick={() => router.push("/admin/affiliations")}>
        Manage affiliations
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


  return { props: { user } }
}
