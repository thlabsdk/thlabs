'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSent(false)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: false,
      },
    })
    if (error) {
      setError(
        error.status === 429
          ? 'Too many login attempts.\nPlease wait a moment before trying again.'
          : 'Access is restricted.'
      )
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm">
        <p className="text-sm text-muted">Magic link sent.</p>
        <p className="text-sm text-muted">Check your email.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-xs text-muted uppercase tracking-wider">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-surface border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-muted"
          placeholder="you@example.com"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="border border-border px-4 py-2 text-sm text-foreground hover:bg-surface transition-colors duration-150 disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send magic link'}
      </button>
      {error && (
        <div className="flex flex-col gap-0.5">
          {error.split('\n').map((line, i) => (
            <p key={i} className="text-sm text-muted">{line}</p>
          ))}
        </div>
      )}
    </form>
  )
}
