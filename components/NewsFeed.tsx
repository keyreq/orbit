import React, { useState, useEffect } from 'react';
import { Search, Loader2, ExternalLink, Globe, Twitter, TrendingUp, AlertTriangle } from 'lucide-react';
import { NewsItem } from '../types';
import { useUserIdContext } from './UserIdProvider';

export const NewsFeed: React.FC = () => {
  const { userId, isLoading: userIdLoading } = useUserIdContext();
  const [query, setQuery] = useState('Blockchain Macro Economics');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [macroAnalysis, setMacroAnalysis] = useState<string>('');
  const [macroLoading, setMacroLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Fetch comprehensive macro analysis from Daily Brief
    const fetchMacroAnalysis = async () => {
      if (userIdLoading) return; // Wait for userId to load

      setMacroLoading(true);
      console.log('[NewsFeed] Fetching daily brief...');
      try {
        const response = await fetch('/api/daily-brief');
        console.log('[NewsFeed] Daily brief response status:', response.status);

        const data = await response.json();
        console.log('[NewsFeed] Daily brief data:', data);

        if (isMounted && data.success && data.data?.brief) {
          setMacroAnalysis(data.data.brief);
          console.log('[NewsFeed] Daily brief loaded successfully');
        } else {
          console.warn('[NewsFeed] Daily brief response missing data:', data);
          if (isMounted) {
            setMacroAnalysis('*Macro analysis temporarily unavailable. The analysis service is warming up.*');
          }
        }
      } catch (err) {
        console.error('[NewsFeed] Macro analysis error:', err);
        if (isMounted) {
          setMacroAnalysis('*Macro analysis temporarily unavailable. Check back shortly.*');
        }
      } finally {
        if (isMounted) {
          setMacroLoading(false);
        }
      }
    };

    // Fetch news
    const fetchNews = async () => {
      if (!userId || userIdLoading) return; // Need userId for news API

      setLoading(true);
      setError(null);

      try {
        // SECURITY FIX: Call server-side API instead of client-side Gemini
        const response = await fetch('/api/news', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
          },
          body: JSON.stringify({ topic: query }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch news');
        }

        if (isMounted && data.success) {
          setNews(data.data || []);
        }
      } catch (err) {
        console.error('News fetch error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch news');
          // Show fallback error news item
          setNews([{
            id: 'err-1',
            title: 'News Service Unavailable',
            summary: 'We couldn\'t fetch the latest news at this moment. Please try again in a few moments.',
            source: 'System',
            url: '#',
            sentiment: 'NEUTRAL',
            timestamp: 'Now'
          }]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (!userIdLoading) {
      fetchMacroAnalysis();
      fetchNews();
    }
    return () => { isMounted = false; };
  }, [refreshKey, query, userIdLoading]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setRefreshKey(prev => prev + 1);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'BEARISH': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSourceIcon = (source: string) => {
    if (source.toLowerCase().includes('twitter') || source.toLowerCase().includes('x')) return <Twitter className="w-3 h-3 mr-1" />;
    return <Globe className="w-3 h-3 mr-1" />;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center space-y-2 py-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          Global Intelligence Feed
        </h1>
        <p className="text-gray-400">
          AI-powered web crawler synthesizing news from Twitter, Major Outlets, and DeFi forums.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute -inset-1 bg-gradient-to-r from-orbit-accent to-purple-600 rounded-xl blur opacity-25"></div>
        <form onSubmit={handleSearch} className="relative flex bg-orbit-800 rounded-xl overflow-hidden border border-orbit-600 shadow-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics (e.g., 'Ethereum Layer 2', 'Regulation')..."
            className="flex-1 bg-transparent border-none text-white px-6 py-4 focus:ring-0 placeholder-gray-500"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 bg-orbit-700 hover:bg-orbit-600 border-l border-orbit-600 text-white font-medium transition-colors flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </form>
      </div>

      {/* Macro Analysis Section */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="glass-panel p-6 rounded-2xl border border-orbit-accent/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orbit-accent" />
              Daily Market Intelligence Brief
            </h2>
            {macroLoading && <Loader2 className="w-4 h-4 animate-spin text-orbit-accent" />}
          </div>

          {macroLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-orbit-600 rounded w-full"></div>
              <div className="h-4 bg-orbit-600 rounded w-5/6"></div>
              <div className="h-4 bg-orbit-600 rounded w-4/6"></div>
            </div>
          ) : macroAnalysis ? (
            <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed">
              <div className="whitespace-pre-wrap font-mono text-sm">{macroAnalysis}</div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Macro analysis unavailable</p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && !loading && (
        <div className="max-w-2xl mx-auto p-4 border border-red-500/30 rounded-xl bg-red-500/10 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400">Error Loading News</p>
            <p className="text-sm text-red-300/80">{error}</p>
          </div>
        </div>
      )}

      {/* Feed Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {loading && news.length === 0 ? (
          // Skeletons
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl h-48 animate-pulse space-y-4">
              <div className="h-4 bg-orbit-600 rounded w-1/3"></div>
              <div className="h-6 bg-orbit-600 rounded w-3/4"></div>
              <div className="h-20 bg-orbit-600 rounded w-full"></div>
            </div>
          ))
        ) : (
          news.map((item) => (
            <div key={item.id} className="glass-panel group p-6 rounded-2xl hover:border-orbit-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-orbit-accent/10 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getSentimentColor(item.sentiment)}`}>
                        {item.sentiment}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                        {getSourceIcon(item.source)}
                        {item.source}
                    </span>
                </div>
                <span className="text-xs text-gray-600">{item.timestamp}</span>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-orbit-accent transition-colors">
                <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
              </h3>
              
              <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-1">
                {item.summary}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-orbit-600/50 mt-auto">
                 <div className="flex items-center space-x-4">
                   <button className="text-xs text-gray-500 hover:text-white flex items-center transition-colors">
                     <TrendingUp className="w-3 h-3 mr-1" /> Impact High
                   </button>
                 </div>
                 <a 
                   href={item.url} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-xs font-medium text-orbit-accent hover:text-white flex items-center transition-colors"
                 >
                   Read Source <ExternalLink className="w-3 h-3 ml-1" />
                 </a>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 p-4 border border-orbit-600 rounded-xl bg-orbit-800/50 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-sm text-gray-400">
          <strong className="text-white">Disclaimer:</strong> Intelligence is aggregated using AI. While we utilize advanced grounding with Google Search, always verify critical financial news from primary sources before trading.
        </p>
      </div>
    </div>
  );
};