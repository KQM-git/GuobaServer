import { GetStaticPropsResult } from "next"
import Head from "next/head"
import FormattedLink from "../components/FormattedLink"
import { getExperimentList, getExperiments } from "../utils/db"
import { isGUOBAActive } from "../utils/utils"

interface ExperimentMeta {
  name: string
  slug: string
  active: boolean
}
interface Props {
  experiments: ExperimentMeta[]
}

export default function MainPage({ location, experiments }: Props & { location: string }) {
  const desc = "The GUOBA Project intends to map out how the artifacts of players perform to improve mathematical models/artifact standards for calculations such as the KQMS."
  return (
    <main className="max-w-5xl w-full px-1">
      <Head>
        <title>The GUOBA Project</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="The GUOBA Project" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <h1 className="text-5xl font-bold pb-2">
        The GUOBA Project
      </h1>

      <h3 className="text-2xl font-bold pt-1" id="about">About &lsquo;The GUOBA Project&rsquo;</h3>
      <p>This is a project to map out how the artifacts of players perform to improve mathematical models/artifact standards for calculations.
        The problem with simulating artifacts is that it&apos;s hard to verify if results that come from them are correct. Players have different
        strategies when selecting which domain to farm/which artifact to upgrade/which to trash. In previous iterations we&apos;ve used this data
        to map out ER vs EM for a four piece Viridescent Venerer set.</p>

      {
        isGUOBAActive() ? <>
          <div className="flex justify-center m-6">
            <FormattedLink href="user/submit" className="btn btn-primary btn-lg ">
              Submit your own data here.
            </FormattedLink>
          </div>
        </>
          :
          <div className="font-bold text-xl text-red-700 dark:text-red-400">
            Note: The form is currently closed.
          </div>
      }

      <h3 className="text-2xl font-bold pt-1" id="experiments">List of Experiments</h3>
      <List experiments={experiments.filter(x => x.active)} location={location} />

      <details>
        <summary className="text-xl font-bold pt-1" id="archived-experiments">Archived Experiments</summary>
        <List experiments={experiments.filter(x => !x.active)} location={location} />
      </details>

    </main>
  )
}
function List({ experiments, location }: { experiments: ExperimentMeta[], location: string }) {
  return <ul>
    {experiments.map(experiment => (<li key={experiment.name}>
      -{" "}
      <FormattedLink href={`/experiments/${experiment.slug}`} location={location} className="font-semibold text-l">
        {experiment.name}
      </FormattedLink>
    </li>))}
  </ul>
}

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  return {
    props: {
      experiments: await getExperimentList()
    },
    revalidate: 60 * 60 * 2
  }
}
