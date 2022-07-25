import { User } from "@prisma/client"
import { GetServerSideProps } from "next"
import Head from "next/head"
import { useEffect, useState } from "react"
import { LoginInfo } from "../../components/LoginInfo"
import { getGOOD, getUserFromCtx, isUser } from "../../utils/db"


interface Props {
  user: User
}

export default function ProcessingPage({ user }: Props) {
  const desc = "View your processed GOODs!"

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
        <title>Processing | The GUOBA Project</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Processing | The GUOBA Project" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <LoginInfo user={user} />
      <div className="flex justify-center">
        <ul className="steps">
          <li className="step step-primary">Submitting data</li>
          <li className="step step-primary">Verify data</li>
          <li className="step step-primary font-semibold">Processing</li>
        </ul>
      </div>

      TODO: This page is not yet implemented!

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

    if (user.GOODId == null)
    return {
      redirect: {
        destination: "/user/submit",
        permanent: false
      }
    }

    if (!(await getGOOD(user.GOODId))?.verified)
      return {
        redirect: {
          destination: "/user/verification",
          permanent: false
        }
      }

  return { props: { user } }
}
