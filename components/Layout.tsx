import React from 'react';
import { Car, BarChartBig, Settings } from 'lucide-react';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'garage' | 'history' | 'settings';
  onTabChange: (tab: 'garage' | 'history' | 'settings') => void;
  title: string;
  onLogout: () => void; // Kept in interface just in case App uses it to pass props, though visually removed from header
  showSettingsIcon?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, title, onLogout, showSettingsIcon }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {/* Glass Header */}
      <header className="glass fixed top-0 w-full max-w-md z-20 px-6 py-4 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
            {/* Logo Component - Reduced size */}
            <div className="w-9 h-9 flex items-center justify-center">
                 <Logo className="w-full h-full text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
            {showSettingsIcon && (
                <button onClick={() => onTabChange('settings')} className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-slate-600 dark:text-slate-300 active:scale-95">
                    <Settings size={24} strokeWidth={2} />
                </button>
            )}
        </div>
      </header>

      {/* Main Content (Scrollable with padding for header/footer) */}
      <main className="flex-1 overflow-y-auto p-6 pt-28 pb-32 space-y-6 dark:text-slate-200 no-scrollbar">
        {children}
      </main>

      {/* Glass Bottom Navigation */}
      <nav className="glass-top fixed bottom-0 w-full max-w-md pb-safe z-30 transition-colors">
        <div className="flex justify-around items-center h-20 pb-2">
          <button
            onClick={() => onTabChange('garage')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-all duration-300 ${
              activeTab === 'garage' ? 'text-indigo-600 dark:text-indigo-400 scale-105' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
            }`}
          >
            <Car size={26} strokeWidth={activeTab === 'garage' ? 2.5 : 2} />
            {activeTab === 'garage' && <div className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
          </button>
          
          <button
            onClick={() => onTabChange('history')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-all duration-300 ${
              activeTab === 'history' ? 'text-indigo-600 dark:text-indigo-400 scale-105' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
            }`}
          >
            <BarChartBig size={26} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
            {activeTab === 'history' && <div className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;