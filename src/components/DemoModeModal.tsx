import React, { useState } from 'react';
import {
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Camera,
  Trash2,
  Shield,
  Layers,
  Search,
  Key,
  RotateCcw,
} from 'lucide-react';
import { Role } from '../types';

interface DemoModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: Role) => void;
  onNavigate: (tab: string) => void;
  onResetDemo: () => Promise<void>;
}

export const DemoModeModal: React.FC<DemoModeModalProps> = ({
  isOpen,
  onClose,
  onSelectRole,
  onNavigate,
  onResetDemo,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  const demoSteps = [
    {
      step: 1,
      title: 'Student Opens WasteBot AI',
      role: 'student' as Role,
      tab: 'dashboard',
      actionTitle: 'Welcome to WasteBot AI',
      desc: 'Student Praveen logs in to the clean college dashboard and views campus score 91/100.',
      icon: '👋',
      tag: 'Step 1 of 18',
    },
    {
      step: 2,
      title: 'Student Photographs Waste',
      role: 'student' as Role,
      tab: 'scanner',
      actionTitle: 'Launch Computer Vision Scanner',
      desc: 'Student captures or uploads a photo of discarded waste in the quadrangle.',
      icon: '📷',
      tag: 'Step 2 of 18',
    },
    {
      step: 3,
      title: 'AI Detects: Plastic Bottle (96.8%)',
      role: 'student' as Role,
      tab: 'scanner',
      actionTitle: 'AI Vision Analysis',
      desc: 'WasteBot AI identifies PET Plastic Bottle with 96.8% confidence and generates bounding boxes.',
      icon: '🤖',
      tag: 'Step 3 of 18',
    },
    {
      step: 4,
      title: 'WasteBot Recommends Recyclable Stream',
      role: 'student' as Role,
      tab: 'scanner',
      actionTitle: 'Smart Bin Segregation',
      desc: 'System directs student to Blue Bin (Clean Plastics) with actionable handling guidelines.',
      icon: '♻️',
      tag: 'Step 4 of 18',
    },
    {
      step: 5,
      title: 'Student Reports Overflowing Bin',
      role: 'student' as Role,
      tab: 'report',
      actionTitle: 'Multimodal Reporting',
      desc: 'Student reports overflowing bin outside Food Court with photo evidence and voice note.',
      icon: '🗑️',
      tag: 'Step 5 of 18',
    },
    {
      step: 6,
      title: 'AI Identifies "Overflowing Waste"',
      role: 'student' as Role,
      tab: 'report',
      actionTitle: 'AI Triage Engine',
      desc: 'Gemini NLP categorizes the incident as "Overflowing bin" and scans for campus duplicates.',
      icon: '⚡',
      tag: 'Step 6 of 18',
    },
    {
      step: 7,
      title: 'System Determines: Priority HIGH, Cleaning Team',
      role: 'student' as Role,
      tab: 'report',
      actionTitle: 'Automated Dispatch',
      desc: 'Ticket RPT-2026-081 is auto-assigned to Cleaning Team Alpha with a 45-minute SLA.',
      icon: '⏱️',
      tag: 'Step 7 of 18',
    },
    {
      step: 8,
      title: 'Clearing Team Receives Task',
      role: 'cleaning' as Role,
      tab: 'tasks',
      actionTitle: 'Facility Mobile Dispatch',
      desc: 'Cleaning lead Murugan K. receives mobile task notification and accepts dispatch.',
      icon: '🧹',
      tag: 'Step 8 of 18',
    },
    {
      step: 9,
      title: 'Team Uploads Before & After Evidence',
      role: 'cleaning' as Role,
      tab: 'tasks',
      actionTitle: 'Visual Completion Proof',
      desc: 'Clearing team sanitizes quadrangle walkway and uploads photographic proof of resolution.',
      icon: '📸',
      tag: 'Step 9 of 18',
    },
    {
      step: 10,
      title: 'Staff / HOD Verifies Completion',
      role: 'hod' as Role,
      tab: 'tasks',
      actionTitle: 'Inspection Signoff',
      desc: 'HOD Dr. Sekar compares before and after evidence side-by-side and approves closure.',
      icon: '🛡️',
      tag: 'Step 10 of 18',
    },
    {
      step: 11,
      title: 'Report Marked as "Resolved"',
      role: 'hod' as Role,
      tab: 'dashboard',
      actionTitle: 'Incident Closure',
      desc: 'Ticket marked Resolved. Student Praveen receives +15 Eco Points credited to his profile!',
      icon: '✅',
      tag: 'Step 11 of 18',
    },
    {
      step: 12,
      title: 'Dashboard Analytics Automatically Update',
      role: 'admin' as Role,
      tab: 'analytics',
      actionTitle: 'Live Telemetry Refresh',
      desc: 'Campus cleanliness rating stays at 91/100, diversion rate updates, and audit trail logs timestamp.',
      icon: '📊',
      tag: 'Step 12 of 18',
    },
    {
      step: 13,
      title: 'Student Finds a Lost Metallic Ring',
      role: 'student' as Role,
      tab: 'lost-found',
      actionTitle: 'Found Valuables',
      desc: 'Priya finds a gold-colored signet ring left on study carrel desk #18 in the Central Library.',
      icon: '💍',
      tag: 'Step 13 of 18',
    },
    {
      step: 14,
      title: 'Student Securely Reports Found Item',
      role: 'student' as Role,
      tab: 'lost-found',
      actionTitle: 'Secure Registrar Intake',
      desc: 'Found item logged. AI tags "Possible Ring" with mandatory physical verification disclaimer.',
      icon: '📦',
      tag: 'Step 14 of 18',
    },
    {
      step: 15,
      title: 'Another Student Reports Lost Ring',
      role: 'student' as Role,
      tab: 'lost-found',
      actionTitle: 'Loss Registration',
      desc: 'Student Praveen reports lost signet ring with private confidential engraving details.',
      icon: '📝',
      tag: 'Step 15 of 18',
    },
    {
      step: 16,
      title: 'AI Identifies Potential Match (94.5%)',
      role: 'lost_found' as Role,
      tab: 'lost-found',
      actionTitle: 'Semantic & Spatial Matching',
      desc: 'WasteBot AI flags high correlation between lost and found items in Central Library.',
      icon: '✨',
      tag: 'Step 16 of 18',
    },
    {
      step: 17,
      title: 'Authorized Staff Verifies Ownership',
      role: 'lost_found' as Role,
      tab: 'lost-found',
      actionTitle: 'Private Proof Verification',
      desc: 'Officer Priya Nathan cross-checks confidential inner band engraving ("P.K. 2024").',
      icon: '🔐',
      tag: 'Step 17 of 18',
    },
    {
      step: 18,
      title: 'Item Returned & Incident Closed!',
      role: 'lost_found' as Role,
      tab: 'lost-found',
      actionTitle: 'Recovery Complete',
      desc: 'Ring restored to rightful owner Praveen. Finder awarded +30 Eco Points. Case closed!',
      icon: '🎉',
      tag: 'Step 18 of 18',
    },
  ];

  const current = demoSteps[currentStep - 1];

  const handleApplyStep = () => {
    onSelectRole(current.role);
    onNavigate(current.tab);
  };

  const handleNext = () => {
    if (currentStep < 18) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      const nextItem = demoSteps[nextStep - 1];
      onSelectRole(nextItem.role);
      onNavigate(nextItem.tab);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      const prevItem = demoSteps[prevStep - 1];
      onSelectRole(prevItem.role);
      onNavigate(prevItem.tab);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                🎬 WasteBot AI — 18-Step Live Journey
              </h3>
              <p className="text-[11px] text-slate-500">
                Project Expo & Presentation Guided Interactive Demo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500">
            <span>Progress</span>
            <span className="text-purple-600 dark:text-purple-400">
              Step {currentStep} of 18
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-purple-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${(currentStep / 18) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/60 to-indigo-50/60 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-3xl">{current.icon}</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-100">
              {current.tag}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300 block">
              {current.actionTitle}
            </span>
            <h4 className="font-black text-lg text-slate-900 dark:text-white mt-0.5">
              {current.title}
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
              {current.desc}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-purple-200 dark:border-purple-900/60 text-[11px] text-slate-600 dark:text-slate-400">
            <span>
              Target Persona: <strong className="uppercase text-purple-700 dark:text-purple-300">{current.role}</strong>
            </span>
            <span>
              Navigates To: <strong className="capitalize text-slate-900 dark:text-white">{current.tab}</strong>
            </span>
          </div>
        </div>

        {/* Quick Stepper Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-40 flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleApplyStep}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
          >
            Jump to This View
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep === 18}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95 disabled:opacity-40 flex items-center space-x-1"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Clicking 'Next Step' automatically switches active role and dashboard view.</span>
          <button
            onClick={onResetDemo}
            className="font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
