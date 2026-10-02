import { getEntities } from '@/lib/runtime-api'
import type { EntityItem } from '@/lib/runtime-api'

export const dynamic = 'force-dynamic'

interface ProjectData {
  slug?: string
  title?: string
  location?: string
  body?: string
  card_src?: string
  category?: 'completed' | 'in-progress'
  featured?: boolean
  featured_blurb?: string
  published?: boolean
}

function ProjectCard({ project }: { project: EntityItem }) {
  const data = project.data as ProjectData
  const title = data.title || data.slug || 'Project'
  return (
    <article className="border border-stone-800 bg-stone-950/80 overflow-hidden">
      {data.card_src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={data.card_src} alt={title} className="h-48 w-full object-cover" />
      ) : (
        <div className="h-48 w-full bg-stone-900" />
      )}
      <div className="p-6 space-y-2">
        <p className="font-mono text-[11px] uppercase tracking-widest text-stone-500">
          {data.category === 'in-progress' ? 'In progress' : 'Completed'}
          {data.location ? ` · ${data.location}` : ''}
        </p>
        <h2 className="font-sans text-xl font-semibold text-white">{title}</h2>
        {data.featured_blurb || data.body ? (
          <p className="text-sm text-stone-400 leading-relaxed line-clamp-3">
            {data.featured_blurb || data.body}
          </p>
        ) : null}
      </div>
    </article>
  )
}

export default async function ProjectsPage() {
  const projects = await getEntities('project')

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-sans text-3xl font-semibold text-white">Projects</h1>
      <p className="mt-2 text-sm text-stone-400">
        Work managed in the workspace Projects asset.
      </p>
      {projects.length === 0 ? (
        <p className="mt-10 text-sm text-stone-500">No projects published yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </main>
  )
}
