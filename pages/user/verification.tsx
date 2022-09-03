import { User } from "@prisma/client"
import { GetServerSideProps } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Artifact } from "../../components/Artifact"
import FormattedLink from "../../components/FormattedLink"
import { LoginInfo } from "../../components/LoginInfo"
import { canSelfReset, getGOOD, getUserFromCtx, isUser, prisma } from "../../utils/db"
import { EnkaData, GOODData, IArtifact } from "../../utils/types"
import { doFetch, pickArtifacts } from "../../utils/utils"


interface Props {
  user: User
  artifacts: IArtifact[]
  previousResult: {
    ttl: number
    verified: number[]
  } | null
  canSelfReset: boolean
}

export default function VerifyPage({ user, artifacts, previousResult, canSelfReset }: Props) {
  const desc = "Verify your GOOD data for the GUOBA overlords!"

  const router = useRouter()

  const [toast, setToast] = useState("")
  const [ttl, setTTL] = useState(previousResult?.ttl ?? -1)
  const [targetTime, setTargetTime] = useState(Date.now() + (previousResult?.ttl ?? -10) * 1000)

  useEffect(() => {
    console.log(ttl)
    if (ttl < 0) return

    const timeout = setTimeout(() => {
      setTTL((targetTime - Date.now()) / 1000)
    }, (targetTime - Date.now()) % 1000 + 100)

    return () => clearTimeout(timeout)
  }, [ttl, targetTime])

  useEffect(() => {
    if (toast.length > 0)
      setTimeout(() => {
        setToast("")
      }, 10000)
  }, [toast])

  return (
    <main className="max-w-5xl w-full px-1">
      <Head>
        <title>Data verification | The GUOBA Project</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Data verification | The GUOBA Project" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <LoginInfo user={user} />
      <div className="flex justify-center">
        <ul className="steps">
          <li className="step step-primary">Submitting data</li>
          <li className="step step-primary font-semibold">Verify data</li>
          <li className="step">Processing</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold pt-1" id="verification">Artifact verification</h2>
      <p>
        Please equip the following artifacts on any character on your showcase to confirm your data. Make sure your in-game profile is also set to public.
        Data will be verified using <FormattedLink href={`https://enka.network/u/${user.uid}`} className="link link-hover link-primary" target="_blank">Enka.Network (UID: {user.uid})</FormattedLink>.
      </p>
      {previousResult && <div>
        <h3 className="font-semibold text-xl text-error mt-2">
          Unable to verify the following artifacts:
        </h3>
        <p>
          Please make sure that the artifact in question is visible on <FormattedLink href={`https://enka.network/u/${user.uid}`} className="link link-hover link-primary" target="_blank">Enka.Network</FormattedLink>!
          It might take up to 5 minutes before it shows up after switching in-game. If the site has trouble detecting an artifact, please try again later. If the problem persists, please contact us over at the <FormattedLink
            href="https://discord.gg/keqing" className="link link-hover link-secondary" target="_blank">KQM Discord</FormattedLink>!
        </p>
        {ttl >= 0 && <p>Please try again when the Enka.Network cooldown expires in <Time ttl={ttl} /></p>}

        <div className="flex flex-wrap w-full">
          {artifacts.filter((_, i) => !previousResult.verified.includes(i)).map((a, i) => <Artifact key={i} artifact={a} />)}
        </div>
      </div>}

      <h2 className="text-2xl font-bold pt-1" id="artifacts">{previousResult ? "Detected artifacts" : "Artifacts"}</h2>
      <div className="flex flex-wrap w-full">
        {artifacts.filter((_, i) => previousResult?.verified.includes(i) ?? true).map((a, i) => <Artifact key={i} artifact={a} />)}
      </div>

      {ttl >= 0 ? <div className="w-full my-2 text-2xl bg-neutral rounded-xl text-center p-2">Enka.Network cooldown <Time ttl={ttl} /></div> :
        <button
          className={"btn btn-primary w-full my-2"}
          onClick={async () => {
            if (ttl > 0) return
            setTargetTime(Date.now() + 10 * 1000)
            setTTL(10)
            await doFetch("/api/verify", "", setToast, router)
          }}
        >
          Verify
        </button>}

      {canSelfReset &&
        <>
          <div className="divider" />
          <h2 className="text-2xl font-bold pt-1" id="unlink">Unlink GOOD</h2>
          <p>
            Is there a mistake in your artifact database? You can unlink your GOOD up to <b>1</b> time per week. Please make double, or even triple sure that all the artifacts are correct!
            It is recommended to start the artifact data entry from scratch.
          </p>
          <button
            className={"btn btn-error w-full my-2"}
            onClick={async () => {
              if (confirm("Are you sure? This can only be done ONCE per week!")) {
                setTargetTime(Date.now() + 10 * 1000)
                setTTL(10)
                await doFetch("/api/self-unlink", "", setToast, router)
              }
            }}
          >
            Unlink GOOD
          </button>
        </>}

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

function Time({ ttl }: { ttl: number }) {
  return <span className="countdown font-mono">
    <span style={{ "--value": Math.floor(ttl / 60) } as React.CSSProperties} />:
    <span style={{ "--value": Math.floor(ttl % 60) } as React.CSSProperties} />
  </span>
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

  const good = await getGOOD(user.GOODId)
  if (good == null)
    return {
      redirect: {
        destination: "/user/submit",
        permanent: false
      }
    }

  if (good?.verified)
    return {
      redirect: {
        destination: "/user/processing",
        permanent: false
      }
    }


  let artifacts: IArtifact[] | null = good.verificationArtifacts as any as IArtifact[] | null

  if (!artifacts || artifacts.length == 0) {
    artifacts = pickArtifacts(good.data as any as GOODData)
    await prisma.gOOD.update({
      where: { id: user.GOODId },
      data: {
        verificationArtifacts: artifacts as any
      }
    })
  }

  let previousResult = null
  if (good.enkaResponses.length > 0) {
    const response = good.enkaResponses[0]
    const enka = response.data as any as EnkaData

    const ttl = enka.ttl - Math.floor((Date.now() - response.createdOn.getTime()) / 1000)
    previousResult = {
      ttl,
      verified: good.verifiedArtifacts
    }
  }

  return {
    props: {
      user,
      artifacts,
      previousResult,
      canSelfReset: await canSelfReset(user.id)
    }
  }
}
