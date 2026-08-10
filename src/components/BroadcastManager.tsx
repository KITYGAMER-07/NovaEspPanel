import React, { useState } from 'react';
import { Radio, Send, Bell, Sparkles, Check, Trash2 } from 'lucide-react';

interface BroadcastManagerProps {
  resellersCount: number;
  onSendBroadcast: (msg: string) => Promise<void>;
  onSetAnnouncementBanner: (msg: string) => Promise<void>;
  currentAnnouncement?: string;
}

export const BroadcastManager: React.FC<BroadcastManagerProps> = ({
  resellersCount,
  onSendBroadcast,
  onSetAnnouncementBanner,
  currentAnnouncement,
}) => {
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [bannerMsg, setBannerMsg] = useState(currentAnnouncement || '');
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingBanner, setIsUpdatingBanner] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;

    setIsSending(true);
    try {
      await onSendBroadcast(broadcastMsg.trim());
      setBroadcastMsg('');
    } finally {
      setIsSending(false);
    }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingBanner(true);
    try {
      await onSetAnnouncementBanner(bannerMsg.trim());
    } finally {
      setIsUpdatingBanner(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Live Marquee Banner Manager */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">Live Top Notice Banner</h3>
            <p className="text-xs text-slate-400">
              Set a pinned announcement banner visible to ALL resellers on top of their dashboard
            </p>
          </div>
        </div>

        <form onSubmit={handleBannerSubmit} className="space-y-3">
          <input
            type="text"
            value={bannerMsg}
            onChange={(e) => setBannerMsg(e.target.value)}
            placeholder="e.g. Stock Refilled! 60D keys now available. Contact admin for bulk discount."
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
          />

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setBannerMsg('');
                onSetAnnouncementBanner('');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Banner
            </button>

            <button
              type="submit"
              disabled={isUpdatingBanner}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-950/40 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isUpdatingBanner ? 'Publishing...' : 'Update Notice Banner'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Broadcast Message Form */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">Broadcast Announcement</h3>
            <p className="text-xs text-slate-400">Send an instant alert message to all active resellers</p>
          </div>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-4">
          <textarea
            rows={5}
            value={broadcastMsg}
            onChange={(e) => setBroadcastMsg(e.target.value)}
            placeholder="Type your message here to broadcast..."
            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Recipients:{' '}
              <strong className="text-teal-300 font-mono">{resellersCount} Resellers</strong>
            </p>

            <button
              type="submit"
              disabled={isSending || !broadcastMsg.trim()}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-indigo-950/40 transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Sending...' : 'Send Broadcast'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
