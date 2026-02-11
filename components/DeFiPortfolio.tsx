import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Shield, Zap, Layers, ArrowUpRight } from 'lucide-react';
import { DefiPosition } from '../types';

const data = [
  { name: 'Uniswap V3 (ETH/USDC)', value: 4500, color: '#FF007A' },
  { name: 'Aave V3 (Lending)', value: 8200, color: '#B6509E' },
  { name: 'Lido (stETH)', value: 3100, color: '#00A3FF' },
  { name: 'Curve (3pool)', value: 2400, color: '#F31D1D' },
];

const positions: DefiPosition[] = [
    { protocol: 'Aave V3', type: 'Lending', asset: 'USDC', apy: 4.2, value: 8200 },
    { protocol: 'Uniswap V3', type: 'Liquidity Pool', asset: 'ETH/USDC', apy: 18.5, value: 4500 },
    { protocol: 'Lido', type: 'Staking', asset: 'ETH', apy: 3.4, value: 3100 },
    { protocol: 'Curve', type: 'Liquidity Pool', asset: 'USDT/WBTC/ETH', apy: 6.8, value: 2400 },
];

export const DeFiPortfolio: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">DeFi Positions</h1>
          <p className="text-gray-400 text-sm">Cross-chain liquidity, staking, and lending tracker</p>
        </div>
        <button className="px-4 py-2 bg-orbit-accent hover:bg-orbit-accent/80 text-white rounded-lg text-sm font-medium transition-colors">
            Connect Wallet
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Chart */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Allocation</h3>
            <div className="h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip 
                             contentStyle={{ backgroundColor: '#1C1E2D', border: '1px solid #2A2D3F', borderRadius: '8px' }}
                             itemStyle={{ color: '#E2E8F0' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center text overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                    <div className="text-center">
                        <p className="text-gray-400 text-xs">Total Value</p>
                        <p className="text-xl font-bold text-white">$18.2k</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Col: List */}
        <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-orbit-600">
                <h3 className="text-lg font-semibold text-white">Active Positions</h3>
            </div>
            <div className="overflow-auto flex-1">
                <table className="w-full">
                    <thead className="bg-orbit-800/50 text-xs text-gray-400 uppercase">
                        <tr>
                            <th className="px-6 py-3 text-left">Protocol</th>
                            <th className="px-6 py-3 text-left">Strategy</th>
                            <th className="px-6 py-3 text-right">APY</th>
                            <th className="px-6 py-3 text-right">Value</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-orbit-600">
                        {positions.map((pos, i) => (
                            <tr key={i} className="hover:bg-orbit-700/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 rounded-lg bg-orbit-600">
                                            {pos.type === 'Lending' ? <Shield className="w-4 h-4 text-purple-400"/> :
                                             pos.type === 'Staking' ? <Layers className="w-4 h-4 text-blue-400"/> :
                                             <Zap className="w-4 h-4 text-yellow-400"/>}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{pos.protocol}</p>
                                            <p className="text-xs text-gray-500">{pos.asset}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-md text-xs font-medium border border-orbit-600 text-gray-300">
                                        {pos.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-green-400 text-sm font-mono">{pos.apy}%</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-white text-sm font-bold">${pos.value.toLocaleString()}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-white">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};