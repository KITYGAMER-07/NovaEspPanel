import React, { useState } from 'react';
import { Zap, Wallet, Package, Copy, Check, Download, AlertCircle, RotateCcw, ShieldCheck, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserProfile, StockDoc, LogEntry, PlanType, PLAN_LABELS, DEFAULT_PRICES } from '../types';

interface ResellerPortalProps {
  user: UserProfile;
  stockData: Record<string, StockDoc>;
  pricesData: Record<string, number>;
  logs: LogEntry[];
  announcement?: string;
  onGenerateKeysBatch: (plan: PlanType, count: number) => Promise<void>;
  onNavigate: (page: string) => void;
}

export const ResellerPortal: React.FC<ResellerPortalProps> = ({
  user,
  stockData,
  pricesData,
  logs,
  announcement,
  onGenerateKeysBatch,
  onNavigate,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('1D');
  const [batchCount, setBatchCount] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const plans: PlanType[] = ['5H', '1D', '3D', '7D', '15D', '30D', '60D'];
  const currentPlanIndex = plans.indexOf(selectedPlan);

  const handlePrevPlan = () => {
    const prevIdx = (currentPlanIndex - 1 + plans.length) % plans.length;
    setSelectedPlan(plans[prevIdx]);
  };

  const handleNextPlan = () => {
    const nextIdx = (currentPlanIndex + 1) % plans.length;
    setSelectedPlan(plans[nextIdx]);
  };

  const unitPrice = pricesData[selectedPlan] ?? DEFAULT_PRICES[selectedPlan];
  const totalPrice = unitPrice * batchCount;

  const stockKeys = stockData[selectedPlan]?.keys;
  const availableStock = Array.isArray(stockKeys) ? stockKeys.filter((k) => !k.used).length : 0;
  const canAfford = (user.balance || 0) >= totalPrice;
  const hasStock = availableStock >= batchCount;

  const handleBatchGenerate = async () => {
    if (!canAfford || !hasStock) return;
    setIsGenerating(true);
    try {
      await onGenerateKeysBatch(selectedPlan, batchCount);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySingle = (keyStr: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedKey(keyStr);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const myLogs = logs.filter(
    (l) => l.resellerDocId === user.docId || l.resellerId === user.telegramId || l.resellerId === user.docId
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn max-w-full overflow-hidden">
      {/* Top Banner Notice if active */}
      {announcement && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-teal-500/10 border border-teal-500/30 flex items-center gap-3 text-xs sm:text-sm text-teal-200 shadow-lg shadow-teal-950/20">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0 animate-pulse" />
          <p className="flex-1 font-medium break-words">
            <span className="font-bold text-teal-300 mr-1.5">ANNOUNCEMENT:</span> {announcement}
          </p>
        </div>
      )}

      {/* Wallet Balance Hero Card */}
      <div className="relative rounded-2xl p-5 sm:p-8 bg-gradient-to-br from-teal-600/30 via-slate-900 to-slate-900 border border-teal-500/40 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Wallet className="w-4 h-4" /> Available Wallet Balance
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
              ₹{(user.balance || 0).toFixed(2)}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5">Ready for instant key generation</p>
          </div>

          <div className="shrink-0 flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
            <button
              onClick={() => onNavigate('myBalance')}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition-all shrink-0"
            >
              View Wallet History
            </button>
            <p className="text-[11px] text-teal-400/80 font-mono truncate">ID: {user.telegramId}</p>
          </div>
        </div>
      </div>

      {/* Batch Key Generator Engine */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-white">Instant Key Generator Engine</h3>
            <p className="text-xs text-slate-400">Select key duration plan and quantity to generate instantly</p>
          </div>
        </div>

        {/* Single Plan Card Carousel with Previous/Next Controls */}
        <div className="space-y-3">
          {/* Main Active Plan Card */}
          <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-teal-500/40 text-center shadow-xl shadow-teal-950/20">
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800 text-[10px] font-mono text-slate-400">
              <span>Plan {currentPlanIndex + 1} of {plans.length}</span>
            </div>

            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 font-display font-bold text-xs text-teal-400 uppercase tracking-wider">
                {PLAN_LABELS[selectedPlan]}
              </span>
              <h4 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight pt-1">
                {selectedPlan} <span className="text-slate-400 font-normal text-lg sm:text-xl">License</span>
              </h4>
            </div>

            <div className="my-4 py-3 px-4 rounded-xl bg-slate-900/90 border border-slate-800/80 inline-block max-w-xs w-full">
              <p className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Unit Price</p>
              <p className="font-mono font-extrabold text-2xl sm:text-3xl text-teal-400 mt-0.5">₹{unitPrice}</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Package className="w-3.5 h-3.5 text-teal-400" />
              <span>Stock Status:</span>
              <strong className={availableStock > 0 ? "text-emerald-400 font-mono" : "text-rose-400 font-mono"}>
                {availableStock > 0 ? `${availableStock} Keys Available` : 'Out of Stock'}
              </strong>
            </div>

            {/* Plan Dots Indicator */}
            <div className="flex items-center justify-center gap-1.5 pt-3">
              {plans.map((p, idx) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPlan(p)}
                  title={p}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentPlanIndex
                      ? 'w-6 bg-teal-400'
                      : 'w-2 bg-slate-800 hover:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Previous & Next Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handlePrevPlan}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-900 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <ChevronLeft className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Previous Plan</span>
            </button>

            <button
              type="button"
              onClick={handleNextPlan}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-900 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Next Plan</span>
              <ChevronRight className="w-4 h-4 text-teal-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* Quantity Selector & Cost Breakdown */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Batch Quantity (1 - 3 Keys)</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBatchCount((c) => Math.max(1, c - 1))}
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 font-bold text-white hover:bg-slate-800 shrink-0"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                max={3}
                value={batchCount}
                onChange={(e) =>
                  setBatchCount(Math.max(1, Math.min(3, parseInt(e.target.value) || 1)))
                }
                className="w-20 text-center py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-bold text-white font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setBatchCount((c) => Math.min(3, c + 1))}
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 font-bold text-white hover:bg-slate-800 shrink-0"
              >
                +
              </button>
            </div>
          </div>

          <div className="text-left space-y-0.5">
            <span className="text-xs text-slate-400">Order Cost Calculation:</span>
            <p className="font-mono text-lg sm:text-xl font-bold text-emerald-400">
              ₹{totalPrice.toFixed(2)}{' '}
              <span className="text-xs text-slate-500 font-normal">
                ({batchCount} × ₹{unitPrice})
              </span>
            </p>
          </div>

          <div className="sm:text-right">
            <button
              onClick={handleBatchGenerate}
              disabled={isGenerating || !canAfford || !hasStock}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-lg shadow-teal-950/40 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>
                {isGenerating
                  ? 'Generating Keys...'
                  : !hasStock
                  ? availableStock === 0
                    ? 'Out of Stock'
                    : `Only ${availableStock} Key(s) in Stock`
                  : !canAfford
                  ? 'Insufficient Balance'
                  : `Generate ${batchCount} ${selectedPlan} Key(s)`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Reseller's Recent Keys Table */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-sm sm:text-base">Your Recent Generated License Keys</h3>
              <p className="text-xs text-slate-400">Keys generated under your account</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {myLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">You haven't generated any keys yet</div>
          ) : (
            myLogs.slice(0, 10).map((log, idx) => (
              <div key={log.id || idx} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 hover:bg-slate-950/40 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="font-mono font-bold text-cyan-300 text-xs sm:text-sm break-all">{log.generatedKey}</p>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                    Plan: <strong className="text-teal-300">{log.plan}</strong> • Cost:{' '}
                    <span className="text-emerald-400 font-semibold">₹{(log.price || 0).toFixed(2)}</span> •{' '}
                    {log.createdAt
                      ? new Date(log.createdAt.toDate ? log.createdAt.toDate() : log.createdAt).toLocaleDateString()
                      : ''}
                  </p>
                </div>

                <button
                  onClick={() => handleCopySingle(log.generatedKey)}
                  className="self-end sm:self-center px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0 flex items-center gap-1.5 text-xs"
                  title="Copy key"
                >
                  {copiedKey === log.generatedKey ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
