import React from 'react';
import {
  LayoutDashboard,
  Newspaper,
  Wallet,
  Bell,
  Settings,
  Activity,
  Menu,
  FileText
} from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isMobileOpen, setIsMobileOpen }) => {
  
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.DAILY_BRIEF, label: 'Daily Brief', icon: FileText },
    { id: AppView.NEWS, label: 'Intelligence Feed', icon: Newspaper },
    { id: AppView.DEFI, label: 'DeFi Portfolio', icon: Wallet },
    { id: AppView.ALERTS, label: 'Price Alerts', icon: Bell },
    { id: AppView.SETTINGS, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-orbit-800 border-r border-orbit-600
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-orbit-600">
            <Activity className="w-8 h-8 text-orbit-accent mr-3" />
            <span className="text-xl font-bold tracking-wider text-white">ORBIT</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id);
                  setIsMobileOpen(false);
                }}
                className={`
                  w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200
                  ${currentView === item.id 
                    ? 'bg-orbit-accent/10 text-orbit-accent shadow-[0_0_15px_rgba(99,102,241,0.2)] border border-orbit-accent/20' 
                    : 'text-gray-400 hover:bg-orbit-700 hover:text-white'}
                `}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-orbit-600">
            <div className="flex items-center px-4 py-3 rounded-xl bg-orbit-700/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                JD
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">John Doe</p>
                <p className="text-xs text-gray-500">Premium Plan</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};