import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /about, /api/auth)
  const path = request.nextUrl.pathname

  // Add CORS headers for API routes
  if (path.startsWith('/api/')) {
    // Get hostname of the request (e.g. localhost:3000, z-plot-app.vercel.app)
    const origin = request.headers.get('origin') || '*'
    
    // Return response with CORS headers
    return NextResponse.next({
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      },
    })
  }

  // Continue the middleware chain
  return NextResponse.next()
}

// Configure which paths should be handled by this middleware
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
  ],
}
