import React from 'react';
import { HelpCircle, ShieldCheck, Upload, Users, Tag, Key, Wallet, ShoppingBag, CreditCard } from 'lucide-react';

interface HelpPageProps {
  isAdmin?: boolean;
}

export const HelpPage: React.FC<HelpPageProps> = ({ isAdmin = false }) => {
  if (isAdmin) {
    return (
      <div className="space-y-6 max-w-4xl animate-fadeIn">
        {/* Hero Banner - Admin */}
        <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 rounded-2xl p-6 sm:p-8 text-slate-950 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-950/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-extrabold text-white">Admin Operations Guide</h2>
              <p className="text-teal-100 text-xs sm:text-sm mt-1">
                System management documentation for keys, stock, pricing, and reseller controls.
              </p>
            </div>
          </div>
        </div>

        {/* Guide Cards Grid - Admin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upload Stock */}
          <div className="p-5 bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-white text-sm">1. Stock Upload & Custom Injector</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Admin can bulk upload stock keys or use the <strong>Instant Custom Key Injector</strong> to create keys with custom prefixes (e.g. NOVA-XXXX) for any duration plan.
            </p>
          </div>

          {/* Reseller Onboarding */}
          <div className="p-5 bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-white text-sm">2. Reseller Registration & Linking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Admin registers resellers by Telegram ID. When the reseller logs in with matching credentials, their account automatically syncs with assigned wallet balance and history.
            </p>
          </div>

          {/* Dynamic Pricing */}
          <div className="p-5 bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <Tag className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-white text-sm">3. Flexible Dynamic Pricing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Set or modify prices in ₹ for each key duration plan (5H to 60D). Rate adjustments take effect immediately for all resellers.
            </p>
          </div>

          {/* Balance Control Ledger */}
          <div className="p-5 bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-3">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-white text-sm">4. Balance Ledger & Top Up</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Credit or deduct funds directly from reseller wallet balances and view complete audit trails of all balance adjustments.
            </p>
          </div>

          {/* Key Inspector */}
          <div className="p-5 bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl space-y-2 md:col-span-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-white text-sm">5. Key Inspector & Verification Tool</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click <strong>Inspect Key</strong> in the top navigation bar to check if any key string is valid, active, used, assigned to a specific reseller, or stored in stock.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Reseller / User Panel Guide
  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Hero Banner - Reseller */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 rounded-2xl p-6 sm:p-8 text-slate-950 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-950/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-extrabold text-white">Reseller Portal User Guide</h2>
            <p className="text-teal-100 text-xs sm:text-sm mt-1">
              Instructions on generating keys, checking balance, and managing your reseller portal.
            </p>
          </div>
        </div>
      </div>

      {/* Guide Cards Grid - Reseller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Key Generation */}
        <div className="p-5 bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl space-y-2">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-3">
            <Key className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-white text-sm">1. Key Generation (Single & Batch)</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Select your desired plan (5H, 1D, 3D, 7D, 15D, 30D, 60D) and choose to generate 1 to 20 keys at once. Total cost is calculated live and deducted from your wallet balance.
          </p>
        </div>

        {/* Balance & Receipts */}
        <div className="p-5 bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
            <Wallet className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-white text-sm">2. Wallet Balance & Purchase Receipts</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Monitor your available wallet balance in real time. Visit <strong>My Wallet & History</strong> to view past generation receipts, copy keys, or download key lists.
          </p>
        </div>

        {/* Key Inspector */}
        <div className="p-5 bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-white text-sm">3. Key Inspector & Verification</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Click <strong>Inspect Key</strong> in the top bar to paste any license key and instantly verify its plan type, status, and creation details.
          </p>
        </div>

        {/* Plan Rates & Purchasing */}
        <div className="p-5 bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl space-y-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-white text-sm">4. Plan Rates & Availability</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Check live per-key rates in ₹ for each duration plan. Stock status indicates whether keys are available for instant generation.
          </p>
        </div>

        {/* Top Up Balance */}
        <div className="p-5 bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl space-y-2 md:col-span-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-white text-sm">5. Adding Balance to Your Wallet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            To top up your reseller wallet, contact the Admin with your registered Telegram ID. Once payment is confirmed, the Admin credits your wallet balance instantly.
          </p>
        </div>
      </div>
    </div>
  );
};

