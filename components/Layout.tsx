import React from 'react';
import { Car, BarChartBig, Settings } from 'lucide-react';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'garage' | 'history' | 'settings';
  onTabChange: (tab: 'garage' | 'history' | 'settings') => void;
  title: string;
  onLogout: () => void;
  showSettingsIcon?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, title, onLogout, showSettingsIcon }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col w-full max-w-md mx-auto relative shadow-2xl overflow-hidden box-border">
      
      {/* Header - Fixed Top with Safe Area Padding */}
      <header className="glass fixed top-0 w-full max-w-md z-30 transition-all">
        {/* pt-[env(safe-area-inset-top)] handles the Notch area */}
        <div className="pt-[env(safe-area-inset-top)] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                    <Logo className="w-full h-full text-indigo-600 dark:text-indigo-400" />
                </div>
                <h1 className="text-xl xs:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate max-w-[200px]">{title}</h1>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
                {showSettingsIcon && (
                    <button onClick={() => onTabChange('settings')} className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-slate-600 dark:text-slate-300 active:scale-95">
                        <Settings size={24} strokeWidth={2} />
                    </button>
                )}
            </div>
        </div>
      </header>

      {/* Main Content - Scrollable Area */}
      {/* Dynamic Padding: 
          Top = Header Height (~70px) + Safe Top 
          Bottom = Nav Height (~80px) + Safe Bottom + Extra Spacing 
      */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-6 space-y-6 dark:text-slate-200 no-scrollbar"
            style={{
                paddingTop: 'calc(5rem + env(safe-area-inset-top))', 
                paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))'
            }}
      >
        {children}
      </main>

      {/* Bottom Navigation - Fixed Bottom with Safe Area Padding */}
      <nav className="glass-top fixed bottom-0 w-full max-w-md z-30 transition-colors">
        {/* pb-[env(safe-area-inset-bottom)] handles the Home Indicator area */}
        <div className="pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-around items-center h-16 sm:h-20">
            <button
                onClick={() => onTabChange('garage')}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
                activeTab === 'garage' ? 'text-indigo-600 dark:text-indigo-400 scale-105' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                }`}
            >
                <Car size={24} strokeWidth={activeTab === 'garage' ? 2.5 : 2} />
                {activeTab === 'garage' && <div className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1" />}
            </button>
            
            <button
                onClick={() => onTabChange('history')}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
                activeTab === 'history' ? 'text-indigo-600 dark:text-indigo-400 scale-105' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                }`}
            >
                <BarChartBig size={24} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
                {activeTab === 'history' && <div className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1" />}
            </button>
            </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;