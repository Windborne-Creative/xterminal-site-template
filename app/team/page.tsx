import { getEntities } from '@/lib/runtime-api'
import type { EntityItem } from '@/lib/runtime-api'
import { safeHref } from '@/lib/safe-href'
import { Mail, Linkedin, Phone } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface TeamMemberData {
  name?: string
  title?: string
  bio?: string
  photo_url?: string
  email?: string
  phone?: string
  linkedin_url?: string
  show_email?: boolean
  show_phone?: boolean
  show_linkedin?: boolean
}

function TeamCard({ member }: { member: EntityItem }) {
  const d = member.data as TeamMemberData
  const linkedinHref = safeHref(d.linkedin_url)
  return (
    <div className="border border-stone-800 bg-stone-950/80 p-6 flex flex-col gap-4">
      {d.photo_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={d.photo_url}
          alt={d.name || ''}
          className="h-32 w-32 rounded-full object-cover border border-stone-700 mx-auto"
        />
      ) : (
        <div className="h-32 w-32 rounded-full bg-stone-800 border border-stone-700 mx-auto flex items-center justify-center">
          <span className="text-2xl font-semibold text-stone-500">
            {d.name?.[0]?.toUpperCase() ?? '?'}
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="font-sans text-lg font-semibold text-white">{d.name || 'Team Member'}</h3>
        {d.title && (
          <p className="mt-0.5 font-mono text-[12px] uppercase tracking-widest text-stone-400">{d.title}</p>
        )}
      </div>

      {d.bio && (
        <p className="text-sm text-stone-400 leading-relaxed text-center">{d.bio}</p>
      )}

      <div className="flex items-center justify-center gap-4 mt-auto pt-2">
        {d.show_email && d.email && (
          <a
            href={`mailto:${d.email}`}
            className="text-stone-500 hover:text-white transition-colors"
            title={d.email}
          >
            <Mail size={16} />
          </a>
        )}
        {d.show_phone && d.phone && (
          <a
            href={`tel:${d.phone}`}
            className="text-stone-500 hover:text-white transition-colors"
            title={d.phone}
          >
            <Phone size={16} />
          </a>
        )}
        {d.show_linkedin && linkedinHref && (
          <a
            href={linkedinHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-500 hover:text-white transition-colors"
            title="LinkedIn"
          >
            <Linkedin size={16} />
          </a>
        )}
      </div>
    </div>
  )
}

export default async function TeamPage() {
  const members = await getEntities('team_member')

  return (
    <section className="mb-20 sm:mb-24 md:mb-32 lg:mb-36">
      <div className="border border-stone-800 bg-stone-950/80 p-6 mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-stone-400">Team</p>
        <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-white">Our Team</h1>
        <p className="mt-3 max-w-3xl text-sm text-stone-400">
          Meet the people behind the company.
        </p>
      </div>

      {members.length === 0 ? (
        <div className="border border-stone-800 bg-stone-950/80 p-12 text-center">
          <p className="text-sm text-stone-500">No team members yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </section>
  )
}
