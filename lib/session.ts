/**
 * Simple Session Management
 *
 * Extracts user ID from request headers for API authentication
 */

import { NextRequest, NextResponse } from 'next/server'

export function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id')
}

export function requireAuth(request: NextRequest) {
  const userId = getUserId(request)

  if (!userId) {
    return {
      userId: null,
      unauthorized: NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'User ID is required. Please refresh the page.'
        },
        { status: 401 }
      )
    }
  }

  return { userId, unauthorized: null }
}
