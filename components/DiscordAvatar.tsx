export function DiscordAvatar({ user }: { user: { id: string, avatar: string | null } }) {
    // eslint-disable-next-line @next/next/no-img-element
    return user.avatar ? <img
        src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=16`}
        alt="Discord avatar"
        width={16}
        height={16}
        className="rounded-xl p-0 m-0 inline-block"
    /> : <></>
}

export function DiscordUser({ user }: { user: { id: string, avatar: string | null, username: string, tag: number | string} }) {
   return <><DiscordAvatar user={user} /> {user.username}{user.tag != "0" && <span className="text-xs">#{user.tag}</span>}</>
}
