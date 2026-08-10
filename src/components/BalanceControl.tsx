import React, { useState } from 'react';
import { Wallet, Plus, Minus, ArrowUpRight, ArrowDownRight, User } from 'lucide-react';
import { UserProfile } from '../types';

interface BalanceControlProps {
  resellers: UserProfile[];
  onAddBalance: (resellerId: string, amount: number) => Promise<void>;
  onRemoveBalance: (resellerId: string, amount: number) => Promise<void>;
}

export const BalanceControl: React.FC<BalanceControlProps> = ({
  resellers,
  onAddBalance,
  onRemoveBalance,
}) => {
  const [addResellerId, setAddResellerId] = useState('');
  const [addAmount, setAddAmount] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  const [removeResellerId, setRemoveResellerId] = useState('');
  const [removeAmount, setRemoveAmount] = useState<string>('');
  const [isRemoving, setIsRemoving] = useState(false);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(addAmount);
    if (!addResellerId || isNaN(num) || num <= 0) return;

    setIsAdding(true);
    try {
      await onAddBalance(addResellerId, num);
      setAddAmount('');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(removeAmount);
    if (!removeResellerId || isNaN(num) || num <= 0) return;

    setIsRemoving(true);
    try {
      await onRemoveBalance(removeResellerId, num);
      setRemoveAmount('');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Balance Box */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">Credit Reseller Balance</h3>
              <p className="text-xs text-slate-400">Add funds to reseller wallet for key generations</p>
            </div>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Reseller</label>
              <select
                required
                value={addResellerId}
                onChange={(e) => setAddResellerId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select reseller account...</option>
                {resellers.map((r) => (
                  <option key={r.docId || r.id} value={r.docId || r.id}>
                    {r.name} (@{r.username || 'user'}) - Current: ₹{(r.balance || 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min={1}
                  step={10}
                  required
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2">
              {[100, 500, 1000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAddAmount(String(amt))}
                  className="flex-1 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-[11px] font-mono text-slate-300 transition-colors"
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isAdding}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{isAdding ? 'Crediting...' : 'Confirm Credit Balance'}</span>
            </button>
          </form>
        </div>

        {/* Remove Balance Box */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Minus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">Deduct Reseller Balance</h3>
              <p className="text-xs text-slate-400">Remove funds or adjust balance from reseller</p>
            </div>
          </div>

          <form onSubmit={handleRemoveSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Reseller</label>
              <select
                required
                value={removeResellerId}
                onChange={(e) => setRemoveResellerId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="">Select reseller account...</option>
                {resellers.map((r) => (
                  <option key={r.docId || r.id} value={r.docId || r.id}>
                    {r.name} (@{r.username || 'user'}) - Current: ₹{(r.balance || 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Deduct Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min={1}
                  step={10}
                  required
                  value={removeAmount}
                  onChange={(e) => setRemoveAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold font-mono text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRemoving}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-2"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>{isRemoving ? 'Deducting...' : 'Confirm Deduct Balance'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
