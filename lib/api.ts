/**
 * API Client Utilities
 *
 * Helper functions for making authenticated API calls
 */

export interface FetchOptions extends RequestInit {
  userId: string
}

/**
 * Make an authenticated API request with user ID header
 */
export async function fetchWithAuth(url: string, options: FetchOptions) {
  const { userId, ...fetchOptions } = options

  return fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      ...fetchOptions.headers,
    },
  })
}
