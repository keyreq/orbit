/**
 * User ID Provider
 *
 * Makes user ID available throughout the app via React Context
 */

'use client'

import React, { createContext, useContext } from 'react'
import { useUserId } from '@/lib/useUserId'

interface UserIdContextType {
  userId: string | null
  isLoading: boolean
  resetUserId: () => void
  setCustomUserId: (id: string) => void
}

const UserIdContext = createContext<UserIdContextType | undefined>(undefined)

export function UserIdProvider({ children }: { children: React.ReactNode }) {
  const userIdData = useUserId()

  return (
    <UserIdContext.Provider value={userIdData}>
      {children}
    </UserIdContext.Provider>
  )
}

export function useUserIdContext() {
  const context = useContext(UserIdContext)
  if (context === undefined) {
    throw new Error('useUserIdContext must be used within UserIdProvider')
  }
  return context
}
