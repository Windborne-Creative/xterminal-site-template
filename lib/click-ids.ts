export const CLICK_ID_KEYS = ['gclid', 'gbraid', 'wbraid', 'fbclid'] as const

export const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const

export const ATTRIBUTION_META_KEYS = [
  'landing_page',
  'referrer',
  'first_touch_at',
  'last_touch_at',
] as const

export const ATTRIBUTION_KEYS = [
  ...CLICK_ID_KEYS,
  ...UTM_KEYS,
  ...ATTRIBUTION_META_KEYS,
] as const

export type ClickIdKey = (typeof CLICK_ID_KEYS)[number]
export type UtmKey = (typeof UTM_KEYS)[number]
export type AttributionMetaKey = (typeof ATTRIBUTION_META_KEYS)[number]
export type AttributionKey = (typeof ATTRIBUTION_KEYS)[number]

export const CLICK_ID_COOKIE_MAX_AGE = 90 * 24 * 60 * 60

export function clickIdCookieName(key: AttributionKey): string {
  return `xt_${key}`
}

export function nonEmptyText(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) return null
  return value
}

export type AttributionCookieReader = {
  get: (name: string) => { value: string } | undefined
}

export function readAttributionCookies(
  cookies: AttributionCookieReader
): Partial<Record<AttributionKey, string>> {
  const next: Partial<Record<AttributionKey, string>> = {}
  for (const key of ATTRIBUTION_KEYS) {
    const value = nonEmptyText(cookies.get(clickIdCookieName(key))?.value)
    if (value) next[key] = value
  }
  return next
}

export function injectAttributionFields(
  payload: Record<string, unknown>,
  cookies: AttributionCookieReader
): Record<string, unknown> {
  const next = { ...payload }
  const stored = readAttributionCookies(cookies)
  for (const key of ATTRIBUTION_KEYS) {
    if (nonEmptyText(next[key])) continue
    const fromCookie = stored[key]
    if (fromCookie) next[key] = fromCookie
  }
  return next
}

export type AttributionCookieWriter = {
  set: (name: string, value: string) => void
}

/**
 * Persist lead attribution on document requests.
 * Click IDs are write-once per key. UTMs overwrite when a new value arrives.
 * landing_page, referrer, and first_touch_at are write-once on the first visit.
 * last_touch_at updates on the first visit and whenever a tracked query param arrives.
 * gbraid / wbraid are never copied into gclid.
 */
export function persistAttributionCookies(args: {
  searchParams: Pick<URLSearchParams, 'get'>
  cookies: AttributionCookieReader
  write: AttributionCookieWriter
  landingPage: string
  referrer: string | null
  now: string
}): void {
  const { searchParams, cookies, write, landingPage, referrer, now } = args
  let sawTrackedParam = false

  for (const key of CLICK_ID_KEYS) {
    const incoming = nonEmptyText(searchParams.get(key))
    if (!incoming) continue
    sawTrackedParam = true
    if (nonEmptyText(cookies.get(clickIdCookieName(key))?.value)) continue
    write.set(clickIdCookieName(key), incoming)
  }

  for (const key of UTM_KEYS) {
    const incoming = nonEmptyText(searchParams.get(key))
    if (!incoming) continue
    sawTrackedParam = true
    write.set(clickIdCookieName(key), incoming)
  }

  const hasFirstTouch = Boolean(
    nonEmptyText(cookies.get(clickIdCookieName('first_touch_at'))?.value)
  )

  if (!hasFirstTouch) {
    if (landingPage) write.set(clickIdCookieName('landing_page'), landingPage)
    if (referrer) write.set(clickIdCookieName('referrer'), referrer)
    write.set(clickIdCookieName('first_touch_at'), now)
    write.set(clickIdCookieName('last_touch_at'), now)
    return
  }

  if (sawTrackedParam) {
    write.set(clickIdCookieName('last_touch_at'), now)
  }
}
