import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/layout/Container'
import LoginForm from './LoginForm'
import LogoutButton from '@/components/layout/LogoutButton'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <Container>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        {user ? (
          <div className="flex flex-col gap-4 w-full max-w-sm border border-border p-6">
            <p className="text-xs text-muted uppercase tracking-wider">Authenticated</p>
            <p className="text-sm font-mono text-foreground">{user.email}</p>
            <LogoutButton />
          </div>
        ) : (
          <LoginForm />
        )}
      </div>
    </Container>
  )
}
