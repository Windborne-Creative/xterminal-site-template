export const CLICK_ID_KEYS = ['gclid', 'gbraid', 'wbraid'] as const

export type ClickIdKey = (typeof CLICK_ID_KEYS)[number]

export const CLICK_ID_COOKIE_MAX_AGE = 90 * 24 * 60 * 60

export function clickIdCookieName(key: ClickIdKey): string {
  return `xt_${key}`
}

export function nonEmptyText(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) return null
  return value
}
