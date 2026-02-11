/**
 * ORBIT Security Middleware
 *
 * This middleware adds security headers to all responses and can be extended
 * with rate limiting, authentication checks, and other security features.
 *
 * Security Agent: security-agent
 * Created: 2026-02-11
 * Priority: HIGH
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware function that runs on every request
 *
 * Applied to: All routes (see config.matcher below)
 */
export function middleware(request: NextRequest) {
  // Clone the response to modify headers
  const response = NextResponse.next()

  // ============================================================================
  // SECURITY HEADERS
  // ============================================================================

  /**
   * Strict-Transport-Security (HSTS)
   * Forces HTTPS connections for 1 year
   * - max-age=31536000: 1 year in seconds
   * - includeSubDomains: Apply to all subdomains
   * - preload: Allow browser preload lists
   */
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )

  /**
   * X-Frame-Options
   * Prevents clickjacking attacks
   * - DENY: Cannot be embedded in any iframe
   * Alternative: SAMEORIGIN (allow same-origin embedding)
   *
   * TODO: Change to SAMEORIGIN if embedding is needed
   */
  response.headers.set('X-Frame-Options', 'DENY')

  /**
   * X-Content-Type-Options
   * Prevents MIME-sniffing attacks
   * - nosniff: Browser must respect Content-Type header
   */
  response.headers.set('X-Content-Type-Options', 'nosniff')

  /**
   * X-XSS-Protection
   * Legacy XSS protection (for older browsers)
   * Modern browsers use CSP instead
   * - 1: Enable XSS filter
   * - mode=block: Block page if XSS detected
   */
  response.headers.set('X-XSS-Protection', '1; mode=block')

  /**
   * Referrer-Policy
   * Controls referrer information sent with requests
   * - strict-origin-when-cross-origin: Send full URL to same origin,
   *   only origin to cross-origin, nothing if downgrading HTTPS to HTTP
   */
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  /**
   * Permissions-Policy (formerly Feature-Policy)
   * Controls which browser features can be used
   * Disabled features:
   * - camera: No camera access
   * - microphone: No microphone access
   * - geolocation: No location tracking
   * - payment: No payment API (may enable for Web3 wallets later)
   *
   * TODO: Enable camera=() if QR code scanning is added
   */
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  )

  /**
   * Content-Security-Policy (CSP)
   * Prevents XSS, injection attacks, and unauthorized resource loading
   *
   * Configuration: MODERATE (Balanced security and compatibility)
   *
   * Directives:
   * - default-src 'self': Only load resources from same origin by default
   * - script-src: Allow scripts from same origin + inline (needed for Next.js)
   * - style-src: Allow styles from same origin + inline (needed for Tailwind)
   * - img-src: Allow images from same origin, data URIs, and HTTPS sources
   * - font-src: Allow fonts from same origin and data URIs
   * - connect-src: Allow connections to same origin, WebSocket, and APIs
   *   - wss://stream.binance.com: Real-time price data
   *   - https://api.coingecko.com: Price fallback
   *   - https://generativelanguage.googleapis.com: Gemini AI (if needed)
   * - frame-ancestors 'none': Cannot be embedded (redundant with X-Frame-Options)
   * - base-uri 'self': Restricts <base> tag URLs
   * - form-action 'self': Forms can only submit to same origin
   *
   * TODO: Tighten to STRICT mode after testing (remove 'unsafe-inline')
   */
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for Next.js dev
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' wss: https://api.coingecko.com https://stream.binance.com https://generativelanguage.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', cspDirectives)

  // ============================================================================
  // CORS CONFIGURATION (API Routes Only)
  // ============================================================================

  if (request.nextUrl.pathname.startsWith('/api/')) {
    /**
     * CORS Headers for API Routes
     *
     * Currently: Allow same-origin only
     * TODO: Configure specific origins when needed for external integrations
     */

    // Get origin from request
    const origin = request.headers.get('origin')

    // For now, only allow same-origin
    // TODO: Add whitelist of allowed origins for production
    if (origin && origin === new URL(request.url).origin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Max-Age', '86400') // 24 hours

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: response.headers,
      })
    }
  }

  // ============================================================================
  // RATE LIMITING (TODO)
  // ============================================================================

  // TODO: Implement rate limiting here
  // This will be added once the rate limiting library is ready
  //
  // Example:
  // const rateLimitResult = await checkRateLimit(request)
  // if (!rateLimitResult.success) {
  //   return new NextResponse('Rate limit exceeded', {
  //     status: 429,
  //     headers: {
  //       'Retry-After': rateLimitResult.retryAfter.toString()
  //     }
  //   })
  // }

  // ============================================================================
  // AUTHENTICATION CHECKS (TODO)
  // ============================================================================

  // TODO: Add authentication checks for protected routes
  // This will be added once the authentication system is ready
  //
  // Example:
  // if (request.nextUrl.pathname.startsWith('/api/alerts')) {
  //   const session = await getServerSession(request)
  //   if (!session) {
  //     return new NextResponse('Unauthorized', { status: 401 })
  //   }
  // }

  return response
}

/**
 * Middleware Configuration
 *
 * matcher: Routes where middleware should run
 * - Excludes: Static files, images, favicon, Next.js internals
 * - Includes: All other routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}

// ============================================================================
// SECURITY NOTES
// ============================================================================

/**
 * SECURITY IMPROVEMENTS IN THIS FILE:
 *
 * 1. ✅ HSTS: Forces HTTPS for 1 year
 * 2. ✅ X-Frame-Options: Prevents clickjacking
 * 3. ✅ X-Content-Type-Options: Prevents MIME sniffing
 * 4. ✅ X-XSS-Protection: Legacy XSS protection
 * 5. ✅ Referrer-Policy: Controls referrer leakage
 * 6. ✅ Permissions-Policy: Disables unnecessary browser features
 * 7. ✅ CSP: Comprehensive content security policy (MODERATE mode)
 * 8. ✅ CORS: Configured for same-origin (strict)
 * 9. 🟡 Rate Limiting: TODO - Placeholder ready
 * 10. 🟡 Authentication: TODO - Placeholder ready
 *
 * VERIFICATION STEPS:
 * 1. Run: npm run dev
 * 2. Open: http://localhost:3000
 * 3. Inspect Network tab > Response Headers
 * 4. Verify all security headers are present
 * 5. Test: https://securityheaders.com
 *
 * ADJUSTMENTS NEEDED:
 * - CSP: May need to adjust for specific APIs/CDNs
 * - CORS: Add whitelisted origins for production
 * - Rate Limiting: Implement when library is ready
 * - Authentication: Integrate when auth system is ready
 */
