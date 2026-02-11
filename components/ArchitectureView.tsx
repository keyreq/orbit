import React from 'react';
import { Database, Shield, Key, Server, Lock, Fingerprint, Cloud } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-tight">System Architecture & Security</h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          A technical deep dive into building a production-grade crypto intelligence platform. 
          Ideation based on industry best practices.
        </p>
      </div>

      {/* Storage Section */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 border-b border-orbit-600 pb-4">
            <Database className="w-6 h-6 text-orbit-accent" />
            <h2 className="text-2xl font-semibold text-white">1. Storage Strategy</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-blue-500">
                <h3 className="text-lg font-bold text-white mb-2">Primary Database (PostgreSQL)</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    For user data, configuration, and notification settings. Relational integrity is crucial for user accounts and subscription plans.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>User Profiles & Auth</li>
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>Alert Configurations</li>
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>Portfolio Metadata</li>
                </ul>
            </div>
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-purple-500">
                <h3 className="text-lg font-bold text-white mb-2">Time-Series DB (TimescaleDB / Influx)</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    To store historical price data and high-frequency market events. Essential for generating charts and calculating technical indicators efficiently.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>OHLCV Candle Data</li>
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>Audit Logs</li>
                </ul>
            </div>
        </div>
        <div className="glass-panel p-6 rounded-xl bg-orbit-800/50">
            <h4 className="font-mono text-sm text-orbit-accent mb-2">RECOMMENDED STACK</h4>
            <p className="text-gray-300 text-sm">
                <strong>Supabase</strong> (Postgres + Auth) for backend-as-a-service ease, combined with <strong>Redis</strong> for caching live price feeds to reduce API calls to external providers.
            </p>
        </div>
      </section>

      {/* Authentication Section */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 border-b border-orbit-600 pb-4">
            <Fingerprint className="w-6 h-6 text-green-500" />
            <h2 className="text-2xl font-semibold text-white">2. Authentication</h2>
        </div>
        <div className="glass-panel p-8 rounded-2xl">
            <div className="space-y-6">
                <div className="flex items-start">
                    <div className="p-3 bg-gray-800 rounded-lg mr-4">
                        <Key className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">Hybrid Web2 + Web3 Auth</h3>
                        <p className="text-gray-400 text-sm mt-1">
                            Modern crypto apps must support both. Allow users to sign in via Email (Magic Link) or Google for convenience, AND support <strong>SIWE (Sign-In with Ethereum)</strong> for verified wallet ownership.
                        </p>
                    </div>
                </div>
                <div className="flex items-start">
                    <div className="p-3 bg-gray-800 rounded-lg mr-4">
                        <Lock className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">Session Management</h3>
                        <p className="text-gray-400 text-sm mt-1">
                            Use <strong>HTTP-only Secure Cookies</strong> for session tokens (JWTs). Never store sensitive access tokens in LocalStorage where XSS attacks can retrieve them.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 border-b border-orbit-600 pb-4">
            <Shield className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-semibold text-white">3. Security Best Practices</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-orbit-700/30 p-5 rounded-xl border border-orbit-600 hover:border-red-500/50 transition-colors">
                <h3 className="text-white font-semibold mb-2">API Key Protection</h3>
                <p className="text-xs text-gray-400">
                    Never expose 3rd party API keys (Gemini, Etherscan) on the client. Use <strong>Next.js API Routes</strong> or a proxy server to hold secrets and make requests server-side.
                </p>
            </div>
            <div className="bg-orbit-700/30 p-5 rounded-xl border border-orbit-600 hover:border-red-500/50 transition-colors">
                <h3 className="text-white font-semibold mb-2">Rate Limiting</h3>
                <p className="text-xs text-gray-400">
                    Implement strict rate limiting (e.g., via Redis) on your backend endpoints to prevent DDOS and abuse of your paid API quotas.
                </p>
            </div>
            <div className="bg-orbit-700/30 p-5 rounded-xl border border-orbit-600 hover:border-red-500/50 transition-colors">
                <h3 className="text-white font-semibold mb-2">Data Privacy</h3>
                <p className="text-xs text-gray-400">
                    Avoid storing raw wallet private keys. If the app needs to execute trades, use <strong>WalletConnect</strong> to trigger the user's own non-custodial wallet app.
                </p>
            </div>
        </div>
      </section>
      
    </div>
  );
};