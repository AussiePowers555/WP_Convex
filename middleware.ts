import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// For now, we'll make the dashboard publicly accessible
// Later you can add JWT/session checking here
export function middleware(request: NextRequest) {
  // Allow all requests for now
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}