import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { AuditLogItem } from '../types';
import { RefreshCw } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs from database', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              System Governance
            </span>
            <span className="text-xs text-slate-500">Live PostgreSQL Database Audit Trail</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            System Audit Trail & State Transitions
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Real-time, append-only log tracking logins, proposal submissions, rubric marks, AI screening triggers, and coordinator actions.
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer w-fit"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Refresh Database Logs</span>
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-xs backdrop-blur-xl">
        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">Reading audit logs from database...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No audit records registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3.5 font-bold">Event ID</th>
                  <th className="pb-3.5 font-bold">Timestamp</th>
                  <th className="pb-3.5 font-bold">Actor Email</th>
                  <th className="pb-3.5 font-bold">Action Triggered</th>
                  <th className="pb-3.5 font-bold">Target Entity</th>
                  <th className="pb-3.5 font-bold">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-4 font-mono text-[11px] text-slate-500">{log.id.slice(0, 8)}...</td>
                    <td className="py-4 text-slate-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 font-bold text-slate-800">{log.actorEmail}</td>
                    <td className="py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 font-mono text-[11px] text-slate-500">{log.targetId || '-'}</td>
                    <td className="py-4 text-slate-700 text-xs max-w-md leading-relaxed">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
