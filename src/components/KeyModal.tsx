import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy, Download, X, Key, ShieldCheck, RefreshCw } from 'lucide-react';
import { PlanType, PLAN_LABELS } from '../types';

interface KeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  keys: string[];
  plan: PlanType;
  totalCost: number;
  balanceLeft: number;
}

export const KeyModal: React.FC<KeyModalProps> = ({
  isOpen,
  onClose,
  keys,
  plan,
  totalCost,
  balanceLeft,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySingle = (keyStr: string, idx: number) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(keys.join('\n'));
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([keys.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `NovaEsp_${plan}_Keys_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.75, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="relative w-full max-w-lg bg-slate-900 border border-teal-500/30 rounded-2xl shadow-2xl shadow-teal-950/50 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-teal-500/20 border-b border-teal-500/30 p-6 text-center relative overflow-hidden">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo with Glowing Success Ring & Animated Check Badge */}
            <div className="relative w-20 h-20 mx-auto mb-3 flex items-center justify-center">
              {/* Pulsing ring behind logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-2xl bg-teal-500/20 border border-teal-400/40 blur-sm"
              />
              <motion.img
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 18, stiffness: 260, delay: 0.1 }}
                src="/logo.jpg"
                alt="NovaEsp Logo"
                className="w-18 h-18 object-cover rounded-2xl border-2 border-teal-400/60 shadow-xl shadow-teal-950/60 relative z-10"
                onError={(e) => {
                  // Fallback if image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              {/* Success Check Badge Overlay */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 350, delay: 0.3 }}
                className="absolute -bottom-1 -right-1 z-20 w-7 h-7 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-slate-950 shadow-md"
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </motion.div>
            </div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-2xl font-bold text-white tracking-wide"
            >
              {keys.length > 1 ? `${keys.length} Keys Generated!` : 'Key Generated Successfully!'}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-slate-400 text-sm mt-1"
            >
              Please copy or save your keys now. They will also appear in activity logs.
            </motion.p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 max-h-52 overflow-y-auto space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider mb-2">
                <span>Generated License Keys</span>
                <span>{keys.length} Item(s)</span>
              </div>
              {keys.map((k, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-sm text-cyan-300"
                >
                  <span className="truncate select-all">{k}</span>
                  <button
                    onClick={() => handleCopySingle(k, idx)}
                    className="shrink-0 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Copy Key"
                  >
                    {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400">Plan</p>
                <p className="font-semibold text-white mt-0.5">{plan} ({PLAN_LABELS[plan]})</p>
              </div>
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400">Total Charged</p>
                <p className="font-semibold text-emerald-400 mt-0.5">₹{totalCost.toFixed(2)}</p>
              </div>
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400">Balance Left</p>
                <p className="font-semibold text-cyan-400 mt-0.5">₹{balanceLeft.toFixed(2)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleCopyAll}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center justify-center gap-2 border border-slate-700 transition-all"
              >
                {allCopied ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span>Copied All</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 text-cyan-400" />
                    <span>Copy All</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadTxt}
                className="py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30 transition-all"
              >
                <Download className="w-5 h-5" />
                <span>Download .TXT</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors text-sm font-medium border border-slate-800"
            >
              Done & Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
