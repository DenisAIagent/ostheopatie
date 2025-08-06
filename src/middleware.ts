import createIntlMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from './lib/supabase-middleware'

const intlMiddleware = createIntlMiddleware({
  // A list of all locales that are supported
  locales: ['fr', 'pt', 'en'],

  // Used when no locale matches
  defaultLocale: 'fr',

  // Always show the locale prefix in the URL
  localePrefix: 'always'
})

export default async function middleware(request: NextRequest) {
  // Handle internationalization first
  const intlResponse = intlMiddleware(request)

  // For auth-protected routes, check authentication
  const { pathname } = request.nextUrl
  const isAuthRoute = pathname.includes('/auth/')
  const isProtectedRoute = pathname.includes('/dashboard') || pathname.includes('/admin')

  if (isProtectedRoute) {
    const { supabase, response } = createMiddlewareClient(request)
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      const locale = pathname.split('/')[1] || 'fr'
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url))
    }
    
    return response
  }

  // For auth routes when already logged in, redirect to dashboard
  if (isAuthRoute) {
    const { supabase } = createMiddlewareClient(request)
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      const locale = pathname.split('/')[1] || 'fr'
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
    }
  }

  return intlResponse
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(fr|pt|en)/:path*']
}