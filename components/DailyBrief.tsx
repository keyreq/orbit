import React, { useState, useEffect } from 'react'
import { FileText, RefreshCw, TrendingUp, AlertTriangle, Clock } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export const DailyBrief: React.FC = () => {
  const [brief, setBrief] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [generatedAt, setGeneratedAt] = useState<string>('')
  const [generationTime, setGenerationTime] = useState<number>(0)

  const fetchBrief = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/daily-brief')
      const result = await response.json()

      if (result.success && result.data) {
        setBrief(result.data.brief)
        setGeneratedAt(result.data.generatedAt)
        setGenerationTime(result.data.generationTimeMs)
      } else {
        setError(result.message || 'Failed to generate brief')
      }
    } catch (err) {
      console.error('Failed to fetch daily brief:', err)
      setError('Failed to fetch daily brief. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-fetch on mount
    fetchBrief()
  }, [])

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-24">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Daily Intelligence Brief</h1>
              <p className="text-sm text-gray-400">Hedge Fund CIO-Level Market Analysis</p>
            </div>
          </div>

          <button
            onClick={fetchBrief}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-orbit-700 hover:bg-orbit-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Brief
          </button>
        </div>

        {/* Metadata */}
        {generatedAt && (
          <div className="mb-6 p-4 bg-orbit-800/50 rounded-lg border border-orbit-700 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Generated: {formatDate(generatedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Analysis time: {formatTime(generationTime)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Live Data
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !brief && (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-12 h-12 text-orbit-accent animate-spin mb-4" />
            <p className="text-lg text-white mb-2">Generating Comprehensive Market Intelligence...</p>
            <p className="text-sm text-gray-400">Analyzing global macro, institutional flows, crypto markets, and geopolitical risks</p>
            <p className="text-xs text-gray-500 mt-2">This may take 30-60 seconds</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold mb-1">Failed to Generate Brief</p>
              <p className="text-sm text-gray-400">{error}</p>
              <button
                onClick={fetchBrief}
                className="mt-3 text-sm text-orbit-accent hover:text-orbit-accent/80 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Brief Content */}
        {brief && (
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="bg-orbit-800/30 rounded-lg border border-orbit-700 p-6 markdown-content">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-2xl font-bold text-white mb-4 pb-3 border-b border-orbit-700" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-xl font-semibold text-white mt-6 mb-3" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-lg font-semibold text-gray-200 mt-4 mb-2" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-gray-300 leading-relaxed mb-3" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside text-gray-300 space-y-1 mb-3" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-inside text-gray-300 space-y-1 mb-3" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="text-gray-300" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="text-white font-semibold" {...props} />
                  ),
                  em: ({ node, ...props }) => (
                    <em className="text-orbit-accent" {...props} />
                  ),
                  hr: ({ node, ...props }) => (
                    <hr className="border-orbit-700 my-6" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto mb-4">
                      <table className="min-w-full border border-orbit-700 rounded-lg" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => (
                    <thead className="bg-orbit-800" {...props} />
                  ),
                  th: ({ node, ...props }) => (
                    <th className="px-4 py-2 text-left text-white font-semibold border-b border-orbit-700" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="px-4 py-2 text-gray-300 border-b border-orbit-700" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-orbit-accent pl-4 italic text-gray-400 my-4" {...props} />
                  ),
                  code: ({ node, inline, ...props }: any) =>
                    inline ? (
                      <code className="px-1.5 py-0.5 bg-orbit-700 text-orbit-accent rounded text-sm" {...props} />
                    ) : (
                      <code className="block p-3 bg-orbit-900 rounded-lg text-sm overflow-x-auto" {...props} />
                    ),
                }}
              >
                {brief}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Info Box */}
        {brief && (
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-gray-300">
              <strong className="text-blue-400">Note:</strong> This brief is generated using real-time data from Bloomberg, Reuters, Financial Times, Federal Reserve, IMF, Glassnode, Messari, and other tier-1 sources. Analysis is powered by Gemini 2.0 with Google Search grounding.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
