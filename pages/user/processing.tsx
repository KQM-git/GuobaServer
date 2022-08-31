import { User } from "@prisma/client"
import { GetServerSideProps } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { AffiliationSelector } from "../../components/Affiliation"
import FormattedLink from "../../components/FormattedLink"
import { LoginInfo } from "../../components/LoginInfo"
import { getAffiliations, getGOOD, getUserAffiliations, getUserFromCtx, isUser, prisma } from "../../utils/db"
import { GOODData, PartialAffiliation } from "../../utils/types"
import { copy, dateFormatter, doFetch, mergeTemplate } from "../../utils/utils"


interface Props {
  user: User
  experimentData: {
    experiment: {
      name: string
      slug: string
      template: any
    }
    createdOn: Date
  }[]
  affiliations: PartialAffiliation[]
  userAffiliations: number[]
}

export default function ProcessingPage({ user, experimentData, affiliations, userAffiliations }: Props) {
  const desc = "View your processed GOODs!"

  const router = useRouter()

  const [toast, setToast] = useState("")
  const [loadedData, setLoadedData] = useState(null as GOODData | null)

  const [selectedAffiliations, setSelected] = useState(userAffiliations)

  useEffect(() => {
    async function fetchGOOD() {
      setLoadedData(await (await fetch(`/api/good?id=${user.GOODId}`)).json())
    }
    fetchGOOD()
  }, [user.GOODId])

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

      {experimentData.length == 0 ? <h4 className="text-md font-semibold py-2">No data processed yet, please come back later!</h4> :
      <><h4 className="text-lg font-semibold py-2">Processed experiment data</h4>
      <table className="table table-zebra table-compact w-full table-auto">
        <thead>
          <tr>
            <th>Experiment</th>
            <th>Processed on</th>
            <th>Pre-merged</th>
          </tr>
        </thead>
        <tbody>
          {experimentData.sort((a, b) => a.experiment.name.localeCompare(b.experiment.name)).map(c => <tr key={c.experiment.name}>
            <th>
              <FormattedLink href={`/experiments/${c.experiment.slug}`} className="link-hover link-primary">{c.experiment.name}</FormattedLink>
            </th>
            <th suppressHydrationWarning>{dateFormatter.format(c.createdOn)}</th>
            <th>
              {loadedData ? <button
                className="btn btn-primary btn-sm"
                onClick={() => copy(JSON.stringify(mergeTemplate(loadedData, c.experiment.template)))}
              >
                Copy
              </button> : <>Loading...</>}
            </th>
          </tr>)}
        </tbody>
      </table></>}

      <div className="divider" />

      <h4 className="text-lg font-semibold py-2">User settings</h4>
      <AffiliationSelector selectedAffiliations={selectedAffiliations} setSelected={setSelected} affiliations={affiliations} />
      <button
          className={"btn btn-primary w-full my-2"}
          onClick={async () => {
            await doFetch("/api/patch-user", JSON.stringify({
              affiliations: selectedAffiliations
            }), setToast, router)
          }}
        >
          Update
        </button>
      {user.admin && <FormattedLink className="text-2xl font-bold pt-1 link link-hover link-primary" href="/admin">Admin panel</FormattedLink>}

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

  const experimentData = await prisma.experimentData.findMany({
    where: {
      userId: user.id,
      GOODId: user.GOODId,
      experiment: {
        public: true
      }
    },
    select: {
      createdOn: true,
      experiment: {
        select: {
          slug: true,
          name: true,
          template: true
        }
      }
    }
  })

  return {
    props: {
      user,
      experimentData,
      affiliations: await getAffiliations(user.id),
      userAffiliations: (await getUserAffiliations(user.id))?.affiliations.map(x => x.id) ?? []
    }
  }
}
