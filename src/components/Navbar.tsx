import React from 'react';
import { ShieldCheck, UploadCloud, DollarSign, Moon, Sun } from 'lucide-react';

export type ActiveTab = 'analyzer' | 'batch' | 'metrics' | 'salary' | 'code';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
}) => {
  const navItems = [
    { id: 'analyzer', label: 'Job Detector', icon: ShieldCheck },
    { id: 'batch', label: 'Batch Scan', icon: UploadCloud },
    { id: 'salary', label: 'Salary Check', icon: DollarSign },
  ] as const;

  const isDark = theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-40 transition-colors border-b ${
        isDark
          ? 'bg-slate-900/95 border-slate-800 text-white backdrop-blur-sm'
          : 'bg-white/95 border-slate-200/90 text-slate-900 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 gap-4">
          
          {/* Clean Minimalist Logo */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer select-none flex-shrink-0"
            onClick={() => onSelectTab('analyzer')}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                JobGuard<span className="text-blue-600 font-semibold ml-0.5">AI</span>
              </span>
              <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                isDark 
                  ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                  : 'bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}>
                EMSCAD
              </span>
            </div>
          </div>

          {/* Clean, Spacious Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? isDark
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'bg-blue-50 text-blue-600 border border-blue-200/70 shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? (isDark ? 'text-blue-400' : 'text-blue-600') : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Status & Theme */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Subtle Accuracy Indicator */}
            <div className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              isDark
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-semibold">86.8% Accuracy</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={onToggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
              className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200/80'
              }`}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className={`md:hidden flex overflow-x-auto px-3 py-2 border-t gap-1 scrollbar-none ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? isDark
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'bg-blue-50 text-blue-600 border border-blue-200/70'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
