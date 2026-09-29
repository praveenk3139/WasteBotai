import React from 'react';
import {
  Sparkles,
  Scan,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Search,
  BarChart3,
  Award,
  Layers,
  Zap,
  MapPin,
  Clock,
  Trash2,
  PlayCircle,
  LogIn,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenScanner: () => void;
  onOpenDemoTour: () => void;
  onOpenLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onOpenScanner,
  onOpenDemoTour,
  onOpenLogin,
}) => {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white p-8 sm:p-14 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <span>🤖 Next-Gen Smart Campus Operations</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            WasteBot <span className="text-emerald-400">AI</span>
          </h1>

          <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
            Detect • Report • Assign • Resolve • Verify • Recover
          </p>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            An AI-powered campus platform for intelligent waste identification, cleanliness reporting, task automation, secure lost-and-found management, and real-time campus analytics.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onGetStarted}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center space-x-2"
            >
              <span>Launch Campus Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-sm shadow-lg shadow-teal-500/20 active:scale-95 transition-all flex items-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Select Role</span>
              </button>
            )}

            <button
              onClick={onOpenScanner}
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md active:scale-95 transition-all flex items-center space-x-2"
            >
              <Scan className="w-4 h-4 text-emerald-400" />
              <span>Try AI Waste Scanner</span>
            </button>

            <button
              onClick={onOpenDemoTour}
              className="px-5 py-3 rounded-2xl bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-sm border border-purple-400/30 backdrop-blur-md active:scale-95 transition-all flex items-center space-x-2"
            >
              <PlayCircle className="w-4 h-4" />
              <span>🎬 18-Step Live Demo Tour</span>
            </button>
          </div>

          {/* Interactive Simulation Strip (Visual Lifecycle) */}
          <div className="pt-8">
            <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-slate-800/80 backdrop-blur-md">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Closed-Loop Automated Incident Lifecycle
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-left text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                    <span>1. Image Upload</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Student snaps photo of overflowing bin.</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <div className="flex items-center space-x-1.5 text-blue-400 font-bold">
                    <span>2. AI Detection</span>
                  </div>
                  <p className="text-[11px] text-slate-400">96.8% confidence PET bottle & overflow.</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                    <span>3. Smart Routing</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Auto-dispatched to Housekeeping (SLA 45m).</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <div className="flex items-center space-x-1.5 text-purple-400 font-bold">
                    <span>4. Resolution Proof</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Cleaning team uploads after photograph.</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <div className="flex items-center space-x-1.5 text-teal-400 font-bold">
                    <span>5. Staff Verified</span>
                  </div>
                  <p className="text-[11px] text-slate-400">HOD signoff +15 student Eco Points.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution Comparison Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto px-4">
        {/* The Problem */}
        <div className="p-6 sm:p-8 rounded-3xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-4">
          <div className="flex items-center space-x-2.5 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-black text-lg">Traditional Campus Operations</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Conventional university reporting relies on word-of-mouth complaints and paper logbooks:
          </p>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-center space-x-2">
              <span className="text-red-500 font-bold">✕</span>
              <span>Manual, slow, and fragmented reporting across disconnected WhatsApp groups.</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-red-500 font-bold">✕</span>
              <span>No verification whether reported waste or spills were properly sanitized.</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-red-500 font-bold">✕</span>
              <span>Lost valuables publicly advertised, leading to false claims and lack of privacy.</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-red-500 font-bold">✕</span>
              <span>Zero student incentive or gamification to maintain academic cleanliness.</span>
            </li>
          </ul>
        </div>

        {/* The Solution */}
        <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-4">
          <div className="flex items-center space-x-2.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-black text-lg">The WasteBot AI Advantage</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            A cohesive full-stack enterprise platform linking students, staff, and operations:
          </p>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-center space-x-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Multimodal AI Vision & Voice triage with instant SLA assignment.</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Strict Before/After photographic comparison verification before ticket closure.</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Privacy-protected Lost & Found with AI similarity matching and secure registrar vault.</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Student Eco Points, tier badges, and departmental green campus rankings.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 8 Feature Cards */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Engineered for Higher Education Campuses
          </h2>
          <p className="text-xs text-slate-500">
            Everything your institution needs to run a cleaner, safer, and smarter facility
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
              <Scan className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">AI Waste Scanner</h4>
            <p className="text-xs text-slate-500">
              Computer vision classification of plastics, e-waste, metals, and hazardous containers.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Smart Segregation</h4>
            <p className="text-xs text-slate-500">
              Directs students to the exact colored bin (Blue/Green/Yellow/Red) with actionable disposal advice.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Multimodal Reporting</h4>
            <p className="text-xs text-slate-500">
              Capture photo evidence and voice descriptions with real-time AI structured triage.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Secure Lost & Found</h4>
            <p className="text-xs text-slate-500">
              Privacy-first custody intake with AI similarity matching and authorized counter verification.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Interactive Campus Map</h4>
            <p className="text-xs text-slate-500">
              Live spatial telemetry with color-coded pins for critical hazards and active tickets.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Before / After Proof</h4>
            <p className="text-xs text-slate-500">
              Cleaning teams upload photo proof of resolution, verified by HOD before closing.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Student Eco Points</h4>
            <p className="text-xs text-slate-500">
              Gamified incentives, tier credentials, and department rivalry promoting sustainability.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Campus Analytics</h4>
            <p className="text-xs text-slate-500">
              Comprehensive recovery rates, SLA compliance benchmarks, and instant CSV/PDF export.
            </p>
          </div>
        </div>
      </section>

      {/* 8-Step Campus Workflow Section */}
      <section className="max-w-6xl mx-auto px-4 p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
            Operational Blueprint
          </span>
          <h3 className="text-xl sm:text-2xl font-black">
            The 8-Stage Smart Campus Workflow
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
          {[
            { step: '1', title: 'Detect', sub: 'Camera / Scan' },
            { step: '2', title: 'Understand', sub: 'CV & Triage' },
            { step: '3', title: 'Report', sub: 'Location Pin' },
            { step: '4', title: 'Assign', sub: 'SLA Dispatch' },
            { step: '5', title: 'Resolve', sub: 'Clean & Repair' },
            { step: '6', title: 'Verify', sub: 'Before/After' },
            { step: '7', title: 'Recover', sub: 'Points & Return' },
            { step: '8', title: 'Analyze', sub: 'Audit Metrics' },
          ].map((s) => (
            <div
              key={s.step}
              className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1"
            >
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold font-mono text-xs inline-flex items-center justify-center mb-1">
                {s.step}
              </span>
              <h5 className="font-bold text-white text-xs">{s.title}</h5>
              <p className="text-[10px] text-slate-400">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white shadow-xl space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black">
          Bring Intelligent Campus Management to Your Institution
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto">
          Start exploring with 8 pre-seeded campus roles, live Gemini AI waste classification, and the 18-step interactive demonstration tour.
        </p>
        <button
          onClick={onGetStarted}
          className="px-8 py-3.5 rounded-2xl bg-white text-emerald-900 font-black text-sm shadow-xl hover:bg-emerald-50 active:scale-95 transition-all"
        >
          Open WasteBot AI Command Center
        </button>
      </section>
    </div>
  );
};
