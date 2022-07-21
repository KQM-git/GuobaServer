import Head from "next/head"
import FormattedLink from "../components/FormattedLink"

export default function Custom500() {
    return <main className="max-w-5xl w-full px-1">
        <Head>
            <title>A Server Error occurred | The GUOBA Project</title>
        </Head>
        <h1 className="text-6xl">500 - A Server Error occurred</h1>
        <FormattedLink href="/" location="/500">Home</FormattedLink>
    </main>
}
