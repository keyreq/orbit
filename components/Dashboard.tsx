import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { TokenPrice } from '../types';

const mockData = [
  { name: '00:00', btc: 42000, eth: 2200 },
  { name: '04:00', btc: 42500, eth: 2250 },
  { name: '08:00', btc: 43200, eth: 2300 },
  { name: '12:00', btc: 42800, eth: 2280 },
  { name: '16:00', btc: 43500, eth: 2350 },
  { name: '20:00', btc: 44000, eth: 2400 },
  { name: '24:00', btc: 43800, eth: 2380 },
];

const tokens: TokenPrice[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 43800.50, change24h: 2.5, volume: '28B' },
  { symbol: 'ETH', name: 'Ethereum', price: 2380.12, change24h: 1.8, volume: '15B' },
  { symbol: 'SOL', name: 'Solana', price: 98.45, change24h: -0.5, volume: '2B' },
  { symbol: 'LINK', name: 'Chainlink', price: 15.20, change24h: 5.2, volume: '800M' },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Overview</h1>
          <p className="text-gray-400 text-sm">Real-time market insights and portfolio summary</p>
        </div>
        <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20 flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                Market Open
            </span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { label: 'Total Portfolio', value: '$124,592.00', change: '+2.4%', icon: DollarSign, trend: 'up' },
            { label: 'DeFi Yield (24h)', value: '$145.20', change: '+12%', icon: Activity, trend: 'up' },
            { label: 'Active Alerts', value: '4', change: '2 Triggered', icon: Activity, trend: 'neutral' },
            { label: 'Gas Price', value: '24 Gwei', change: '-5%', icon: Activity, trend: 'down' }
        ].map((stat, i) => (
            <div key={i} className="glass-panel p-5 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-orbit-600/50 rounded-lg">
                        <stat.icon className="w-5 h-5 text-gray-300" />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        stat.trend === 'up' ? 'bg-green-500/10 text-green-400' : 
                        stat.trend === 'down' ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400'
                    }`}>
                        {stat.change}
                    </span>
                </div>
                <h3 className="text-gray-400 text-sm font-medium">{stat.label}</h3>
                <p className="text-2xl font-semibold text-white mt-1">{stat.value}</p>
            </div>
        ))}
      </div>

      {/* Main Chart Section */}
      <div className="glass-panel p-6 rounded-2xl h-[400px]">
        <h2 className="text-lg font-semibold text-white mb-6">Bitcoin Performance (24h)</h2>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={mockData}>
            <defs>
              <linearGradient id="colorBtc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3F" vertical={false} />
            <XAxis dataKey="name" stroke="#6B7280" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
            <YAxis stroke="#6B7280" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1C1E2D', border: '1px solid #2A2D3F', borderRadius: '8px' }}
                itemStyle={{ color: '#E2E8F0' }}
            />
            <Area type="monotone" dataKey="btc" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorBtc)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Token List */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-orbit-600 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Watchlist</h2>
            <button className="text-sm text-orbit-accent hover:text-white transition-colors">View All</button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-orbit-800/50 text-xs text-gray-400 uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-3 text-left">Asset</th>
                        <th className="px-6 py-3 text-right">Price</th>
                        <th className="px-6 py-3 text-right">24h Change</th>
                        <th className="px-6 py-3 text-right">Volume</th>
                        <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-orbit-600">
                    {tokens.map((token) => (
                        <tr key={token.symbol} className="hover:bg-orbit-700/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-orbit-600 flex items-center justify-center font-bold text-xs text-white mr-3">
                                        {token.symbol[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">{token.name}</div>
                                        <div className="text-xs text-gray-500">{token.symbol}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-white">
                                ${token.price.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <div className={`flex items-center justify-end ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {token.change24h >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                    {Math.abs(token.change24h)}%
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">
                                {token.volume}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <button className="text-gray-400 hover:text-white transition-colors">Trade</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};