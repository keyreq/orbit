/**
 * ORBIT News API Route - Server-Side Gemini Integration
 *
 * SECURITY FIX: This file moves the Gemini API call from client-side to server-side,
 * preventing API key exposure in the browser.
 *
 * Critical Security Issue Fixed:
 * - Before: API key was embedded in client-side JavaScript bundle
 * - After: API key is only accessible on the server
 *
 * Security Agent: security-agent
 * Created: 2026-02-11
 * Priority: CRITICAL
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { NewsSearchSchema, safeValidate } from '@/lib/validation'
import { checkRateLimit, createRateLimitResponse, getRateLimitHeaders, RATE_LIMITS } from '@/lib/ratelimit'

// ============================================================================
// SECURITY: API Key is only accessible server-side
// ============================================================================

if (!process.env.GEMINI_API_KEY) {
  console.error('CRITICAL: GEMINI_API_KEY environment variable is not set!')
  console.error('Add GEMINI_API_KEY to your .env.local file')
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'MISSING_API_KEY'
})

const modelId = 'gemini-2.5-flash'

// ============================================================================
// TYPES
// ============================================================================

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  url: string
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  timestamp: string
}

// ============================================================================
// NEWS SEARCH HANDLER
// ============================================================================

/**
 * POST /api/news
 *
 * Search for crypto news using Gemini AI with Google Search
 *
 * Request Body:
 * {
 *   "topic": "Bitcoin" // 1-100 characters
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": NewsItem[],
 *   "count": number
 * }
 *
 * Security:
 * - API key never exposed to client
 * - Input validation with Zod
 * - Rate limiting applied (TODO: once rate limiter is ready)
 * - Error messages don't leak sensitive info
 */
export async function POST(request: NextRequest) {
  try {
    // ========================================================================
    // STEP 1: Parse and validate request body
    // ========================================================================

    const body = await request.json()

    // Validate input with Zod schema
    const validation = safeValidate(NewsSearchSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          ...validation.error
        },
        { status: 400 }
      )
    }

    const { topic } = validation.data

    // ========================================================================
    // STEP 2: Check API key (fail fast if missing)
    // ========================================================================

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'PLACEHOLDER_API_KEY') {
      console.error('Gemini API key not configured')
      return NextResponse.json(
        {
          success: false,
          error: 'Service temporarily unavailable',
          message: 'News service is not configured. Please contact support.'
        },
        { status: 503 }
      )
    }

    // ========================================================================
    // STEP 3: Apply rate limiting
    // ========================================================================

    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.NEWS_SEARCH)
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult)
    }

    // ========================================================================
    // STEP 4: Call Gemini API (server-side only)
    // ========================================================================

    const prompt = `
      Search for the latest real-time news, twitter/x discussions, and macro events affecting: "${topic}".
      Focus on the last 24-48 hours.

      Return the response in a structured JSON array format (do not use markdown code blocks, just raw JSON).
      Each item should be an object with:
      - title: Brief headline
      - summary: 2-3 sentence summary of the event
      - source: The origin (e.g., "CoinDesk", "Twitter/X @user", "CNBC")
      - url: A link if available (or a placeholder if not found)
      - sentiment: "BULLISH", "BEARISH", or "NEUTRAL"
      - timestamp: A readable time string (e.g. "2h ago")

      Provide at least 4 distinct items.
    `

    const geminiResponse = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Note: responseMimeType not supported with googleSearch tool
        // We'll parse the JSON manually from the text response
      },
    })

    const text = geminiResponse.text

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error: 'No content returned',
          message: 'The AI service did not return any news items.'
        },
        { status: 500 }
      )
    }

    // ========================================================================
    // STEP 5: Parse and format response
    // ========================================================================

    // Strip markdown code blocks if present (Gemini sometimes wraps JSON in ```json ... ```)
    let cleanText = text.trim()
    if (cleanText.startsWith('```')) {
      // Remove opening ```json or ``` and closing ```
      cleanText = cleanText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const data = JSON.parse(cleanText)

    const newsItems: NewsItem[] = data.map((item: any, index: number) => ({
      id: `news-${Date.now()}-${index}`,
      title: item.title || 'Unknown Title',
      summary: item.summary || 'No summary available.',
      source: item.source || 'Web',
      url: item.url || '#',
      sentiment: (item.sentiment as 'BULLISH' | 'BEARISH' | 'NEUTRAL') || 'NEUTRAL',
      timestamp: item.timestamp || 'Just now'
    }))

    // ========================================================================
    // STEP 6: Return success response
    // ========================================================================

    // Add rate limit headers to response
    const response = NextResponse.json(
      {
        success: true,
        data: newsItems,
        count: newsItems.length,
        topic: topic
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // Cache for 5 minutes (news changes frequently)
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
          // Include rate limit info
          ...getRateLimitHeaders(rateLimitResult)
        }
      }
    )

    return response

  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================

    console.error('News API Error:', error)

    // Don't expose internal error details to client
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON response',
          message: 'The AI service returned an invalid response. Please try again.'
        },
        { status: 500 }
      )
    }

    // Generic error response (secure - doesn't leak details)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch news. Please try again later.'
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET HANDLER (For testing)
// ============================================================================

/**
 * GET /api/news
 *
 * Returns API information and usage instructions
 */
export async function GET() {
  return NextResponse.json(
    {
      name: 'ORBIT News API',
      version: '1.0.0',
      description: 'AI-powered crypto news search using Gemini with Google Search',
      usage: {
        method: 'POST',
        endpoint: '/api/news',
        body: {
          topic: 'string (1-100 characters)'
        },
        example: {
          topic: 'Bitcoin ETF'
        }
      },
      security: {
        apiKey: 'Secured server-side',
        rateLimit: '30 requests per hour per user',
        validation: 'Zod schemas'
      },
      status: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'PLACEHOLDER_API_KEY'
        ? 'operational'
        : 'not_configured'
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}

// ============================================================================
// SECURITY NOTES
// ============================================================================

/**
 * SECURITY IMPROVEMENTS IN THIS FILE:
 *
 * 1. ✅ API Key Protection:
 *    - API key only accessible server-side (process.env)
 *    - Never sent to client
 *    - Not embedded in JavaScript bundle
 *
 * 2. ✅ Input Validation:
 *    - Zod schema validates all inputs
 *    - Prevents injection attacks
 *    - Sanitizes user input
 *
 * 3. ✅ Error Handling:
 *    - Generic error messages to client
 *    - Detailed errors only in server logs
 *    - No sensitive info leaked
 *
 * 4. ✅ HTTP Security:
 *    - Proper status codes (400, 429, 500, 503)
 *    - Cache headers for performance
 *    - Content-Type headers
 *
 * 5. 🟡 Rate Limiting (TODO):
 *    - Placeholder for rate limiting
 *    - Will be implemented by rate limiting middleware
 *
 * 6. 🟡 Authentication (TODO):
 *    - No authentication required yet
 *    - Will be added when auth system is ready
 *
 * VERIFICATION STEPS:
 * 1. Run: npm run build
 * 2. Check build output - API key should NOT appear
 * 3. Inspect .next/static/* - API key should NOT appear
 * 4. Test endpoint: curl -X POST http://localhost:3000/api/news -d '{"topic":"Bitcoin"}'
 * 5. Verify news fetching works in UI
 */
