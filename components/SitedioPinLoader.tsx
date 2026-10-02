'use client'

import { useEffect } from 'react'

/** App that serves /sitedio-pin.js. Override with NEXT_PUBLIC_SITEDIO_APP_ORIGIN for local dev. */
export const SITEDIO_APP_ORIGIN = 'https://app.sitedio.ai'

const ALLOWED_APP_ORIGINS = [
  'https://app.sitedio.ai',
  'https://app.xterminal.dev',
  'https://www.sitedio.ai',
  'https://www.xterminal.dev',
]

export const SITEDIO_PIN_SCRIPT_ID = 'sitedio-pin-script'
const SITEDIO_PIN_STORAGE_KEY = 'sitedio-pin'
const SITEDIO_PIN_HASH_MARK = 'sitedio-pin='

export function resolveSitedioAppOrigin(override?: string | null): string {
  const value = (override ?? '').trim()
  if (ALLOWED_APP_ORIGINS.includes(value)) return value
  try {
    const url = new URL(value)
    if (url.protocol === 'http:' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
      return url.origin
    }
  } catch {
    // A bad override falls through to SITEDIO_APP_ORIGIN.
  }
  return SITEDIO_APP_ORIGIN
}

type PinWindow = Window & { __sitedioPinStarted?: boolean }

/**
 * Inject the picker once when a pin fragment or the picker's session key is present.
 * The picker reads the hash, writes sessionStorage, and strips the hash. This loader does not.
 */
export function loadSitedioPin(
  doc: Document,
  hash: string,
  readSession: () => string | null,
  started: boolean,
  origin: string,
): boolean {
  if (started || doc.getElementById(SITEDIO_PIN_SCRIPT_ID)) return false
  let stored = ''
  try {
    const value = readSession()
    if (typeof value === 'string') stored = value
  } catch {
    stored = ''
  }
  if (!hash.includes(SITEDIO_PIN_HASH_MARK) && !stored) return false
  const script = doc.createElement('script')
  script.id = SITEDIO_PIN_SCRIPT_ID
  script.async = true
  script.src = `${origin}/sitedio-pin.js`
  ;(doc.head ?? doc.documentElement).appendChild(script)
  return true
}

export function attachSitedioPinLoader(
  target: Window,
  doc: Document,
  readSession: () => string | null,
  origin: string,
): () => void {
  const pinWindow = target as PinWindow
  const run = () => {
    loadSitedioPin(doc, target.location.hash, readSession, Boolean(pinWindow.__sitedioPinStarted), origin)
  }
  run()
  target.addEventListener('hashchange', run)
  return () => target.removeEventListener('hashchange', run)
}

export default function SitedioPinLoader() {
  useEffect(() => {
    return attachSitedioPinLoader(
      window,
      document,
      () => window.sessionStorage.getItem(SITEDIO_PIN_STORAGE_KEY),
      resolveSitedioAppOrigin(process.env.NEXT_PUBLIC_SITEDIO_APP_ORIGIN),
    )
  }, [])
  return null
}
