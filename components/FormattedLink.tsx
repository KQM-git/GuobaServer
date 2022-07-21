import Link from "next/link"
import { ForwardedRef, forwardRef } from "react"


const Wrapped = forwardRef(function FLink({ children, onClick, href, className = "", style={}, location, target = undefined }: any, innerRef: ForwardedRef<HTMLAnchorElement>) {
    return (
        <a ref={innerRef} className={`${className} no-underline transition-all duration-200`} style={style} onClick={onClick} href={href} target={target} >
            {children}
        </a>
    )
})

function FormattedLink({ children, href, className = "", style = {}, location, target = undefined, prefetch = undefined }: any) {
    return (
        <Link href={href} passHref prefetch={prefetch}><Wrapped location={location} className={className} target={target} style={style}>{children}</Wrapped></Link>
    )
}

export default FormattedLink
