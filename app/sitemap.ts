import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Campaign landings under /go stay out of the sitemap. They are noindex.
const PUBLIC_PATHS = [
  '/',
  '/about',
  '/features',
  '/pricing',
  '/blog',
  '/contact',
  '/team',
  '/menu',
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.6,
  }))
}
