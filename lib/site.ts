export const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_BASE_URL?.replace(/\/$/, '') || 'https://app.xterminal.dev'

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://example-client-site.com'

// Keep browser form submits same-origin to avoid CORS failures.
export const CONTACT_ENDPOINT = '/api/contact'

export const ASSET_BASE_URL =
  process.env.NEXT_PUBLIC_MARKETING_ASSET_BASE_URL?.replace(/\/$/, '') || APP_BASE_URL

export function siteAsset(path: string): string {
  if (!path.startsWith('/')) return `${ASSET_BASE_URL}/${path}`
  return `${ASSET_BASE_URL}${path}`
}
