import React, { useState } from 'react';
import { RotateCcw, Check, X, Key, User, Clock, AlertCircle } from 'lucide-react';
import { ResetRequest } from '../types';

interface ResetRequestsProps {
  requests: ResetRequest[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

export const ResetRequests: React.FC<ResetRequestsProps> = ({ requests, onApprove, onReject }) => {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  const handleApproveClick = async (id: string) => {
    setIsProcessing(true);
    try {
      await onApprove(id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSubmit = async (id: string) => {
    setIsProcessing(true);
    try {
      await onReject(id, rejectReason.trim() || 'Invalid HWID reset request');
      setRejectingId(null);
      setRejectReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white">Key Reset Approvals</h3>
              <p className="text-xs text-slate-400">Review pending device / HWID key reset requests</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            {pendingRequests.length} Pending
          </span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
              <RotateCcw className="w-8 h-8 opacity-40" />
              <p className="font-semibold">No Pending Reset Requests</p>
              <p className="text-slate-600">All key reset requests have been processed</p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div key={req.id} className="p-5 space-y-3 hover:bg-slate-950/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-orange-400 shrink-0">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-mono font-bold text-cyan-300 text-sm">{req.resetKey}</p>
                      <p className="text-xs text-slate-400">
                        Requested by <strong className="text-white">{req.resellerName}</strong> (@
                        {req.resellerUsername || req.resellerId})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveClick(req.id!)}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-950/30 flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Approve Reset
                    </button>

                    <button
                      onClick={() => setRejectingId(req.id!)}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 font-semibold text-xs transition-all flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>

                {/* Inline Reject Reason Input */}
                {rejectingId === req.id && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <label className="block text-[11px] text-slate-400">Rejection Reason:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g. Key expired / Invalid HWID form"
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                      <button
                        onClick={() => handleRejectSubmit(req.id!)}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg"
                      >
                        Confirm Reject
                      </button>
                      <button
                        onClick={() => setRejectingId(null)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-400 hover:text-white text-xs rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
