import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Award, Package, ShieldCheck } from 'lucide-react';
import { LogEntry, UserProfile, PLAN_LABELS, PlanType } from '../types';

interface AnalyticsViewProps {
  logs: LogEntry[];
  resellers: UserProfile[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ logs, resellers }) => {
  // Compute revenue per plan
  const planRevenue: Record<string, { count: number; total: number }> = {};
  (Object.keys(PLAN_LABELS) as PlanType[]).forEach((p) => {
    planRevenue[p] = { count: 0, total: 0 };
  });

  // Compute stats per reseller
  const resellerSales: Record<string, { name: string; count: number; spent: number }> = {};

  logs.forEach((log) => {
    if (log.plan && planRevenue[log.plan]) {
      planRevenue[log.plan].count += 1;
      planRevenue[log.plan].total += log.price || 0;
    }

    const resKey = log.resellerDocId || log.resellerId || 'Unknown';
    if (!resellerSales[resKey]) {
      resellerSales[resKey] = {
        name: log.resellerName || 'Reseller',
        count: 0,
        spent: 0,
      };
    }
    resellerSales[resKey].count += 1;
    resellerSales[resKey].spent += log.price || 0;
  });

  const totalRev = logs.reduce((sum, l) => sum + (l.price || 0), 0);
  const totalKeys = logs.length;

  const sortedResellers = Object.values(resellerSales).sort((a, b) => b.spent - a.spent);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-500/20 via-slate-900 to-slate-900 border border-teal-500/30 shadow-xl">
          <div className="flex items-center gap-3 mb-2 text-teal-400">
            <DollarSign className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Sales</span>
          </div>
          <p className="font-display text-3xl font-bold text-white">₹{totalRev.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Total revenue generated</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-slate-900 to-slate-900 border border-cyan-500/30 shadow-xl">
          <div className="flex items-center gap-3 mb-2 text-cyan-400">
            <Package className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
          </div>
          <p className="font-display text-3xl font-bold text-white">{totalKeys}</p>
          <p className="text-xs text-slate-400 mt-1">Keys generated across all plans</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/20 via-slate-900 to-slate-900 border border-purple-500/30 shadow-xl">
          <div className="flex items-center gap-3 mb-2 text-purple-400">
            <Award className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Order Value</span>
          </div>
          <p className="font-display text-3xl font-bold text-white">
            ₹{totalKeys > 0 ? (totalRev / totalKeys).toFixed(1) : '0'}
          </p>
          <p className="text-xs text-slate-400 mt-1">Average spent per key purchase</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Revenue Breakdown */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white">Plan Performance Breakdown</h3>
              <p className="text-xs text-slate-400">Revenue distribution by key duration plan</p>
            </div>
          </div>

          <div className="space-y-3">
            {(Object.keys(PLAN_LABELS) as PlanType[]).map((plan) => {
              const data = planRevenue[plan];
              const pct = totalRev > 0 ? (data.total / totalRev) * 100 : 0;

              return (
                <div key={plan} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white font-display">
                      {plan} ({PLAN_LABELS[plan]})
                    </span>
                    <span className="font-mono text-teal-300">
                      {data.count} keys • ₹{data.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Resellers Leaderboard */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white">Top Resellers Ranking</h3>
              <p className="text-xs text-slate-400">Leaderboard by total expenditure</p>
            </div>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
            {sortedResellers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No reseller sales recorded yet</div>
            ) : (
              sortedResellers.map((r, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        idx === 0
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : idx === 1
                          ? 'bg-slate-300/20 text-slate-200 border border-slate-400/40'
                          : idx === 2
                          ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                          : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-white">{r.name}</p>
                      <p className="text-[11px] text-slate-400">{r.count} Key(s) Purchased</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-sm">₹{r.spent.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
