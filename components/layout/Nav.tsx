import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Container } from './Container'
import { NavLinks } from './NavLinks'
import { NavAuthSection } from './NavAuthSection'

export async function Nav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="border-b border-border">
      <Container>
        <nav className="flex items-center justify-between py-6">
          <Link
            href="/"
            className="text-sm font-medium tracking-tight text-foreground transition-colors duration-150 hover:text-muted"
          >
            THLabs
          </Link>
          <div className="flex items-center gap-8">
            <NavLinks />
            <NavAuthSection userEmail={user?.email ?? null} />
          </div>
        </nav>
      </Container>
    </header>
  )
}
