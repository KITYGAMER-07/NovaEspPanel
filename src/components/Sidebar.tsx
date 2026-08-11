import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  Tag,
  Wallet,
  FileText,
  Zap,
  HelpCircle,
  LogOut,
  BarChart3,
  X,
  Search,
  Sun,
  Moon,
  Clock,
  Shield,
  Gem,
} from 'lucide-react';
import { UserProfile, PlanType, DEFAULT_PRICES } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  user: UserProfile;
  currentPage: string;
  onNavigate: (page: string) => void;
  onQuickGenerateKey?: (plan: PlanType) => void;
  onOpenInspector?: () => void;
  pendingResetsCount?: number;
  lowStockCount: number;
  pricesData: Record<string, number>;
  onLogout: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  currentPage,
  onNavigate,
  onQuickGenerateKey,
  onOpenInspector,
  lowStockCount,
  pricesData,
  onLogout,
  isOpen,
  onCloseMobile,
}) => {
  const isOwner = user.role === 'owner';
  const { theme, toggleTheme } = useTheme();

  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (page: string) => {
    onNavigate(page);
    onCloseMobile();
  };

  const navClass = (page: string) =>
    `w-full min-h-[44px] flex items-center gap-3 px-3.5 py-3 sm:py-2.5 rounded-xl text-sm font-medium transition-all touch-manipulation active:scale-[0.98] ${
      currentPage === page
        ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 text-teal-300 border border-teal-500/30 shadow-lg shadow-teal-900/20 font-semibold'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 active:bg-slate-800 border border-transparent'
    }`;

  const planTypes: PlanType[] = ['5H', '1D', '3D', '7D', '15D', '30D', '60D'];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/logo.jpg"
                alt="NovaEsp Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-white tracking-wider">
                NOVA<span className="text-teal-400">ESP</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                {isOwner ? (
                  <>
                    <Shield className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>ADMIN PANEL</span>
                  </>
                ) : (
                  <>
                    <Gem className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>RESELLER PORTAL</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white active:bg-slate-700 active:scale-95 transition-all touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-6 custom-scrollbar">
          {isOwner ? (
            /* OWNER MENU */
            <div className="space-y-4">
              <div>
                <p className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Management
                </p>
                <div className="space-y-1 mt-1">
                  <button onClick={() => handleNavClick('dashboard')} className={navClass('dashboard')}>
                    <LayoutDashboard className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Dashboard</span>
                  </button>
                  <button onClick={() => handleNavClick('stock')} className={navClass('stock')}>
                    <Package className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="flex-1 text-left">Stock Control</span>
                    {lowStockCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {lowStockCount} Low
                      </span>
                    )}
                  </button>
                  <button onClick={() => handleNavClick('resellers')} className={navClass('resellers')}>
                    <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Resellers</span>
                  </button>
                  <button onClick={() => handleNavClick('prices')} className={navClass('prices')}>
                    <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Price Settings</span>
                  </button>
                </div>
              </div>

              <div>
                <p className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Operations & Control
                </p>
                <div className="space-y-1 mt-1">
                  <button onClick={() => handleNavClick('balance')} className={navClass('balance')}>
                    <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Balance Control</span>
                  </button>
                  <button onClick={() => handleNavClick('analytics')} className={navClass('analytics')}>
                    <BarChart3 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Sales Analytics</span>
                  </button>
                  <button onClick={() => handleNavClick('logs')} className={navClass('logs')}>
                    <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Activity Logs</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* RESELLER MENU */
            <div className="space-y-4">
              <div>
                <p className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Quick Key Generation
                </p>
                <div className="space-y-1 mt-1">
                  {planTypes.map((plan) => {
                    const price = pricesData[plan] ?? DEFAULT_PRICES[plan];
                    return (
                      <button
                        key={plan}
                        onClick={() => {
                          if (onQuickGenerateKey) onQuickGenerateKey(plan);
                          onCloseMobile();
                        }}
                        className="w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 active:bg-slate-800 border border-slate-800/60 hover:border-teal-500/30 active:scale-[0.98] transition-all touch-manipulation group"
                      >
                        <div className="flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform" />
                          <span>Generate {plan}</span>
                        </div>
                        <span className="font-mono font-semibold text-teal-400">₹{price}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Portal Navigation
                </p>
                <div className="space-y-1 mt-1">
                  <button onClick={() => handleNavClick('resellerDashboard')} className={navClass('resellerDashboard')}>
                    <LayoutDashboard className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>My Portal</span>
                  </button>
                  <button onClick={() => handleNavClick('myBalance')} className={navClass('myBalance')}>
                    <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>My Balance & Receipts</span>
                  </button>
                  <button onClick={() => handleNavClick('stockLeft')} className={navClass('stockLeft')}>
                    <Package className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Stock & Prices</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div>
            <p className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              System & Tools
            </p>
            <div className="space-y-1 mt-1">
              {/* Inspect Key */}
              <button
                onClick={() => {
                  if (onOpenInspector) onOpenInspector();
                  onCloseMobile();
                }}
                className="w-full min-h-[44px] flex items-center gap-3 px-3.5 py-3 sm:py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 active:bg-slate-800 border border-transparent active:scale-[0.98] transition-all touch-manipulation"
              >
                <Search className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Inspect Key</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full min-h-[44px] flex items-center justify-between px-3.5 py-3 sm:py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 active:bg-slate-800 border border-transparent active:scale-[0.98] transition-all touch-manipulation"
              >
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                  )}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {theme.toUpperCase()}
                </span>
              </button>

              {/* Help & Guides */}
              <button onClick={() => handleNavClick('help')} className={navClass('help')}>
                <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Help & Guides</span>
              </button>

              {/* System Timer Clock Widget */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Timer Clock</span>
                </div>
                <span className="font-mono text-xs font-bold text-teal-300">{time}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer User Info */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-slate-950 font-bold text-sm shrink-0">
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name || 'User'}</p>
              <p className="text-[11px] text-slate-400 truncate font-mono">
                {isOwner ? 'System Owner' : `@${user.username || 'reseller'}`}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
