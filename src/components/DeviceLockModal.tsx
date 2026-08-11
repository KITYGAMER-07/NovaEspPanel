import React from 'react';
import { Smartphone, ShieldAlert, RefreshCw, LogOut, Lock, AlertTriangle } from 'lucide-react';
import { UserProfile } from '../types';

interface DeviceLockModalProps {
  user: UserProfile;
  activeDeviceName?: string;
  onRefreshStatus: () => void;
  onLogout: () => void;
}

export const DeviceLockModal: React.FC<DeviceLockModalProps> = ({
  user,
  activeDeviceName,
  onRefreshStatus,
  onLogout,
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-950/50 text-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon */}
        <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-rose-500/20 border border-rose-500/40 blur-md animate-pulse" />
          <div className="w-18 h-18 rounded-2xl bg-rose-950/80 border-2 border-rose-500/60 flex items-center justify-center text-rose-400 shadow-xl relative z-10">
            <Smartphone className="w-9 h-9" />
          </div>
          <div className="absolute -bottom-1 -right-1 z-20 w-7 h-7 rounded-full bg-rose-600 border-2 border-slate-900 flex items-center justify-center text-white shadow-md">
            <Lock className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="font-display text-2xl font-bold text-white tracking-wide">
          Device Lock Active
        </h2>

        <p className="text-rose-400 text-xs font-semibold uppercase tracking-wider mt-1">
          Single Device Access Enforced
        </p>

        {/* Account Details Box */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Account User:</span>
            <span className="font-bold text-white">{user.name || user.email}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Telegram Username:</span>
            <span className="font-mono text-cyan-300">@{user.username || 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">Currently Bound To:</span>
            <span className="font-medium text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
              {activeDeviceName || user.activeDeviceName || 'Another Device / Browser'}
            </span>
          </div>
        </div>

        {/* Info Message */}
        <p className="text-slate-300 text-xs mt-4 leading-relaxed bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
          <AlertTriangle className="w-4 h-4 text-amber-400 inline-block mr-1.5 shrink-0 -mt-0.5" />
          <strong className="text-white">Notice:</strong> Your NovaEsp account can only be logged in on 1 device at a time. To switch to this new device, please contact the <span className="text-teal-400 font-bold">Admin / Panel Owner</span> to reset your device lock.
        </p>

        {/* Actions */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={onRefreshStatus}
            className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-950/40 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Check Lock Status (I requested Admin Reset)</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-2 border border-slate-700/80"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
