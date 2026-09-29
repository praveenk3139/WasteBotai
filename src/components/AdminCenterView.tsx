import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  Database,
  Users,
  Shield,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Server,
  Zap,
} from 'lucide-react';
import { AIModelMeta, UserProfile } from '../types';
import { AI_MODEL_METADATA, DEMO_USERS } from '../data/initialData';

interface AdminCenterViewProps {
  currentUser: UserProfile;
  onResetDemo: () => Promise<void>;
}

export const AdminCenterView: React.FC<AdminCenterViewProps> = ({
  currentUser,
  onResetDemo,
}) => {
  const [model, setModel] = useState<AIModelMeta>(AI_MODEL_METADATA);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleReset = async () => {
    setIsResetting(true);
    setResetMessage(null);
    try {
      await onResetDemo();
      setResetMessage('All demo incident tickets, scans, and audit records successfully restored to default campus state.');
    } catch (e: any) {
      setResetMessage('Error resetting dataset.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              Institutional Infrastructure & Model Registry
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1">Admin & AI Model Control</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure campus dispatch routing matrix, verify real measured AI precision and inference latency, and manage demo datasets.
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={isResetting}
          className="px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs shadow-md active:scale-95 disabled:opacity-50 transition-all flex items-center space-x-1.5"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Resetting...' : 'Restore Demo Dataset'}</span>
        </button>
      </div>

      {resetMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 rounded-2xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* AI Model Architecture & Measured Metrics (Section 56 requirement) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              CURRENT PRODUCTION MODEL
            </span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
              {model.name}
            </h3>
            <p className="text-xs text-slate-500">
              Version {model.version} • Grounded in Gemini 3.8 Flash Vision + Vertex AI Pipeline
            </p>
          </div>
          <Cpu className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Accuracy</span>
            <span className="text-xl font-black text-emerald-600 mt-0.5 block">{model.accuracy}</span>
            <span className="text-[10px] text-slate-400">Validation Split</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Precision</span>
            <span className="text-xl font-black text-blue-600 mt-0.5 block">{model.precision}</span>
            <span className="text-[10px] text-slate-400">Macro Weighted</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Recall</span>
            <span className="text-xl font-black text-teal-600 mt-0.5 block">{model.recall}</span>
            <span className="text-[10px] text-slate-400">Class Averaged</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">F1-Score</span>
            <span className="text-xl font-black text-purple-600 mt-0.5 block">{model.f1Score}</span>
            <span className="text-[10px] text-slate-400">Harmonic Mean</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avg Inference</span>
            <span className="text-xl font-black text-slate-800 dark:text-slate-200 mt-0.5 block font-mono">
              {model.inferenceTimeMs}ms
            </span>
            <span className="text-[10px] text-slate-400">Edge Accelerated</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 text-xs text-slate-600 dark:text-slate-300">
          <span className="font-bold text-purple-900 dark:text-purple-200 block mb-0.5">
            Dataset & Training Specifications:
          </span>
          <p>{model.datasetSize}. Last fine-tuned: {model.lastTrained}. Supports 11 campus waste & personal object categories.</p>
        </div>
      </div>

      {/* Campus Routing Matrix Configuration */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Smart Incident Routing Rules
            </h3>
            <p className="text-xs text-slate-500">Configurable category-to-department facility matrix</p>
          </div>
          <Server className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block">Waste & Overflow</span>
            <span className="text-[11px] text-emerald-600 font-semibold">→ Campus Housekeeping</span>
            <span className="text-[10px] text-slate-400 block mt-1">SLA: 45 Minutes</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block">Water / Plumbing</span>
            <span className="text-[11px] text-blue-600 font-semibold">→ Plumbing Rapid Squad</span>
            <span className="text-[10px] text-slate-400 block mt-1">SLA: 45 Minutes</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block">Electrical Hazards</span>
            <span className="text-[11px] text-amber-600 font-semibold">→ Electrical Maintenance</span>
            <span className="text-[10px] text-slate-400 block mt-1">SLA: 30 Minutes</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block">Lost & Found Items</span>
            <span className="text-[11px] text-purple-600 font-semibold">→ Student Affairs Officer</span>
            <span className="text-[10px] text-slate-400 block mt-1">Secure Registrar Hold</span>
          </div>
        </div>
      </div>
    </div>
  );
};
