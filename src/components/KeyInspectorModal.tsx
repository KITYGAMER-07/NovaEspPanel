import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Key, X, CheckCircle2, AlertTriangle, User, Calendar, ShieldAlert } from 'lucide-react';
import { StockDoc, LogEntry, PlanType, PLAN_LABELS } from '../types';

interface KeyInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  stockData: Record<string, StockDoc>;
  logsData: LogEntry[];
}

export const KeyInspectorModal: React.FC<KeyInspectorProps> = ({
  isOpen,
  onClose,
  stockData,
  logsData,
}) => {
  const [searchKey, setSearchKey] = useState('');
  const [result, setResult] = useState<{
    found: boolean;
    plan?: PlanType;
    used?: boolean;
    usedBy?: string | null;
    usedAt?: string | null;
    logInfo?: LogEntry | null;
  } | null>(null);

  if (!isOpen) return null;

  const handleInspect = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchKey.trim();
    if (!query) return;

    let foundPlan: PlanType | undefined;
    let keyObj: any = null;

    // Search through stock collections
    for (const [plan, docObj] of Object.entries(stockData)) {
      const doc = docObj as StockDoc;
      if (doc?.keys && Array.isArray(doc.keys)) {
        const match = doc.keys.find((k) => k.key.toLowerCase() === query.toLowerCase());
        if (match) {
          foundPlan = plan as PlanType;
          keyObj = match;
          break;
        }
      }
    }

    // Search logs as well
    const logMatch = logsData.find((l) => l.generatedKey.toLowerCase() === query.toLowerCase());

    if (keyObj || logMatch) {
      setResult({
        found: true,
        plan: foundPlan || logMatch?.plan,
        used: keyObj ? keyObj.used : true,
        usedBy: keyObj?.usedBy || logMatch?.resellerName,
        usedAt: keyObj?.usedAt || (logMatch?.createdAt ? new Date(logMatch.createdAt.toDate ? logMatch.createdAt.toDate() : logMatch.createdAt).toLocaleString() : null),
        logInfo: logMatch || null,
      });
    } else {
      setResult({ found: false });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">Key Inspector & Checker</h3>
                <p className="text-xs text-slate-400">Verify key status, plan, and generation logs</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleInspect} className="mt-5 space-y-4">
            <div className="relative">
              <Key className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                placeholder="Paste key here to check (e.g., NOVA-XXXX)..."
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Inspect Key</span>
            </button>
          </form>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 p-4 rounded-xl border bg-slate-950/80 border-slate-800 space-y-3"
            >
              {result.found ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Key Status:</span>
                    {result.used ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Used / Issued
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active in Stock
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Plan:</span>
                      <span className="font-bold text-white text-sm">
                        {result.plan ? `${result.plan} (${PLAN_LABELS[result.plan]})` : 'Unknown'}
                      </span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Reseller / Owner:</span>
                      <span className="font-semibold text-cyan-300 text-sm">
                        {result.usedBy || 'In Admin Inventory'}
                      </span>
                    </div>
                  </div>

                  {result.logInfo && (
                    <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 space-y-1">
                      <p className="flex justify-between">
                        <span>Original Price:</span>
                        <strong className="text-white">₹{result.logInfo.price}</strong>
                      </p>
                      <p className="flex justify-between">
                        <span>Generated Date:</span>
                        <strong className="text-slate-300">
                          {result.logInfo.createdAt
                            ? new Date(result.logInfo.createdAt.toDate ? result.logInfo.createdAt.toDate() : result.logInfo.createdAt).toLocaleString()
                            : 'N/A'}
                        </strong>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-rose-400 flex flex-col items-center gap-2">
                  <ShieldAlert className="w-8 h-8 opacity-80" />
                  <p className="font-semibold text-sm">Key Not Found</p>
                  <p className="text-xs text-slate-400">
                    This key does not exist in stock or activity records.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
