import React, { useState } from 'react';
import {
  BarChart3,
  PieChart,
  Download,
  Printer,
  Sparkles,
  TrendingUp,
  Award,
  Recycle,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { CampusReport } from '../types';
import { DEPARTMENT_LEADERBOARD } from '../data/initialData';

interface AnalyticsViewProps {
  reports: CampusReport[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ reports }) => {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const totalReports = reports.length;
  const resolvedReports = reports.filter((r) => r.status === 'resolved' || r.status === 'closed').length;
  const activeReports = reports.filter((r) => r.status !== 'resolved' && r.status !== 'closed').length;

  const wasteData = [
    { label: 'Recyclable Plastic', count: 540, pct: 38, color: '#2563EB' },
    { label: 'Organic Food Waste', count: 412, pct: 29, color: '#16A34A' },
    { label: 'Paper & Cardboard', count: 245, pct: 17, color: '#0D9488' },
    { label: 'Metal Containers', count: 114, pct: 8, color: '#EAB308' },
    { label: 'E-Waste Items', count: 65, pct: 5, color: '#8B5CF6' },
    { label: 'Hazardous / Chemical', count: 44, pct: 3, color: '#DC2626' },
  ];

  const handleDownloadCSV = () => {
    const headers = 'Incident ID,Title,Category,Building,Priority,Status,Reported By,Reported At\n';
    const rows = reports
      .map(
        (r) =>
          `"${r.id}","${r.title.replace(/"/g, '""')}","${r.category}","${r.location.building}","${r.priority}","${r.status}","${r.reportedBy.name}","${r.reportedAt}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `WasteBot_Campus_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-700 text-white shadow-xl shadow-blue-700/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-white/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              Institutional Environmental Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">Campus Operations Analytics</h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Real-time circular waste recovery rates, operations SLA benchmarks, and institutional audit compliance exports.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2 rounded-xl bg-white text-slate-800 hover:bg-slate-50 font-bold text-xs shadow-md active:scale-95 transition-all flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold text-xs shadow-md border border-white/20 active:scale-95 transition-all flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Total Scans Completed
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white">1,420</span>
            <span className="text-xs text-emerald-600 font-semibold">+18% this month</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">
            Recyclable Diversion Rate
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-black text-blue-600">74.2%</span>
            <span className="text-xs text-slate-400">Target 80%</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">
            Resolution Success Rate
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-black text-emerald-600">
              {Math.round((resolvedReports / Math.max(totalReports, 1)) * 100)}%
            </span>
            <span className="text-xs text-slate-400">Photo verified</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider block">
            Lost Items Restored
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-black text-purple-600">84%</span>
            <span className="text-xs text-purple-400">Claim rate</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Waste Composition Breakdown */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Waste Category Breakdown
              </h3>
              <p className="text-xs text-slate-500">Distribution of scanned waste items</p>
            </div>
            <Recycle className="w-5 h-5 text-emerald-600" />
          </div>

          {/* Graphical Progress Bars */}
          <div className="space-y-3 pt-2">
            {wasteData.map((item) => (
              <div key={item.label} className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-semibold">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-800 dark:text-slate-200">{item.label}</span>
                  </div>
                  <span className="text-slate-500 font-mono">
                    {item.count} items ({item.pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational SLA and Resolution Trend */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Department Response SLA Benchmarks
              </h3>
              <p className="text-xs text-slate-500">Average response and resolution time by department</p>
            </div>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>

          <div className="space-y-3.5 pt-2">
            {DEPARTMENT_LEADERBOARD.map((dept) => (
              <div
                key={dept.code}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {dept.department}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {dept.reportsSolved} solved • Score {dept.cleanlinessScore}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    &lt; 22 mins avg
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase block font-semibold">
                    Response SLA
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
