import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Mail,
  ArrowRight,
  Flame,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { CampusReport, LostItem, FoundItem, LostFoundMatch, UserProfile } from '../types';
import { DEPARTMENT_LEADERBOARD } from '../data/initialData';

interface HODCommandCenterProps {
  currentUser: UserProfile;
  reports: CampusReport[];
  lostItems: LostItem[];
  foundItems: FoundItem[];
  matches: LostFoundMatch[];
  onOpenGmailModal: (recipient: string, subject: string, body: string) => void;
  onNavigate: (tab: string) => void;
}

export const HODCommandCenter: React.FC<HODCommandCenterProps> = ({
  currentUser,
  reports,
  lostItems,
  foundItems,
  matches,
  onOpenGmailModal,
  onNavigate,
}) => {
  const openReports = reports.filter((r) => r.status !== 'resolved' && r.status !== 'closed');
  const criticalReports = reports.filter((r) => r.priority === 'critical' && r.status !== 'resolved');
  const pendingTasks = reports.filter((r) => r.status === 'assigned' || r.status === 'in_progress');
  const resolvedToday = reports.filter((r) => r.status === 'resolved');

  const handleEscalateIncident = (report: CampusReport) => {
    const subject = `[URGENT HOD ESCALATION] Facility Incident ${report.id} at ${report.location.building}`;
    const body = `To Campus Facility Operations Director & Cleaning Lead,

This is an automated institutional escalation authorized by ${currentUser.name} (${currentUser.department}).

Incident Details:
- ID: ${report.id}
- Title: ${report.title}
- Location: ${report.location.building} (${report.location.floor} - ${report.location.room || 'General'})
- Priority: CRITICAL (Breached SLA response target)
- Current Status: ${report.status.toUpperCase()}

Please dispatch emergency response personnel immediately and upload photographic proof upon resolution.

Regards,
${currentUser.name}
Head of Department`;

    onOpenGmailModal('facility.director@campus.facility.edu', subject, body);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/50 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              Executive Institutional Command Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            HOD Facility & Safety Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Real-time departmental oversight, recurring incident detection, cross-facility SLA tracking, and official escalation dispatch.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('reports')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
          >
            Audit Log
          </button>
          <button
            onClick={() => onNavigate('analytics')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Campus Analytics</span>
          </button>
        </div>
      </div>

      {/* High Level 7 KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Open Reports</span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
            {openReports.length}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40">
          <span className="text-[10px] text-red-500 font-bold uppercase block">Critical Hazards</span>
          <span className="text-xl font-black text-red-600 mt-1 block animate-pulse">
            {criticalReports.length}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-amber-500 font-bold uppercase block">Pending Tasks</span>
          <span className="text-xl font-black text-amber-500 mt-1 block">
            {pendingTasks.length}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-emerald-600 font-bold uppercase block">Resolved Today</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">
            {resolvedToday.length}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-purple-600 font-bold uppercase block">Lost Items</span>
          <span className="text-xl font-black text-purple-600 mt-1 block">
            {lostItems.length}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-blue-600 font-bold uppercase block">Found Vault</span>
          <span className="text-xl font-black text-blue-600 mt-1 block">
            {foundItems.length}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-teal-600 font-bold uppercase block">AI Matches</span>
          <span className="text-xl font-black text-teal-600 mt-1 block">
            {matches.length}
          </span>
        </div>
      </div>

      {/* Recurring Problem & Critical Escalation Alert */}
      <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-2xl bg-amber-500 text-white shrink-0 mt-0.5">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
              AI Recurring Pattern Detected
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
              Repeated waste overflow cluster near Food Court & Student Plaza (North Patio)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              3 incidents reported within 48 hours during 12:30 PM - 2:00 PM peak lunch hours. Recommended countermeasure: Deploy secondary 240L dual-stream bins.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const sampleReport = reports[0];
            handleEscalateIncident(sampleReport);
          }}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shrink-0 flex items-center space-x-1.5"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Dispatch HOD Escalation Notice</span>
        </button>
      </div>

      {/* Critical Incidents Queue requiring HOD Attention */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Critical & High Priority Watchlist
            </h3>
            <p className="text-xs text-slate-500">Facility tickets requiring administrative signoff or rapid intervention</p>
          </div>
          <span className="text-xs font-mono font-bold text-red-500">
            {criticalReports.length} Critical
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {reports
            .filter((r) => r.priority === 'critical' || r.priority === 'high')
            .map((rep) => (
              <div
                key={rep.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{rep.id}</span>
                    <h4 className="font-extrabold text-slate-900 dark:text-white">{rep.title}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        rep.priority === 'critical' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                      }`}
                    >
                      {rep.priority}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{rep.description}</p>
                  <div className="flex items-center space-x-3 text-[10px] text-slate-400">
                    <span>📍 {rep.location.building}</span>
                    <span>👷 Team: {rep.assignedTeam}</span>
                    <span className="font-semibold text-blue-600">SLA: {rep.slaMinutes}m</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleEscalateIncident(rep)}
                    className="px-3 py-1.5 rounded-xl border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 font-bold text-xs flex items-center space-x-1"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Gmail Alert</span>
                  </button>
                  <button
                    onClick={() => onNavigate('tasks')}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs"
                  >
                    View Status
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Department Performance & SLA Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Campus Department Response Ranking
            </h4>
            <span className="text-[11px] text-emerald-600 font-semibold">Weekly Aggregation</span>
          </div>

          <div className="space-y-2">
            {DEPARTMENT_LEADERBOARD.map((dept) => (
              <div
                key={dept.code}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-[10px] flex items-center justify-center">
                    #{dept.rank}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{dept.department}</span>
                    <span className="text-[10px] text-slate-400 block">{dept.reportsSolved} tickets resolved</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {dept.cleanlinessScore}% Clean Index
                  </span>
                  <span className="text-[10px] text-slate-400 block">{dept.points} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Operations SLA Metrics
            </h4>
            <span className="text-[11px] text-blue-600 font-mono">Live Benchmarks</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Avg Response Time
              </span>
              <span className="text-xl font-black text-blue-600 mt-1 block">18.4 mins</span>
              <span className="text-[10px] text-slate-500">Benchmark target: &lt; 25 mins</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Avg Resolution Time
              </span>
              <span className="text-xl font-black text-emerald-600 mt-1 block">44.2 mins</span>
              <span className="text-[10px] text-slate-500">Target SLA: &lt; 60 mins</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Photo Verification Rate
              </span>
              <span className="text-xl font-black text-purple-600 mt-1 block">98.5%</span>
              <span className="text-[10px] text-slate-500">Before & After compliance</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Lost Items Restored
              </span>
              <span className="text-xl font-black text-teal-600 mt-1 block">84%</span>
              <span className="text-[10px] text-slate-500">Claim match rate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
