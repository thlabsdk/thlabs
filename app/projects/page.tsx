import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/layout/Container'
import { getVisibleProjects } from '@/lib/projects'

export default async function Projects() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const projects = getVisibleProjects(!!user)

  return (
    <Container>
      <section className="pt-24 pb-32">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Projects
        </h1>
        <p className="mt-4 text-base text-muted max-w-lg">
          Experiments, tools, and systems under development.
        </p>
        <ul className="mt-12 divide-y divide-border">
          {projects.map((project) => (
            <li key={project.slug}>
              <a
                href={project.href}
                className="flex flex-col gap-1 py-5 group"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-xs font-mono text-muted tracking-wide">
                    {project.slug}
                  </span>
                  <span className="text-xs font-mono text-muted">
                    {project.visibility} · {project.status}
                  </span>
                </div>
                <span className="text-base font-semibold text-foreground group-hover:text-muted transition-colors duration-150">
                  {project.name}
                </span>
                <p className="text-sm text-muted">{project.description}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  )
}
