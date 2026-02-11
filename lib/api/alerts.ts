/**
 * Alerts API Client
 *
 * Client-side API functions for managing price alerts
 */

import { Alert } from '@/types'

interface AlertCreateData {
  token: string
  condition: 'above' | 'below'
  targetPrice: number
  notifications: string[]
}

interface AlertUpdateData {
  active?: boolean
  targetPrice?: number
  condition?: 'above' | 'below'
  notifications?: string[]
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Fetch all alerts for the current user
 */
export async function fetchAlerts(): Promise<Alert[]> {
  const response = await fetch('/api/alerts')
  const result: ApiResponse<Alert[]> = await response.json()

  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to fetch alerts')
  }

  return result.data
}

/**
 * Create a new alert
 */
export async function createAlert(data: AlertCreateData): Promise<Alert> {
  const response = await fetch('/api/alerts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const result: ApiResponse<Alert> = await response.json()

  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to create alert')
  }

  return result.data
}

/**
 * Update an existing alert
 */
export async function updateAlert(
  id: string,
  data: AlertUpdateData
): Promise<Alert> {
  const response = await fetch(`/api/alerts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const result: ApiResponse<Alert> = await response.json()

  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to update alert')
  }

  return result.data
}

/**
 * Delete an alert
 */
export async function deleteAlert(id: string): Promise<void> {
  const response = await fetch(`/api/alerts/${id}`, {
    method: 'DELETE',
  })

  const result: ApiResponse<null> = await response.json()

  if (!result.success) {
    throw new Error(result.message || 'Failed to delete alert')
  }
}
