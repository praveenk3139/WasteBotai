import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Monitor,
  Globe,
  PlayCircle,
  Menu,
  X,
  Check,
  UserCheck,
  Shield,
  Trash2,
  Sparkles,
  LogIn,
  LogOut,
  Video,
} from 'lucide-react';
import { Role, UserProfile, NotificationItem } from '../types';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { DEMO_USERS } from '../data/initialData';
import { googleSignIn, googleSignOut } from '../services/firebaseAuth';
import { User } from 'firebase/auth';

interface NavbarProps {
  currentUser: UserProfile;
  onSelectRole: (role: Role) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onOpenDemoTour: () => void;
  onToggleMobileSidebar: () => void;
  googleUser: User | null;
  setGoogleUser: (user: User | null) => void;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSelectRole,
  theme,
  setTheme,
  language,
  setLanguage,
  notifications,
  onOpenDemoTour,
  onToggleMobileSidebar,
  googleUser,
  setGoogleUser,
  onNavigate,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const t = TRANSLATIONS[language];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
      }
    } catch (e) {
      console.error('Google Sign-in failed', e);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await googleSignOut();
    setGoogleUser(null);
  };

  const roleLabels: Record<Role, string> = {
    student: 'Student',
    staff: 'Faculty / Staff',
    hod: 'HOD / Department Head',
    cleaning: 'Clearing / Cleaning Team',
    maintenance: 'Maintenance Team',
    security: 'Campus Security',
    lost_found: 'Lost & Found Officer',
    admin: 'Dean / Administrator',
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Mobile Menu Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleMobileSidebar}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 md:hidden focus:outline-hidden"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-green-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                {/* Robot Face + Recycling icon */}
                <div className="relative flex items-center justify-center">
                  <span className="text-lg">🤖</span>
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-xs">
                    <Trash2 className="w-3 h-3 text-emerald-600" />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-blue-400">
                    WasteBot AI
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 rounded-md">
                    Campus Ops
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  Detect • Report • Assign • Resolve • Verify • Recover
                </p>
              </div>
            </div>
          </div>

          {/* Right Header Action Items */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* CCTV & Autonomous Robot Live Feed Button */}
            <button
              onClick={() => onNavigate('surveillance')}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600/90 hover:bg-purple-600 text-white text-xs font-semibold shadow-md shadow-purple-500/20 active:scale-95 transition-all"
              title="Live CCTV Surveillance & Robot Patrol"
            >
              <Video className="w-3.5 h-3.5" />
              <span>📹 CCTV & Patrol</span>
            </button>

            {/* Interactive Demo Mode Tour Button */}
            <button
              onClick={onOpenDemoTour}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>🎬 {t.demoTour}</span>
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1 text-xs font-medium"
                title="Select Language"
              >
                <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline font-mono uppercase">{language}</span>
              </button>
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs">
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      language === 'en' ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('ta');
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      language === 'ta' ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''
                    }`}
                  >
                    <span>தமிழ் (Tamil)</span>
                    {language === 'ta' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('hi');
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      language === 'hi' ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''
                    }`}
                  >
                    <span>हिन्दी (Hindi)</span>
                    {language === 'hi' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <div className="relative flex items-center">
              <button
                onClick={() => {
                  const nextTheme = theme === 'dark' ? 'light' : 'dark';
                  setTheme(nextTheme);
                }}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700"
                title={`Current: ${theme.toUpperCase()} mode. Click to switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-600" />
                )}
                <span className="text-[11px] font-bold capitalize hidden sm:inline text-slate-700 dark:text-slate-200">
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </span>
              </button>
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      Notifications ({unreadCount} unread)
                    </span>
                    <button
                      onClick={() => {
                        notifications.forEach((n) => (n.read = true));
                        setShowNotifMenu(false);
                      }}
                      className="text-[11px] text-emerald-600 hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 mt-1">
                    {notifications.length === 0 ? (
                      <p className="text-center py-6 text-xs text-slate-400">No new notifications</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            notif.read = true;
                            if (notif.link) onNavigate(notif.link);
                            setShowNotifMenu(false);
                          }}
                          className={`p-2.5 text-xs rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                            !notif.read ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100">
                            <span>{notif.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{notif.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Google Workspace Sign-In Button */}
            {googleUser ? (
              <div className="relative group">
                <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-medium text-blue-700 dark:text-blue-300 hidden md:inline truncate max-w-[120px]">
                    {googleUser.email}
                  </span>
                  <button
                    onClick={handleGoogleLogout}
                    className="text-[10px] text-red-500 hover:underline font-semibold"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={isSigningIn}
                className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:shadow-sm active:scale-95 transition-all"
                title="Sign in with Google to enable official Gmail alerts"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Gmail Connect</span>
              </button>
            )}

            {/* Direct Department Login Button */}
            <button
              onClick={() => onNavigate('login')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              title="Open Departmental Login Portal"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Department Login</span>
            </button>

            {/* Quick Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all border border-slate-200 dark:border-slate-700 text-xs"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black flex items-center justify-center text-[10px] shadow-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    {currentUser.name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 capitalize">
                    {currentUser.role.replace('_', ' ')}
                  </p>
                </div>
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Role (8 Demo Personas)
                    </p>
                  </div>
                  <div className="mt-1 space-y-1 max-h-72 overflow-y-auto">
                    {(Object.keys(DEMO_USERS) as Role[]).map((r) => {
                      const user = DEMO_USERS[r];
                      const isCurrent = currentUser.role === r;
                      return (
                        <button
                          key={r}
                          onClick={() => {
                            onSelectRole(r);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors ${
                            isCurrent
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 font-bold'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center text-[10px] shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 truncate">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{user.name}</span>
                              <span className="text-[10px] text-slate-400 uppercase">{r}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {roleLabels[r]}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onNavigate('login');
                      }}
                      className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{t.login || 'Login Page / Register'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onNavigate('login');
                      }}
                      className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.logout || 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
