import React, { useState } from 'react';
import { Users, Plus, Search, Trash2, Wallet, UserCheck, ShieldAlert, AtSign, Check, X, Smartphone, RefreshCw, Lock, Unlock } from 'lucide-react';
import { UserProfile } from '../types';

interface ResellerManagementProps {
  resellers: UserProfile[];
  onAddReseller: (telegramId: string, username: string, name: string) => Promise<void>;
  onRemoveReseller: (id: string, name: string) => void;
  onQuickAddBalance: (resellerId: string, amount: number) => Promise<void>;
  onResetDeviceLock?: (resellerDocId: string, resellerName: string) => Promise<void>;
}

export const ResellerManagement: React.FC<ResellerManagementProps> = ({
  resellers,
  onAddReseller,
  onRemoveReseller,
  onQuickAddBalance,
  onResetDeviceLock,
}) => {
  const [telegramId, setTelegramId] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramId.trim() || !name.trim()) return;

    setIsAdding(true);
    try {
      await onAddReseller(telegramId.trim(), username.trim(), name.trim());
      setTelegramId('');
      setUsername('');
      setName('');
    } finally {
      setIsAdding(false);
    }
  };

  const filtered = resellers.filter(
    (r) =>
      (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.telegramId || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Register Reseller Form */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">Add New Reseller Account</h3>
            <p className="text-xs text-slate-400">
              Enter reseller details. They can sign up using this Telegram ID to inherit balance
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Telegram ID <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              placeholder="e.g. 123456789"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Telegram Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace('@', ''))}
                placeholder="username"
                className="w-full pl-7 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Full Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Reseller Display Name"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="sm:col-span-3 pt-2">
            <button
              type="submit"
              disabled={isAdding}
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isAdding ? 'Creating Account...' : 'Add Reseller Account'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Reseller Directory */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white">Reseller Directory</h3>
              <p className="text-xs text-slate-400">Total: {resellers.length} registered reseller(s)</p>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or Telegram ID..."
              className="w-full sm:w-64 pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Reseller</th>
                <th className="p-4">Telegram ID</th>
                <th className="p-4">Device Lock Status</th>
                <th className="p-4">Current Balance</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No resellers found matching criteria
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id || r.docId} className="hover:bg-slate-950/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center font-bold text-teal-300 text-xs shrink-0">
                          {(r.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{r.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            @{r.username || 'no_username'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-cyan-300">{r.telegramId || r.id}</td>
                    <td className="p-4">
                      {r.activeDeviceId ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 font-mono text-[11px]">
                          <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[130px]">{r.activeDeviceName || 'Device Bound'}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 text-slate-400 border border-slate-700/60 font-mono text-[11px]">
                          <Unlock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Unlocked</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400 text-sm">
                      ₹{(r.balance || 0).toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        {r.activeDeviceId && onResetDeviceLock && (
                          <button
                            onClick={() => onResetDeviceLock(r.docId || r.id, r.name)}
                            className="px-2.5 py-1.5 rounded-lg bg-teal-950/60 text-teal-300 hover:bg-teal-900/80 border border-teal-500/40 transition-colors inline-flex items-center gap-1.5 font-medium text-xs shrink-0"
                            title="Reset Device Lock for this Reseller"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                            <span>Reset Device</span>
                          </button>
                        )}
                        <button
                          onClick={() => onRemoveReseller(r.docId || r.id, r.name)}
                          className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 border border-rose-800/40 transition-colors inline-flex items-center justify-center shrink-0"
                          title="Delete Reseller Account"
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
