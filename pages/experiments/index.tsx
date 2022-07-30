import { GetStaticPropsResult } from "next"
import Head from "next/head"
import FormattedLink from "../../components/FormattedLink"
import { getExperimentList } from "../../utils/db"
import { SmallExperimentMeta } from "../../utils/types"

interface Props {
  experiments: SmallExperimentMeta[]
}

export default function ExperimentsPage({ location, experiments }: Props & { location: string }) {
  const desc = "The GUOBA Project intends to map out how the artifacts of players perform to improve mathematical models/artifact standards for calculations such as the KQMS."
  return (
    <main className="max-w-5xl w-full px-1">
      <Head>
        <title>Experiments | The GUOBA Project</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Experiments | The GUOBA Project" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <div className="text-sm breadcrumbs">
        <ul>
          <li>Experiments</li>
        </ul>
      </div>

      <h1 className="text-5xl font-bold pb-2">
        The GUOBA Project
      </h1>

      <h3 className="text-2xl font-bold pt-1" id="experiments">List of Experiments</h3>
      <List experiments={experiments.filter(x => x.active)} location={location} />

      <details>
        <summary className="text-xl font-bold pt-1" id="archived-experiments">Archived Experiments</summary>
        <List experiments={experiments.filter(x => !x.active)} location={location} />
      </details>
    </main>
  )
}
function List({ experiments, location }: { experiments: SmallExperimentMeta[], location: string }) {
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
    revalidate: 15 * 60
  }
}
