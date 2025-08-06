import createIntlMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'

const intlMiddleware = createIntlMiddleware({
  // A list of all locales that are supported
  locales: ['fr', 'pt', 'en'],

  // Used when no locale matches
  defaultLocale: 'fr',

  // Always show the locale prefix in the URL
  localePrefix: 'always'
})

export default function middleware(request: NextRequest) {
  // Only handle internationalization for now
  // Auth protection will be handled in layout components
  return intlMiddleware(request)
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(fr|pt|en)/:path*']
}