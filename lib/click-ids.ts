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
  cookies: AttributionCookieReader,
  nowMs: number = Date.now(),
): Record<string, unknown> {
  const next = { ...payload }
  const stored = readAttributionCookies(cookies)
  for (const key of ATTRIBUTION_KEYS) {
    if (nonEmptyText(next[key])) continue
    const fromCookie = stored[key]
    if (fromCookie) next[key] = fromCookie
  }
  applyMetaBrowserIds(next, cookies, nowMs)
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

/**
 * Meta _fbp / _fbc shape: fb.<subdomain index>.<unix milliseconds>.<id>
 * Keep this pattern identical to the contact API parser.
 * Junk is dropped. A bad cookie must not fail the contact submission.
 */
export const META_BROWSER_ID_MAX_LENGTH = 512

const META_BROWSER_ID_RE = /^fb\.\d{1,4}\.\d{10,16}\.[A-Za-z0-9_-]+$/

export function parseMetaBrowserId(value: unknown): string | null {
  if (typeof value !== 'string') return null
  if (value.length === 0 || value.length > META_BROWSER_ID_MAX_LENGTH) return null
  if (!META_BROWSER_ID_RE.test(value)) return null
  return value
}

/**
 * Meta's server-side fbc when the pixel did not set _fbc:
 * fb.1.<unix ms>.<fbclid>. Index 1 is the value they tell you to send
 * when you build it yourself. Returns null when fbclid cannot sit in that shape.
 */
export function deriveFbcFromFbclid(fbclid: string, observedAtMs: number): string | null {
  if (!Number.isFinite(observedAtMs) || observedAtMs <= 0) return null
  const ms = Math.trunc(observedAtMs)
  if (ms <= 0) return null
  return parseMetaBrowserId(`fb.1.${ms}.${fbclid}`)
}

function touchObservedAtMs(payload: Record<string, unknown>, fallbackMs: number): number {
  for (const key of ['last_touch_at', 'first_touch_at'] as const) {
    const value = payload[key]
    if (typeof value !== 'string' || value.length === 0) continue
    const ms = Date.parse(value)
    if (Number.isFinite(ms) && ms > 0) return Math.trunc(ms)
  }
  return fallbackMs
}

function applyMetaBrowserIds(
  next: Record<string, unknown>,
  cookies: AttributionCookieReader,
  nowMs: number,
): void {
  const fbp = parseMetaBrowserId(next.fbp) ?? parseMetaBrowserId(cookies.get('_fbp')?.value)
  if (fbp) next.fbp = fbp
  else delete next.fbp

  const fbc = parseMetaBrowserId(next.fbc) ?? parseMetaBrowserId(cookies.get('_fbc')?.value)
  if (fbc) {
    next.fbc = fbc
    return
  }

  delete next.fbc
  const fbclid = nonEmptyText(next.fbclid)
  if (!fbclid) return
  const derived = deriveFbcFromFbclid(fbclid, touchObservedAtMs(next, nowMs))
  if (derived) next.fbc = derived
}
