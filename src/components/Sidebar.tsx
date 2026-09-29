import React from 'react';
import {
  LayoutDashboard,
  Scan,
  AlertTriangle,
  MapPin,
  Search,
  CheckSquare,
  BarChart3,
  Award,
  MessageSquareText,
  FileText,
  Settings,
  Sparkles,
  ExternalLink,
  LogIn,
  Video,
  Bot,
} from 'lucide-react';
import { Role } from '../types';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: Role;
  language: Language;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  language,
  mobileOpen,
  setMobileOpen,
}) => {
  const t = TRANSLATIONS[language];

  const navigationItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'login', label: t.login || 'Department Login', icon: LogIn, badge: 'SSO' },
    { id: 'surveillance', label: t.cctvMonitoring || 'CCTV & Robot Patrol', icon: Video, badge: 'Live 24/7' },
    { id: 'scanner', label: t.aiScanner, icon: Scan, badge: 'CV AI' },
    { id: 'report', label: t.reportIssue, icon: AlertTriangle },
    { id: 'map', label: t.campusMap, icon: MapPin },
    { id: 'lost-found', label: t.lostAndFound, icon: Search, badge: 'Secure' },
    { id: 'tasks', label: t.myTasks, icon: CheckSquare },
    { id: 'analytics', label: t.analytics, icon: BarChart3 },
    { id: 'eco', label: t.ecoPoints, icon: Award, badge: '+Points' },
    { id: 'assistant', label: t.aiAssistant, icon: MessageSquareText, badge: 'Gemini' },
    { id: 'reports', label: t.reports, icon: FileText },
    { id: 'admin', label: t.settings, icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Desktop & Mobile Responsive Sidebar */}
      <aside
        className={`fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 flex flex-col justify-between ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-3 overflow-y-auto">
          <div className="mb-2 px-3 py-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Campus Navigation
            </span>
          </div>

          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 dark:bg-emerald-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sustainability Widget */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Campus Index</span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">91/100</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Top 5% Clean Green Campus standard in academic zone.
            </p>
            <button
              onClick={() => onSelectTab('landing')}
              className="mt-2 w-full flex items-center justify-center space-x-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline pt-1 border-t border-emerald-500/20"
            >
              <span>Explore Public Portal</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sticky Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-2 px-1">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center text-[10px] ${
            currentTab === 'dashboard' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => onSelectTab('scanner')}
          className={`flex flex-col items-center text-[10px] ${
            currentTab === 'scanner' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Scan className="w-5 h-5 mb-0.5" />
          <span>Scan</span>
        </button>
        <button
          onClick={() => onSelectTab('report')}
          className={`flex flex-col items-center text-[10px] ${
            currentTab === 'report' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <AlertTriangle className="w-5 h-5 mb-0.5" />
          <span>Report</span>
        </button>
        <button
          onClick={() => onSelectTab('lost-found')}
          className={`flex flex-col items-center text-[10px] ${
            currentTab === 'lost-found' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Found</span>
        </button>
        <button
          onClick={() => onSelectTab('admin')}
          className={`flex flex-col items-center text-[10px] ${
            currentTab === 'admin' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span>Admin</span>
        </button>
      </div>
    </>
  );
};
