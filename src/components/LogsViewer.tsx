import React, { useState } from 'react';
import { FileText, Search, Download, RefreshCw, Key, Filter } from 'lucide-react';
import { LogEntry, PlanType, PLAN_LABELS } from '../types';

interface LogsViewerProps {
  logs: LogEntry[];
  onRefresh: () => void;
  onLoadMore?: () => void;
}

export const LogsViewer: React.FC<LogsViewerProps> = ({ logs, onRefresh, onLoadMore }) => {
  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('ALL');

  const filtered = logs.filter((l) => {
    const matchSearch =
      (l.generatedKey || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.resellerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.resellerUsername || '').toLowerCase().includes(search.toLowerCase());

    const matchPlan = selectedPlan === 'ALL' || l.plan === selectedPlan;
    return matchSearch && matchPlan;
  });

  const handleExportCSV = () => {
    const headers = ['Generated Key', 'Reseller Name', 'Reseller ID', 'Plan', 'Price (INR)', 'Balance Left', 'Timestamp'];
    const rows = filtered.map((l) => [
      l.generatedKey,
      l.resellerName,
      l.resellerId,
      l.plan,
      l.price,
      l.balanceLeft,
      l.createdAt
        ? new Date(l.createdAt.toDate ? l.createdAt.toDate() : l.createdAt).toISOString()
        : '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NovaEsp_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white">System Activity Logs</h3>
              <p className="text-xs text-slate-400">Audit trail of all key generations</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search key or reseller..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Plan Filter */}
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Plans</option>
              {(Object.keys(PLAN_LABELS) as PlanType[]).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>

            <button
              onClick={onRefresh}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Generated License Key</th>
                <th className="p-4">Reseller</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Cost</th>
                <th className="p-4">Balance Left</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No activity logs found
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-cyan-300">{log.generatedKey}</td>
                    <td className="p-4">
                      <span className="font-semibold text-white">{log.resellerName}</span>
                      <span className="text-slate-500 text-[11px] block font-mono">
                        @{log.resellerUsername || log.resellerId}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
                        {log.plan}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">₹{(log.price || 0).toFixed(2)}</td>
                    <td className="p-4 font-mono text-slate-400">₹{(log.balanceLeft || 0).toFixed(2)}</td>
                    <td className="p-4 text-right text-slate-500">
                      {log.createdAt
                        ? new Date(log.createdAt.toDate ? log.createdAt.toDate() : log.createdAt).toLocaleString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {onLoadMore && logs.length >= 20 && (
          <div className="p-4 border-t border-slate-800 text-center">
            <button
              onClick={onLoadMore}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
            >
              Load More Activity Logs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
