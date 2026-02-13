/**
 * Simple User ID Management
 *
 * Generates and persists a unique user ID in localStorage for testing.
 * No authentication required - each browser gets its own ID.
 */

'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'orbit_user_id'

function generateUserId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `user_${timestamp}_${random}`
}

export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get or create user ID
    let id = localStorage.getItem(STORAGE_KEY)

    if (!id) {
      id = generateUserId()
      localStorage.setItem(STORAGE_KEY, id)
    }

    setUserId(id)
    setIsLoading(false)
  }, [])

  const resetUserId = () => {
    const newId = generateUserId()
    localStorage.setItem(STORAGE_KEY, newId)
    setUserId(newId)
    // Reload page to clear all cached data
    window.location.reload()
  }

  const setCustomUserId = (customId: string) => {
    localStorage.setItem(STORAGE_KEY, customId)
    setUserId(customId)
    // Reload page to fetch new user's data
    window.location.reload()
  }

  return {
    userId,
    isLoading,
    resetUserId,
    setCustomUserId,
  }
}
