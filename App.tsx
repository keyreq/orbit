import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { NewsFeed } from './components/NewsFeed';
import { DeFiPortfolio } from './components/DeFiPortfolio';
import { ArchitectureView } from './components/ArchitectureView';
import { AlertsView } from './components/AlertsView';
import { NotificationSettings } from './components/NotificationSettings';
import { AppView } from './types';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard />;
      case AppView.NEWS: return <NewsFeed />;
      case AppView.DEFI: return <DeFiPortfolio />;
      case AppView.ARCHITECTURE: return <ArchitectureView />;
      case AppView.ALERTS: return <AlertsView />;
      case AppView.SETTINGS: return <NotificationSettings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-orbit-900 font-sans text-gray-100">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      <main className="flex-1 relative overflow-y-auto h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center p-4 border-b border-orbit-600 bg-orbit-800/80 backdrop-blur sticky top-0 z-30">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-2 text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-2 font-bold text-white">ORBIT</span>
        </div>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;