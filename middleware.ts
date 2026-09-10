import { NextRequest, NextResponse } from 'next/server'
import {
  CLICK_ID_COOKIE_MAX_AGE,
  persistAttributionCookies,
} from '@/lib/click-ids'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const secure = process.env.NODE_ENV === 'production'

  persistAttributionCookies({
    searchParams: request.nextUrl.searchParams,
    cookies: request.cookies,
    write: {
      set(name, value) {
        response.cookies.set(name, value, {
          httpOnly: true,
          secure,
          sameSite: 'lax',
          path: '/',
          maxAge: CLICK_ID_COOKIE_MAX_AGE,
        })
      },
    },
    landingPage: `${request.nextUrl.pathname}${request.nextUrl.search}`,
    referrer: request.headers.get('referer'),
    now: new Date().toISOString(),
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Run on every document request ads can land on (home, inner pages, contact, /go).
     * Skip the contact proxy and other API routes, Next internals, and static files.
     */
    '/((?!api/|_next/|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|map)$).*)',
  ],
}
