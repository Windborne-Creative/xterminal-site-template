import { NextRequest, NextResponse } from 'next/server'
import { CLICK_ID_KEYS, clickIdCookieName, nonEmptyText } from '@/lib/click-ids'

const BACKEND_CONTACT_ENDPOINT =
  process.env.XT_BACKEND_CONTACT_ENDPOINT ||
  process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ||
  'https://app.example-platform.com/api/contact'

const TENANT_SLUG =
  process.env.XT_TENANT_SLUG ||
  process.env.NEXT_PUBLIC_XT_TENANT_SLUG ||
  'default'

function withClickIds(
  payload: Record<string, unknown>,
  request: NextRequest
): Record<string, unknown> {
  const next = { ...payload }
  for (const key of CLICK_ID_KEYS) {
    if (nonEmptyText(next[key])) continue
    const fromCookie = nonEmptyText(request.cookies.get(clickIdCookieName(key))?.value)
    if (fromCookie) next[key] = fromCookie
  }
  return next
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json().catch(() => ({}))
    const payload =
      raw && typeof raw === 'object' && !Array.isArray(raw)
        ? withClickIds(raw as Record<string, unknown>, request)
        : raw

    const upstream = await fetch(BACKEND_CONTACT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-xt-tenant-slug': TENANT_SLUG,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const text = await upstream.text()

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to submit contact request' },
      { status: 500 }
    )
  }
}
