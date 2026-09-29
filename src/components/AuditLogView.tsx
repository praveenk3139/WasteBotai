import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Clock,
  User,
  Shield,
  ArrowRight,
  Download,
} from 'lucide-react';
import { AuditLogItem } from '../types';

interface AuditLogViewProps {
  auditLogs: AuditLogItem[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const filtered = auditLogs.filter((log) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        log.incidentId.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterAction !== 'all' && !log.action.toLowerCase().includes(filterAction)) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-white/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              Immutable Operations Audit Trail
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1">Institutional Audit Log</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Cryptographically timestamped record of all incident creations, AI classifications, task dispatches, before/after approvals, and returned claims.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-xl bg-white/10 text-xs font-mono font-semibold">
            {auditLogs.length} Events Recorded
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search incident, user, or details..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Filter Action:</span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
          >
            <option value="all">All Actions</option>
            <option value="create">Report Created</option>
            <option value="triage">AI Triage</option>
            <option value="status">Status Update</option>
            <option value="verify">Before/After Verified</option>
            <option value="found">Found Item Logged</option>
            <option value="claim">Claim Returned</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              <th className="pb-3 pl-2">Timestamp</th>
              <th className="pb-3">Incident ID</th>
              <th className="pb-3">Actor / Role</th>
              <th className="pb-3">Action</th>
              <th className="pb-3">Transition</th>
              <th className="pb-3 pr-2">Operational Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-3 pl-2 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                  {log.timestamp}
                </td>
                <td className="py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  {log.incidentId}
                </td>
                <td className="py-3 whitespace-nowrap">
                  <span className="font-semibold text-slate-900 dark:text-white block">{log.user}</span>
                  <span className="text-[10px] text-slate-400">{log.role}</span>
                </td>
                <td className="py-3 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-[11px] text-slate-800 dark:text-slate-200">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 whitespace-nowrap font-mono text-[10px]">
                  {log.previousStatus && (
                    <span className="text-slate-400 uppercase">{log.previousStatus} → </span>
                  )}
                  {log.newStatus && (
                    <span className="font-bold text-emerald-600 uppercase">{log.newStatus}</span>
                  )}
                </td>
                <td className="py-3 pr-2 text-slate-600 dark:text-slate-400 max-w-xs text-[11px]">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
