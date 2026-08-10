import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Key,
  DollarSign,
  Package,
  Plus,
  Upload,
  Radio,
  ArrowRight,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { StockDoc, LogEntry, UserProfile, PLAN_LABELS, PlanType } from '../types';

interface AdminDashboardProps {
  resellersCount: number;
  logs: LogEntry[];
  stockData: Record<string, StockDoc>;
  pricesData: Record<string, number>;
  announcement?: string;
  onNavigate: (page: string) => void;
  onGenerateCustomKey: (plan: PlanType, customPrefix: string, count: number) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  resellersCount,
  logs,
  stockData,
  pricesData,
  announcement,
  onNavigate,
  onGenerateCustomKey,
}) => {
  const [customPlan, setCustomPlan] = useState<PlanType>('1D');
  const [customPrefix, setCustomPrefix] = useState('NOVA');
  const [customCount, setCustomCount] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Compute stats
  const totalKeysGenerated = logs.length;
  const totalRevenue = logs.reduce((acc, l) => acc + (l.price || 0), 0);
  const totalStockAvailable = (Object.values(stockData) as StockDoc[]).reduce((acc: number, doc: StockDoc) => {
    const keys = doc?.keys;
    return acc + (Array.isArray(keys) ? keys.filter((k) => !k.used).length : 0);
  }, 0);

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await onGenerateCustomKey(customPlan, customPrefix.trim() || 'NOVA', Number(customCount) || 1);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Announcement Marquee if active */}
      {announcement && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-teal-500/10 border border-teal-500/30 flex items-center gap-3 text-sm text-teal-200 shadow-lg shadow-teal-950/20">
          <Radio className="w-4 h-4 text-teal-400 shrink-0 animate-pulse" />
          <p className="flex-1 font-medium truncate">
            <span className="font-bold text-teal-300 mr-2">NOTICE:</span> {announcement}
          </p>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Resellers */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all shadow-xl group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Active
            </span>
          </div>
          <p className="text-3xl font-display font-bold text-white tracking-tight">{resellersCount}</p>
          <p className="text-xs text-slate-400 mt-1">Total Registered Resellers</p>
        </div>

        {/* Total Keys Generated */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all shadow-xl group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Key className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Generated
            </span>
          </div>
          <p className="text-3xl font-display font-bold text-white tracking-tight">{totalKeysGenerated}</p>
          <p className="text-xs text-slate-400 mt-1">Lifetime Keys Issued</p>
        </div>

        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all shadow-xl group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Revenue
            </span>
          </div>
          <p className="text-3xl font-display font-bold text-amber-300 tracking-tight">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Total System Revenue</p>
        </div>

        {/* Stock Inventory */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all shadow-xl group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Inventory
            </span>
          </div>
          <p className="text-3xl font-display font-bold text-white tracking-tight">{totalStockAvailable}</p>
          <p className="text-xs text-slate-400 mt-1">Available Keys in Stock</p>
        </div>
      </div>

      {/* Stock Overview Grid */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white">Stock Availability & Pricing Overview</h3>
              <p className="text-xs text-slate-400">Current keys available per duration plan</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('stock')}
            className="text-xs font-medium text-teal-400 hover:text-teal-300 flex items-center gap-1"
          >
            Manage Stock <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {(Object.keys(PLAN_LABELS) as PlanType[]).map((plan) => {
              const keys = stockData[plan]?.keys;
              const count = Array.isArray(keys) ? keys.filter((k) => !k.used).length : 0;
              const price = pricesData[plan] || 0;
              const isLow = count < 5;

              return (
                <div
                  key={plan}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    isLow
                      ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <p className="font-display font-bold text-white text-sm">{plan}</p>
                  <p className={`text-2xl font-bold font-mono my-1 ${isLow ? 'text-rose-400' : 'text-teal-400'}`}>
                    {count}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{PLAN_LABELS[plan]}</p>
                  <p className="text-[11px] font-semibold text-slate-300 mt-1">₹{price}</p>
                  {isLow && (
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      LOW
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Middle Section: Custom Key Generator & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom Admin Key Generator */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl p-5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white">Instant Custom Key Injector</h3>
              <p className="text-xs text-slate-400">Generate and automatically inject formatted keys into stock</p>
            </div>
          </div>

          <form onSubmit={handleCustomSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Plan</label>
              <select
                value={customPlan}
                onChange={(e) => setCustomPlan(e.target.value as PlanType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              >
                {(Object.keys(PLAN_LABELS) as PlanType[]).map((p) => (
                  <option key={p} value={p}>
                    {p} - {PLAN_LABELS[p]} (₹{pricesData[p] || 0})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Prefix / Brand</label>
              <input
                type="text"
                value={customPrefix}
                onChange={(e) => setCustomPrefix(e.target.value.toUpperCase())}
                placeholder="NOVA"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase font-mono focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Quantity (1 - 50)</label>
              <input
                type="number"
                min={1}
                max={50}
                value={customCount}
                onChange={(e) => setCustomCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>{isGenerating ? 'Generating Keys...' : `Generate & Upload ${customCount} ${customPlan} Key(s)`}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl p-5 space-y-3">
          <h3 className="font-display font-bold text-white text-sm pb-2 border-b border-slate-800">
            Quick Navigation
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => onNavigate('stock')}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white">Bulk Stock Upload</p>
                <p className="text-[11px] text-slate-400">Paste keys from text</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
            </button>

            <button
              onClick={() => onNavigate('resellers')}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white">Add Reseller</p>
                <p className="text-[11px] text-slate-400">Register Telegram ID</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Log Feed */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white">Recent Key Generations</h3>
              <p className="text-xs text-slate-400">Latest transactions performed by resellers</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('logs')}
            className="text-xs font-medium text-teal-400 hover:text-teal-300"
          >
            View All Activity
          </button>
        </div>

        <div className="divide-y divide-slate-800/60">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No key activity recorded yet</div>
          ) : (
            logs.slice(0, 8).map((log, idx) => (
              <div key={log.id || idx} className="p-4 flex items-center gap-4 hover:bg-slate-950/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono font-semibold text-cyan-300 truncate">{log.generatedKey}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    By <strong className="text-slate-200">{log.resellerName}</strong> • Plan:{' '}
                    <span className="text-teal-300 font-semibold">{log.plan}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-emerald-400">₹{(log.price || 0).toFixed(2)}</p>
                  <p className="text-[10px] text-slate-500">
                    {log.createdAt
                      ? new Date(log.createdAt.toDate ? log.createdAt.toDate() : log.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Just now'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
