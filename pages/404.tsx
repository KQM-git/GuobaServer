import Head from "next/head"
import FormattedLink from "../components/FormattedLink"

export default function Custom404() {
    return <main className="max-w-5xl w-full px-1">
        <Head>
            <title>Page Not Found | The GUOBA Project</title>
        </Head>
        <h1 className="text-6xl">404 - Page Not Found</h1>
        <FormattedLink href="/" location="/404">Home</FormattedLink>
    </main>
}
