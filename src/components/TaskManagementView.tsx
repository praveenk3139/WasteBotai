import React, { useState, useRef } from 'react';
import {
  CheckSquare,
  Clock,
  Camera,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  ShieldCheck,
  Eye,
  Sparkles,
  MapPin,
  Flame,
} from 'lucide-react';
import { CampusReport, UserProfile } from '../types';

interface TaskManagementViewProps {
  currentUser: UserProfile;
  reports: CampusReport[];
  onUpdateStatus: (reportId: string, status: any, notes?: string) => Promise<void>;
  onVerifyReport: (reportId: string, afterPhoto: string, notes: string) => Promise<void>;
}

export const TaskManagementView: React.FC<TaskManagementViewProps> = ({
  currentUser,
  reports,
  onUpdateStatus,
  onVerifyReport,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<CampusReport | null>(null);

  // Completion modal state
  const [verifyingReport, setVerifyingReport] = useState<CampusReport | null>(null);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'
  );
  const [verificationNotes, setVerificationNotes] = useState('Area cleaned, floor sanitized, and recyclables transferred to depot.');
  const [sliderPosition, setSliderPosition] = useState(50);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isCleaningOrMaint =
    currentUser.role === 'cleaning' ||
    currentUser.role === 'maintenance' ||
    currentUser.role === 'admin';

  const isStaffOrHOD =
    currentUser.role === 'staff' ||
    currentUser.role === 'hod' ||
    currentUser.role === 'admin';

  const filtered = reports.filter((r) => {
    if (filterPriority !== 'all' && r.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  const handleAfterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAfterPhotoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCompleteTask = async () => {
    if (!verifyingReport) return;
    await onVerifyReport(verifyingReport.id, afterPhotoUrl, verificationNotes);
    setVerifyingReport(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-700 text-white shadow-xl shadow-blue-700/10">
        <div className="flex items-center space-x-2">
          <span className="p-1 rounded-lg bg-white/20 text-[10px] font-mono font-bold uppercase tracking-wider">
            Operational Task Dispatch & Verification
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black mt-1">Campus Facility Tasks</h1>
        <p className="text-xs text-blue-100 mt-0.5">
          Mobile-first task execution, SLA countdown tracking, and strict Before/After photographic evidence verification.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-500 uppercase text-[10px]">Filter Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
          >
            <option value="all">All Statuses ({reports.length})</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="under_verification">Under Verification</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-500 uppercase text-[10px]">Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((report) => {
          const isCritical = report.priority === 'critical';
          const isResolved = report.status === 'resolved' || report.status === 'closed';

          return (
            <div
              key={report.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl border p-5 shadow-sm space-y-3.5 transition-all hover:shadow-md ${
                isCritical
                  ? 'border-red-300 dark:border-red-900/60'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Header: ID, Priority, Status */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 font-bold block">
                    {report.id}
                  </span>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm line-clamp-1 mt-0.5">
                    {report.title}
                  </h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    report.priority === 'critical'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      : report.priority === 'high'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  }`}
                >
                  {report.priority}
                </span>
              </div>

              {/* Location & Assigned Team */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-medium truncate">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    {report.location.building} • {report.location.floor}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Team: {report.assignedTeam}</span>
                  <span className="font-mono flex items-center space-x-1 text-blue-600 dark:text-blue-400 font-bold">
                    <Clock className="w-3 h-3" />
                    <span>SLA {report.slaMinutes}m</span>
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                {report.description}
              </p>

              {/* Before Photo Thumb if present */}
              {report.beforePhoto && (
                <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <img
                    src={report.beforePhoto}
                    alt="Before Evidence"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-mono font-bold">
                    BEFORE PHOTO
                  </span>
                  {report.afterPhoto && (
                    <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-mono font-bold">
                      AFTER PHOTO VERIFIED
                    </span>
                  )}
                </div>
              )}

              {/* Status Badge */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Status</span>
                <span
                  className={`font-mono text-xs font-bold uppercase ${
                    isResolved ? 'text-emerald-600' : 'text-amber-500'
                  }`}
                >
                  {report.status.replace('_', ' ')}
                </span>
              </div>

              {/* Action Buttons based on Role & Status */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {report.status === 'assigned' && isCleaningOrMaint && (
                  <button
                    onClick={() =>
                      onUpdateStatus(report.id, 'in_progress', 'Team arrived on site and started clearing.')
                    }
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                  >
                    Accept & Start Work
                  </button>
                )}

                {report.status === 'in_progress' && isCleaningOrMaint && (
                  <button
                    onClick={() => {
                      setVerifyingReport(report);
                    }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload After Evidence</span>
                  </button>
                )}

                {report.status === 'under_verification' && isStaffOrHOD && (
                  <button
                    onClick={() => {
                      setVerifyingReport(report);
                    }}
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Inspect & Signoff</span>
                  </button>
                )}

                {isResolved && (
                  <div className="w-full py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-center font-bold text-xs flex items-center justify-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolved & Verified</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Before / After Verification Modal */}
      {verifyingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs text-emerald-600 font-bold">
                  {verifyingReport.id}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Before / After Photographic Verification
                </h3>
              </div>
              <button
                onClick={() => setVerifyingReport(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Interactive Before / After Dual Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  1. Before Incident Evidence
                </span>
                <div className="aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                  <img
                    src={verifyingReport.beforePhoto || verifyingReport.photoUrl}
                    alt="Before"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-red-600/90 text-white font-mono text-[9px] font-bold">
                    BEFORE (INCIDENT)
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    2. After Cleaned Evidence
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center space-x-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload New</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAfterUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                  <img
                    src={afterPhotoUrl}
                    alt="After"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white font-mono text-[9px] font-bold">
                    AFTER (RESOLVED)
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Signoff Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Inspection & Verification Signoff Notes
              </label>
              <textarea
                rows={2}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
              />
            </div>

            {/* Credit Notice */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Approving this verification will credit +15 Eco Points to reporting student {verifyingReport.reportedBy.name} and close the dispatch ticket.
              </span>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setVerifyingReport(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteTask}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Mark Incident Resolved</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
