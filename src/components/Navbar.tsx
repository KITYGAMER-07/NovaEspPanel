import React from 'react';
import { Menu, Eye } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile;
  title: string;
  subtitle: string;
  onRefresh?: () => void;
  onToggleSidebar: () => void;
  onOpenInspector?: () => void;
  onLogout?: () => void;
  isViewAsReseller?: boolean;
  onToggleViewMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  title,
  subtitle,
  onToggleSidebar,
  isViewAsReseller,
  onToggleViewMode,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg lg:text-xl font-bold text-white tracking-wide">
                {title}
              </h2>
              {isViewAsReseller && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  Reseller Preview
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">{subtitle}</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* View Mode Switcher for Owner */}
          {user.role === 'owner' && onToggleViewMode && (
            <button
              onClick={onToggleViewMode}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition-all text-xs font-medium flex items-center gap-1.5 ${
                isViewAsReseller
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white'
              }`}
              title="Switch between Admin & Reseller preview"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{isViewAsReseller ? 'Admin View' : 'Reseller Mode'}</span>
            </button>
          )}

          {/* Balance Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30">
            <img
              src="/logo.jpg"
              alt="Logo"
              className="w-4 h-4 rounded object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block -mb-0.5 leading-none uppercase font-semibold">
                Balance
              </span>
              <span className="text-sm font-bold text-teal-300 font-mono">
                ₹{(user.balance || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

