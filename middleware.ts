import { NextRequest, NextResponse } from 'next/server'
import {
  CLICK_ID_COOKIE_MAX_AGE,
  CLICK_ID_KEYS,
  clickIdCookieName,
} from '@/lib/click-ids'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const secure = process.env.NODE_ENV === 'production'

  for (const key of CLICK_ID_KEYS) {
    const value = request.nextUrl.searchParams.get(key)
    if (!value) continue

    response.cookies.set(clickIdCookieName(key), value, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: CLICK_ID_COOKIE_MAX_AGE,
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Run on every document request ads can land on (home, inner pages, contact).
     * Skip the contact proxy and other API routes, Next internals, and static files.
     */
    '/((?!api/|_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|map)$).*)',
  ],
}
