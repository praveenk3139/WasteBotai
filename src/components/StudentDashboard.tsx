import React from 'react';
import {
  Scan,
  AlertTriangle,
  Search,
  MapPin,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Leaf,
  Navigation,
} from 'lucide-react';
import { CampusReport, UserProfile } from '../types';
import { Language, TRANSLATIONS } from '../utils/i18n';
import {
  calculateDistanceMeters,
  formatDistance,
  estimateWalkingTime,
  DEFAULT_USER_LOCATION,
} from '../utils/geoDistance';

interface StudentDashboardProps {
  currentUser: UserProfile;
  reports: CampusReport[];
  onNavigate: (tab: string) => void;
  language: Language;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  reports,
  onNavigate,
  language,
}) => {
  const t = TRANSLATIONS[language];

  const myReports = reports.filter((r) => r.reportedBy.id === currentUser.id);
  const pendingReports = myReports.filter((r) => r.status !== 'resolved' && r.status !== 'closed');
  const resolvedReports = myReports.filter((r) => r.status === 'resolved' || r.status === 'closed');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 text-white shadow-xl shadow-emerald-700/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-white/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              {currentUser.collegeId} • {currentUser.year || 'Student Member'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Good Day, {currentUser.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Welcome to WasteBot AI. Together, students and faculty maintain a zero-overflow, circular, and safe campus.
          </p>
        </div>

        {/* Campus Score Pill */}
        <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0">
          <div>
            <span className="text-[10px] text-emerald-100 uppercase font-bold tracking-wider block">
              Campus Health Score
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-black">91</span>
              <span className="text-sm font-semibold text-emerald-200">/ 100</span>
            </div>
            <span className="text-[10px] text-emerald-200 font-medium">Top 5% Eco Tier</span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-emerald-300 border-t-white flex items-center justify-center font-bold text-xs">
            A+
          </div>
        </div>
      </div>

      {/* 4 Main Action Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => onNavigate('scanner')}
          className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-emerald-500 hover:shadow-lg transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Scan className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
            📷 Scan Waste
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Detect recyclables, check bins & segregation advice.
          </p>
        </button>

        <button
          onClick={() => onNavigate('report')}
          className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-teal-500 hover:shadow-lg transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
            🗑️ Report Issue
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Dispatch overflowing bins or campus safety concerns.
          </p>
        </button>

        <button
          onClick={() => onNavigate('lost-found')}
          className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-purple-500 hover:shadow-lg transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
            🔎 Lost & Found
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            AI similarity matching for personal belongings.
          </p>
        </button>

        <button
          onClick={() => onNavigate('map')}
          className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-blue-500 hover:shadow-lg transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
            📍 Campus Map
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Spatial view of active tickets & recycling stations.
          </p>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            My Submitted Reports
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {myReports.length}
            </span>
            <span className="text-xs text-slate-400">Total</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
            Pending Resolution
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-amber-500">{pendingReports.length}</span>
            <span className="text-xs text-slate-400">In Progress</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
            Verified & Resolved
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">{resolvedReports.length}</span>
            <span className="text-xs text-slate-400">Fixed</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">
            Student Eco Points
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-purple-600">{currentUser.ecoPoints}</span>
            <span className="text-xs text-purple-400">Level 4</span>
          </div>
        </div>
      </div>

      {/* Recent Incident Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Recent Campus Activity Feed
            </h3>
            <p className="text-xs text-slate-500">Live operational status across all student zones</p>
          </div>
          <button
            onClick={() => onNavigate('tasks')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <span>View All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {reports.slice(0, 4).map((report) => (
            <div key={report.id} className="py-3 flex items-start justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[10px] text-slate-400 font-bold">{report.id}</span>
                  <h4 className="font-bold text-slate-900 dark:text-white">{report.title}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      report.priority === 'critical'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {report.priority}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] line-clamp-1">{report.description}</p>
                <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-slate-400">
                  <span>📍 {report.location.building}</span>
                  {report.location.geoCoords && (
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md">
                      <Navigation className="w-2.5 h-2.5" />
                      <span>
                        {formatDistance(
                          calculateDistanceMeters(
                            DEFAULT_USER_LOCATION.lat,
                            DEFAULT_USER_LOCATION.lng,
                            report.location.geoCoords.lat,
                            report.location.geoCoords.lng
                          )
                        )} • {estimateWalkingTime(
                          calculateDistanceMeters(
                            DEFAULT_USER_LOCATION.lat,
                            DEFAULT_USER_LOCATION.lng,
                            report.location.geoCoords.lat,
                            report.location.geoCoords.lng
                          )
                        )}
                      </span>
                    </span>
                  )}
                  <span>👷 Assigned: {report.assignedTeam}</span>
                  <span className="font-semibold text-emerald-600">Status: {report.status.replace('_', ' ')}</span>
                </div>
              </div>

              {report.beforePhoto && (
                <img
                  src={report.beforePhoto}
                  alt="Thumb"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
