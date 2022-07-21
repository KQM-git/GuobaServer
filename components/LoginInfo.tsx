import { useRouter } from "next/router"
import { ReactElement } from "react"
import { DiscordAvatar } from "./DiscordAvatar"

export function LoginInfo({ user, children }: { user: { id: string, avatar: string, username: string, tag: string | number }, children?: ReactElement | ReactElement[] }) {
  const router = useRouter()
  return <>
    <button className="btn btn-sm btn-outline btn-error float-right" onClick={async () => {
      if ((await fetch("/api/logout", {
        method: "POST"
      })).status == 204)
        router.push("/")
    }}>
      Logout
    </button>
    <h1 className="text-5xl font-bold pb-2">
      The GUOBA Project
    </h1>
    {children}
    <div className="text-base">
      Logged in as: <DiscordAvatar user={user} /> {user.username}<span className="text-xs">#{user.tag}</span>
    </div>
  </>
}
