/**
 * Account Code UI Component
 *
 * Displays user's account code with copy/reset functionality
 */

'use client'

import React, { useState } from 'react'
import { User, Copy, RefreshCw, Check, LogIn } from 'lucide-react'
import { useUserIdContext } from './UserIdProvider'

export function AccountCodeUI() {
  const { userId, resetUserId, setCustomUserId, isLoading } = useUserIdContext()
  const [copied, setCopied] = useState(false)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customCode, setCustomCode] = useState('')

  if (isLoading || !userId) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-orbit-700/50">
        <div className="w-8 h-8 rounded-full bg-orbit-600 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-orbit-600 rounded animate-pulse mb-1" />
          <div className="h-3 bg-orbit-600 rounded animate-pulse w-2/3" />
        </div>
      </div>
    )
  }

  // Show last 8 characters of user ID as "account code"
  const displayCode = userId.slice(-8).toUpperCase()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(userId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    if (confirm('Reset your account? This will create a new account and you will lose access to your current alerts and settings.')) {
      resetUserId()
    }
  }

  const handleCustomSubmit = () => {
    if (customCode.trim()) {
      setCustomUserId(customCode.trim())
      setShowCustomInput(false)
    }
  }

  if (showCustomInput) {
    return (
      <div className="px-4 py-3 rounded-xl bg-orbit-700/50 space-y-2">
        <p className="text-xs text-gray-400">Enter your account code:</p>
        <input
          type="text"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          placeholder="Paste your account code"
          className="w-full px-3 py-2 bg-orbit-800 border border-orbit-600 rounded-lg text-sm text-white focus:outline-none focus:border-orbit-accent"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={handleCustomSubmit}
            className="flex-1 px-3 py-2 bg-orbit-accent hover:bg-orbit-accent/80 text-white text-xs rounded-lg transition-colors"
          >
            Load Account
          </button>
          <button
            onClick={() => setShowCustomInput(false)}
            className="px-3 py-2 bg-orbit-700 hover:bg-orbit-600 text-white text-xs rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Account Code Display */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orbit-700/50">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400">Account Code</p>
          <p className="text-sm font-mono font-medium text-white">{displayCode}</p>
        </div>
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-orbit-600 rounded-lg transition-colors"
          title="Copy full account code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 px-2">
        <button
          onClick={() => setShowCustomInput(true)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orbit-700 hover:bg-orbit-600 text-white text-xs rounded-lg transition-colors"
        >
          <LogIn className="w-3 h-3" />
          Load Code
        </button>
        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orbit-700 hover:bg-orbit-600 text-white text-xs rounded-lg transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Reset
        </button>
      </div>

      <p className="text-[10px] text-gray-500 px-2 text-center">
        Save your code to access your account from another device
      </p>
    </div>
  )
}
