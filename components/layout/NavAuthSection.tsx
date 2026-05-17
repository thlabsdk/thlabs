import Link from 'next/link'
import LogoutButton from './LogoutButton'

interface Props {
  userEmail: string | null
}

export function NavAuthSection({ userEmail }: Props) {
  if (!userEmail) {
    return (
      <Link
        href="/login"
        className="text-sm text-muted hover:text-foreground transition-colors duration-150"
      >
        Login
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-mono text-muted">{userEmail}</span>
      <LogoutButton />
    </div>
  )
}
