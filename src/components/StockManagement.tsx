import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Upload, Trash2, Eye, RefreshCw, Check, AlertCircle, Search, Key, ShieldCheck } from 'lucide-react';
import { StockDoc, PlanType, PLAN_LABELS, StockKey } from '../types';

interface StockManagementProps {
  stockData: Record<string, StockDoc>;
  pricesData: Record<string, number>;
  onUploadKeys: (plan: PlanType, keys: string[]) => Promise<void>;
  onDeleteKeyFromStock: (plan: PlanType, keyStr: string) => Promise<void>;
  onClearUsedKeys: (plan: PlanType) => Promise<void>;
  onRefresh: () => void;
}

export const StockManagement: React.FC<StockManagementProps> = ({
  stockData,
  pricesData,
  onUploadKeys,
  onDeleteKeyFromStock,
  onClearUsedKeys,
  onRefresh,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('1D');
  const [keysInput, setKeysInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [viewingPlan, setViewingPlan] = useState<PlanType | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const plans: PlanType[] = ['5H', '1D', '3D', '7D', '15D', '30D', '60D'];

  const handleUpload = async () => {
    const rawKeys = keysInput
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (rawKeys.length === 0) return;

    setIsUploading(true);
    try {
      await onUploadKeys(selectedPlan, rawKeys);
      setKeysInput('');
    } finally {
      setIsUploading(false);
    }
  };

  const getActiveKeysCount = (plan: PlanType) => {
    const keys = stockData[plan]?.keys;
    return Array.isArray(keys) ? keys.filter((k) => !k.used).length : 0;
  };

  const getUsedKeysCount = (plan: PlanType) => {
    const keys = stockData[plan]?.keys;
    return Array.isArray(keys) ? keys.filter((k) => k.used).length : 0;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Upload Box */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">Stock Key Uploader</h3>
            <p className="text-xs text-slate-400">Add new license keys into inventory (One per line)</p>
          </div>
        </div>

        {/* Plan Select Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {plans.map((p) => {
            const isSelected = selectedPlan === p;
            const count = getActiveKeysCount(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPlan(p)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-teal-500 text-white shadow-lg shadow-teal-950/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <p className="font-display font-bold text-sm">{p}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{PLAN_LABELS[p]}</p>
                <span className="inline-block mt-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-900 text-teal-400 border border-slate-800">
                  {count} in stock
                </span>
              </button>
            );
          })}
        </div>

        {/* Textarea Area */}
        <div className="relative">
          <textarea
            rows={5}
            value={keysInput}
            onChange={(e) => setKeysInput(e.target.value)}
            placeholder={`Paste ${selectedPlan} keys here, one per line...\nE.g.:\nNOVA-8821-X9A1-3321\nNOVA-9912-K2L3-4412`}
            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300 focus:outline-none focus:border-teal-500 transition-colors resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-slate-400">
            Selected Target:{' '}
            <strong className="text-teal-300">
              {selectedPlan} ({PLAN_LABELS[selectedPlan]})
            </strong>
          </p>
          <button
            onClick={handleUpload}
            disabled={isUploading || !keysInput.trim()}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-teal-900/30 transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Uploading...' : 'Upload Keys'}</span>
          </button>
        </div>
      </div>

      {/* Current Inventory Table */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white">Stock Inventory Matrix</h3>
              <p className="text-xs text-slate-400">Detailed breakdown of active and used keys</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Inventory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Plan</th>
                <th className="p-4">Available</th>
                <th className="p-4">Used</th>
                <th className="p-4">Unit Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {plans.map((p) => {
                const active = getActiveKeysCount(p);
                const used = getUsedKeysCount(p);
                const price = pricesData[p] || 0;
                const isLow = active < 5;

                return (
                  <tr key={p} className="hover:bg-slate-950/40 transition-colors">
                    <td className="p-4 font-bold text-white font-display">
                      {p} <span className="text-slate-400 font-normal text-[11px] ml-1">({PLAN_LABELS[p]})</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-teal-400">{active}</td>
                    <td className="p-4 font-mono text-slate-400">{used}</td>
                    <td className="p-4 font-mono font-bold text-emerald-400">₹{price}</td>
                    <td className="p-4">
                      {active === 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setViewingPlan(p)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 inline mr-1" /> View Keys
                      </button>
                      {used > 0 && (
                        <button
                          onClick={() => onClearUsedKeys(p)}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-colors"
                          title="Purge Used Keys"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Purge Used
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Keys Modal */}
      <AnimatePresence>
        {viewingPlan && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-display font-bold text-white text-lg">
                    {viewingPlan} Stock Keys ({PLAN_LABELS[viewingPlan]})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Total: {stockData[viewingPlan]?.keys?.length || 0} key(s) in database
                  </p>
                </div>
                <button
                  onClick={() => setViewingPlan(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Search Filter */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter keys..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Keys list */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {(() => {
                  const allKeys = stockData[viewingPlan]?.keys || [];
                  const filtered = allKeys.filter((k) =>
                    k.key.toLowerCase().includes(searchFilter.toLowerCase())
                  );

                  if (filtered.length === 0) {
                    return <div className="text-center py-8 text-xs text-slate-500">No keys match search</div>;
                  }

                  return filtered.map((k, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-mono font-semibold text-cyan-300 truncate">{k.key}</p>
                        <p className="text-[10px] text-slate-500">
                          {k.used ? (
                            <span className="text-amber-400 font-medium">
                              Used by: {k.usedBy || 'Reseller'} ({k.usedAt ? new Date(k.usedAt).toLocaleDateString() : ''})
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-medium">Available in stock</span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => onDeleteKeyFromStock(viewingPlan, k.key)}
                        className="p-1.5 rounded bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 border border-rose-800/40 transition-colors"
                        title="Delete key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ));
                })()}
              </div>

              <div className="pt-2 border-t border-slate-800 text-right">
                <button
                  onClick={() => setViewingPlan(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
