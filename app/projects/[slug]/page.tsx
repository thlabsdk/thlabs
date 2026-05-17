import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/layout/Container'
import { PROJECTS } from '@/lib/projects'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const project = PROJECTS.find((p) => p.slug === slug)
  if (!project) notFound()

  if (project.visibility === 'private') {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')
  }

  return (
    <Container>
      <section className="pt-24 pb-32">
        <p className="text-xs font-mono text-muted">
          projects / {project.slug}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          {project.name}
        </h1>
        <p className="mt-1 text-xs font-mono text-muted">
          {project.status} · {project.visibility}
        </p>

        <div className="mt-8 border-t border-border" />

        {project.summary && (
          <p className="mt-8 text-sm text-muted max-w-lg">{project.summary}</p>
        )}

        {project.stack && project.stack.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-mono uppercase tracking-wider text-muted">
              Stack
            </p>
            <p className="mt-2 text-sm font-mono text-foreground">
              {project.stack.join(', ')}
            </p>
          </div>
        )}

        <div className="mt-8">
          <p className="text-xs font-mono uppercase tracking-wider text-muted">
            Deployment
          </p>
          <p className="mt-2 text-sm font-mono text-foreground">
            {project.status}
            {project.externalUrl ? (
              <>
                {' · '}
                <a
                  href={project.externalUrl}
                  className="underline underline-offset-4 hover:text-muted transition-colors duration-150"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open project →
                </a>
              </>
            ) : (
              ' · —'
            )}
          </p>
        </div>
      </section>
    </Container>
  )
}
