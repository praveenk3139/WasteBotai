import React from 'react';
import {
  Award,
  Sparkles,
  Trophy,
  CheckCircle2,
  TrendingUp,
  Leaf,
  Shield,
  Zap,
  Star,
  Users,
} from 'lucide-react';
import { UserProfile } from '../types';
import { DEPARTMENT_LEADERBOARD } from '../data/initialData';

interface EcoPointsViewProps {
  currentUser: UserProfile;
}

export const EcoPointsView: React.FC<EcoPointsViewProps> = ({ currentUser }) => {
  const badges = [
    {
      id: 'b1',
      title: 'Green Guardian',
      tier: 'Level 4',
      icon: '🌱',
      desc: 'Over 300 Eco Points accumulated through verified campus reporting.',
      unlocked: true,
    },
    {
      id: 'b2',
      title: 'Zero Waste Advocate',
      tier: 'Level 3',
      icon: '♻️',
      desc: 'Completed 15+ verified recyclable segregation scans.',
      unlocked: true,
    },
    {
      id: 'b3',
      title: 'Lost & Found Hero',
      tier: 'Level 2',
      icon: '🤝',
      desc: 'Restored valuable personal item to rightful owner via secure vault.',
      unlocked: true,
    },
    {
      id: 'b4',
      title: 'Campus Master Protector',
      tier: 'Level 5 (Elite)',
      icon: '👑',
      desc: 'Reached 500+ points and helped achieve 90%+ campus cleanliness rating.',
      unlocked: false,
    },
  ];

  const recentHistory = [
    { id: 'h1', action: 'Verified report: Overflowing bin cleared', points: '+15', time: 'Today, 10:20 AM' },
    { id: 'h2', action: 'Correct segregation scan: PET plastic bottle', points: '+10', time: 'Yesterday, 03:45 PM' },
    { id: 'h3', action: 'Restored lost student access ID card', points: '+30', time: '28 Sep 2026' },
    { id: 'h4', action: 'Hazardous chemical spill alert verified', points: '+25', time: '27 Sep 2026' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white shadow-xl shadow-emerald-700/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-white/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              Student Sustainability & Gamification
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">Student Eco Points & Badges</h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Earn verified institutional recognition, digital credentials, and academic green points for active campus citizenship.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <div className="p-3 rounded-2xl bg-amber-400 text-slate-900 shadow-md">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-200">Current Eco Score</span>
            <div className="text-2xl font-black">{currentUser.ecoPoints} Points</div>
            <span className="text-[10px] text-emerald-200">Rank #4 in CSE Department</span>
          </div>
        </div>
      </div>

      {/* Campus Sustainability Score Metric (Transparent Formula) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Campus Sustainability Score: 91 / 100
            </h3>
            <p className="text-xs text-slate-500">Transparent campus-wide institutional calculation</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs font-mono">
            GRADE: A+ CERTIFIED
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Waste Segregation</span>
            <span className="text-xl font-black text-emerald-600 mt-1 block">94 / 100</span>
            <span className="text-[10px] text-slate-500">Weight: 35%</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Response & SLA</span>
            <span className="text-xl font-black text-blue-600 mt-1 block">89 / 100</span>
            <span className="text-[10px] text-slate-500">Weight: 25%</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Recycling Diversion</span>
            <span className="text-xl font-black text-purple-600 mt-1 block">92 / 100</span>
            <span className="text-[10px] text-slate-500">Weight: 20%</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cleanliness Hygiene</span>
            <span className="text-xl font-black text-teal-600 mt-1 block">89 / 100</span>
            <span className="text-[10px] text-slate-500">Weight: 20%</span>
          </div>
        </div>
      </div>

      {/* Badges & Achievements */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Earned Badges & Milestone Credentials
            </h3>
            <p className="text-xs text-slate-500">Verifiable credentials issued by Dean of Campus Infrastructure</p>
          </div>
          <Sparkles className="w-5 h-5 text-amber-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border text-xs space-y-2 ${
                b.unlocked
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{b.icon}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    b.unlocked
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {b.tier}
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                {b.title}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Department Leaderboard & Point Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Leaderboard */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Inter-Department Eco Leaderboard
              </h3>
              <p className="text-xs text-slate-500">Student and faculty collective clean campus points</p>
            </div>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="space-y-2">
            {DEPARTMENT_LEADERBOARD.map((dept) => (
              <div
                key={dept.code}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-7 h-7 rounded-xl font-bold font-mono text-xs flex items-center justify-center ${
                      dept.rank === 1
                        ? 'bg-amber-400 text-slate-900 shadow-md'
                        : dept.rank === 2
                        ? 'bg-slate-300 text-slate-900'
                        : dept.rank === 3
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    #{dept.rank}
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {dept.department} ({dept.code})
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {dept.reportsSolved} verified contributions
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                    {dept.points} pts
                  </span>
                  <span className="text-[10px] text-slate-400 block">{dept.cleanlinessScore}% Index</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earning Rules & Point Ledger */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Eco Points Policy
            </h3>
            <Leaf className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                Genuine Waste Report (Verified)
              </span>
              <span className="font-mono font-bold text-emerald-600">+10 pts</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                AI Waste Scanner Correct Segregation
              </span>
              <span className="font-mono font-bold text-emerald-600">+15 pts</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                Returned Lost-and-Found Item
              </span>
              <span className="font-mono font-bold text-emerald-600">+30 pts</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                Quarterly Green Campus Drive
              </span>
              <span className="font-mono font-bold text-emerald-600">+25 pts</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Recent Points Ledger
            </span>
            <div className="space-y-1.5">
              {recentHistory.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40"
                >
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300 block">
                      {h.action}
                    </span>
                    <span className="text-[10px] text-slate-400">{h.time}</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-600">{h.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
