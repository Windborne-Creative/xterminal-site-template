import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Campaign landing',
  description: 'Paid-traffic landing page stub. Replace copy per campaign.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/go',
  },
}

export default function CampaignLandingPage() {
  return (
    <section className="mb-20 flex min-h-[calc(100svh-7rem)] flex-col justify-center border border-stone-800 bg-stone-950/80 px-5 py-10 sm:mb-24 sm:px-7 sm:py-12 md:mb-32 md:min-h-[calc(100svh-8rem)] md:px-10 md:py-14 lg:mb-36">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-stone-400">
        Campaign landing
      </p>
      <h1 className="max-w-4xl font-sans text-3xl font-semibold leading-tight tracking-[-0.02em] text-white sm:text-4xl md:text-5xl">
        Replace this stub with the paid-traffic landing page for this campaign.
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-stone-300 sm:text-base md:mt-5">
        Keep this route noindex and out of the sitemap. Attribution cookies still
        run here so form submits can carry click IDs, UTMs, and touch timestamps.
      </p>
      <div className="mt-7">
        <Link
          href="/contact"
          className="btn-invert-light inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold"
        >
          Open contact form
        </Link>
      </div>
    </section>
  )
}
