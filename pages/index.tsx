import Head from "next/head"
import FormattedLink from "../components/FormattedLink"
import { isGUOBAActive } from "../utils/utils"

export default function MainPage() {
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

      <h3 className="text-2xl font-bold pt-1" id="participation">Participating</h3>
      <p>If you want to participate in this project, all you need to do is enter your artifacts into <FormattedLink href="https://frzyc.github.io/genshin-optimizer/"
          target="go">Genshin Optimizer</FormattedLink> by either manually entering them (not recommended) or via some scanner (read <FormattedLink
          href="https://frzyc.github.io/genshin-optimizer/#/scanner" target="go-scan">GenshinOptimizer&apos;s scanner page</FormattedLink> for more information) and exporting
          the database. Make sure that these artifacts are correct; as you&apos;ll be required to verify some of them with Enka.Network as well as you won&apos;t be able to edit them later.
          Optionally, you can also enter your Weapons and Characters but they don&apos;t need to be properly equipped with artifacts/weapons.</p>

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
            Note: The form is currently closed. Feel free to come back later!
          </div>
      }

      <FormattedLink className="text-2xl font-bold pt-1 link link-hover link-primary" href="/experiments">View experiments</FormattedLink>
    </main>
  )
}
