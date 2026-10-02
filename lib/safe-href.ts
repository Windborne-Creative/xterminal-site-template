const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])

function hasForbiddenChar(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i)
    if (code <= 0x1f || code === 0x7f || code === 0x2028 || code === 0x2029) return true
  }
  return false
}

/**
 * Same rules as lib/safe-href.ts in the platform app.
 * The client template ships as its own repo, so this copy lives here.
 * https, http, mailto, tel, or a same-site path (`/` or `#`).
 */
export function safeHref(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed || hasForbiddenChar(trimmed)) return null

  if (trimmed.startsWith('#') || (trimmed.startsWith('/') && !trimmed.startsWith('//'))) {
    if (trimmed.includes('\\')) return null
    return trimmed
  }

  try {
    const url = new URL(trimmed)
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) return null
    return url.href
  } catch {
    return null
  }
}
