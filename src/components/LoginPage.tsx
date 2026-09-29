import React, { useState } from 'react';
import {
  Shield,
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Wrench,
  KeyRound,
  Zap,
  Building,
  Building2,
  Award,
  Globe,
  Sun,
  Moon,
  Trash2,
  AlertCircle,
  HelpCircle,
  X,
  ExternalLink,
  Laptop,
  Compass,
  Cpu,
  Microscope,
  ShieldAlert,
  Flame,
  Search,
  Bot,
  Video,
} from 'lucide-react';
import { Role, UserProfile } from '../types';
import { DEMO_USERS } from '../data/initialData';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { googleSignIn } from '../services/firebaseAuth';
import { User as FirebaseUser } from 'firebase/auth';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigate: (tab: string) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  language: Language;
  setLanguage: (l: Language) => void;
  googleUser: FirebaseUser | null;
  setGoogleUser: (user: FirebaseUser | null) => void;
}

type AuthTab = 'departments' | 'credentials' | 'register';

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigate,
  theme,
  setTheme,
  language,
  setLanguage,
  googleUser,
  setGoogleUser,
}) => {
  const [authTab, setAuthTab] = useState<AuthTab>('credentials');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Credentials login state (Username + Password + Role)
  const [username, setUsername] = useState('praveen');
  const [password, setPassword] = useState('campus@2026');
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<Role>('student');
  const [regDept, setRegDept] = useState('Computer Science & Engineering');
  const [regCollegeId, setRegCollegeId] = useState('');
  const [regYear, setRegYear] = useState('1st Year B.Tech');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  const t = TRANSLATIONS[language];

  // Defined Campus Departments with their associated personas & metadata
  const DEPARTMENTS = [
    {
      id: 'cse',
      name: 'Computer Science & Engineering (IT Tower)',
      short: 'CSE & IT',
      icon: Laptop,
      color: 'from-blue-600 to-indigo-600',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      description: 'AI Waste Vision modeling, mobile portals, and student technology initiatives.',
      users: [
        {
          key: 'student',
          user: DEMO_USERS.student,
          roleLabel: 'Student Representative',
          privileges: 'AI Scanner • Mobile Issue Reporting • Eco-Points Redemption',
        },
      ],
    },
    {
      id: 'mech',
      name: 'Mechanical & Robotics Engineering (MRC)',
      short: 'Mechanical & Robotics',
      icon: Cpu,
      color: 'from-amber-600 to-orange-600',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      description: 'Departmental command center, autonomous patrol robotics, and SLA dispatch.',
      users: [
        {
          key: 'hod',
          user: DEMO_USERS.hod,
          roleLabel: 'Head of Department (HOD)',
          privileges: 'Command Center • SLA Dispatch • Gmail Notifications • CCTV Live Grid',
        },
      ],
    },
    {
      id: 'civil',
      name: 'Civil & Environmental Engineering',
      short: 'Civil & Environmental',
      icon: Compass,
      color: 'from-emerald-600 to-teal-600',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      description: 'Campus sustainability indices, waste audit verification, and environmental policy.',
      users: [
        {
          key: 'staff',
          user: DEMO_USERS.staff,
          roleLabel: 'Faculty Sustainability Lead',
          privileges: 'Audit Verification • Environmental Audits • Infrastructure Reports',
        },
      ],
    },
    {
      id: 'facility',
      name: 'Campus Operations & Housekeeping Services',
      short: 'Housekeeping & Sanitation',
      icon: Trash2,
      color: 'from-teal-600 to-cyan-600',
      badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
      description: 'On-ground rapid incident resolution, bin emptying, and sanitization verification.',
      users: [
        {
          key: 'cleaning',
          user: DEMO_USERS.cleaning,
          roleLabel: 'Housekeeping Lead Officer',
          privileges: 'Task Board • Upload Before/After Photographic Proof • Real-Time Route',
        },
      ],
    },
    {
      id: 'maint',
      name: 'Electrical & Civil Maintenance Engineering',
      short: 'Maintenance & Repairs',
      icon: Wrench,
      color: 'from-orange-600 to-red-600',
      badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
      description: 'Pipe leak repairs, electrical e-waste triage, and heavy campus infrastructure.',
      users: [
        {
          key: 'maintenance',
          user: DEMO_USERS.maintenance,
          roleLabel: 'Senior Maintenance Engineer',
          privileges: 'Engineering Work Orders • E-Waste Safekeeping • Plumbing Dispatch',
        },
      ],
    },
    {
      id: 'security',
      name: 'Campus Safety, Security & Vigilance Unit',
      short: 'Safety & Vigilance',
      icon: ShieldAlert,
      color: 'from-rose-600 to-pink-600',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
      description: '24/7 CCTV surveillance monitoring, hazardous material cordoning, and perimeter security.',
      users: [
        {
          key: 'security',
          user: DEMO_USERS.security,
          roleLabel: 'Campus Security Officer',
          privileges: 'Live CCTV Matrix • Continuous Robot Patrol • Hazmat Emergency Cordon',
        },
      ],
    },
    {
      id: 'lostfound',
      name: 'Student Affairs & Lost & Found Registrar Desk',
      short: 'Lost & Found Vault',
      icon: Search,
      color: 'from-purple-600 to-indigo-600',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
      description: 'Secure lost valuables intake, AI visual similarity matching, and counter release.',
      users: [
        {
          key: 'lost_found',
          user: DEMO_USERS.lost_found,
          roleLabel: 'Vault Custody Officer',
          privileges: 'Locker Vault Log • AI Match Engine • Private Proof Verification & Claim Approval',
        },
      ],
    },
    {
      id: 'admin',
      name: 'Executive Dean & Campus Infrastructure Administration',
      short: 'Dean Secretariat',
      icon: Building2,
      color: 'from-slate-700 to-slate-900',
      badgeColor: 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
      description: 'Full institutional governance, AI model accuracy registry, and overall campus metrics.',
      users: [
        {
          key: 'admin',
          user: DEMO_USERS.admin,
          roleLabel: 'Executive Dean of Infrastructure',
          privileges: 'Executive Command Center • AI Model Registry • Full Audit Trail • Dataset Reset',
        },
      ],
    },
  ];

  // Quick Persona selection
  const handlePersonaLogin = (role: Role) => {
    setIsLoading(true);
    setTimeout(() => {
      const selected = DEMO_USERS[role];
      if (selected) {
        onLoginSuccess(selected);
      }
      setIsLoading(false);
    }, 350);
  };

  // Standard Username / Password / Role login
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!username.trim()) {
      setLoginError('Please enter your Username, Roll Number, or Institutional Email.');
      return;
    }
    if (!password.trim()) {
      setLoginError('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const q = username.trim().toLowerCase();

      // Find matching demo user by username, email, name, or roll ID
      let matched = Object.values(DEMO_USERS).find((u) => {
        const uEmail = u.email.toLowerCase();
        const uName = u.name.toLowerCase();
        const uId = u.collegeId.toLowerCase();
        const firstName = uName.split(' ')[0];
        const isMatch =
          uEmail === q ||
          uEmail.startsWith(q) ||
          uName === q ||
          firstName === q ||
          uId === q;
        return isMatch;
      });

      if (matched) {
        // Log in with the selected role or matched role
        onLoginSuccess({
          ...matched,
          role: selectedRole,
        });
      } else {
        // Dynamic user creation for custom campus username & selected role
        const cleanName = username.includes('@')
          ? username.split('@')[0].replace('.', ' ')
          : username.replace('.', ' ');
        const formattedName = cleanName.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

        const deptName =
          selectedRole === 'student'
            ? 'Computer Science & Engineering'
            : selectedRole === 'staff'
            ? 'Civil & Environmental Engineering'
            : selectedRole === 'hod'
            ? 'Mechanical & Robotics Engineering'
            : selectedRole === 'cleaning'
            ? 'Campus Housekeeping Services'
            : selectedRole === 'maintenance'
            ? 'Electrical & Civil Maintenance'
            : selectedRole === 'security'
            ? 'Campus Safety & Vigilance'
            : selectedRole === 'lost_found'
            ? 'Student Affairs & Lost-and-Found Desk'
            : 'Executive Dean Secretariat';

        const generatedUser: UserProfile = {
          id: `usr_${Date.now().toString(36)}`,
          name: formattedName,
          email: username.includes('@') ? username.trim() : `${q.replace(/\s+/g, '')}@campus.edu`,
          role: selectedRole,
          department: deptName,
          collegeId: `CAMPUS_${Math.floor(1000 + Math.random() * 9000)}`,
          ecoPoints: selectedRole === 'student' ? 345 : 520,
          reportsCount: 1,
          resolvedCount: 1,
        };
        onLoginSuccess(generatedUser);
      }
      setIsLoading(false);
    }, 450);
  };

  // Fast pre-fill credential pills by role
  const setQuickUserRole = (demoRole: Role, demoKey: keyof typeof DEMO_USERS) => {
    const user = DEMO_USERS[demoKey];
    if (user) {
      setUsername(user.name.split(' ')[0].toLowerCase());
      setPassword('campus@2026');
      setSelectedRole(demoRole);
      setLoginError(null);
    }
  };

  // Google Workspace Sign-In
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setLoginError(null);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setGoogleUser(res.user);
        const googleUserProfile: UserProfile = {
          id: `usr_g_${res.user.uid.slice(0, 8)}`,
          name: res.user.displayName || 'Campus Member',
          email: res.user.email || 'user@campus.edu',
          role: selectedRole,
          department: 'General Campus Community',
          collegeId: 'GSUITE_AUTH',
          ecoPoints: 150,
          reportsCount: 1,
          resolvedCount: 1,
        };
        onLoginSuccess(googleUserProfile);
      }
    } catch (err: any) {
      console.error('Google Sign-in failed', err);
      setLoginError(err.message || 'Google authentication was cancelled or failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // New Registration Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regCollegeId || !regPassword) {
      setLoginError('Please fill in all mandatory registration fields.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const newUser: UserProfile = {
        id: `usr_reg_${Date.now().toString(36)}`,
        name: regName,
        email: regEmail,
        role: regRole,
        department: regDept,
        collegeId: regCollegeId,
        year: regRole === 'student' ? regYear : undefined,
        ecoPoints: 50, // Welcome bonus
        reportsCount: 0,
        resolvedCount: 0,
      };

      setRegSuccess(true);
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 1000);
      setIsLoading(false);
    }, 600);
  };

  // Filtered departments based on search and selected department
  const filteredDepartments = DEPARTMENTS.filter((dept) => {
    if (selectedDeptId !== 'all' && dept.id !== selectedDeptId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDept = dept.name.toLowerCase().includes(q) || dept.description.toLowerCase().includes(q);
      const matchUser = dept.users.some(
        (u) =>
          u.user.name.toLowerCase().includes(q) ||
          u.user.email.toLowerCase().includes(q) ||
          u.roleLabel.toLowerCase().includes(q)
      );
      return matchDept || matchUser;
    }
    return true;
  });

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-center items-center py-6 px-3 sm:px-4">
      {/* Ambient Lighting Gradients */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all">
        {/* Header Ribbon & Utilities */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <span className="text-base">🤖</span>
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-blue-400">
                WasteBot AI
              </span>
              <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                Departmental SSO Gateway
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            {/* Direct Surveillance Link */}
            <button
              onClick={() => onNavigate('surveillance')}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-semibold hover:bg-purple-200 transition-colors"
              title="Open CCTV & Autonomous Robot Surveillance"
            >
              <Video className="w-3.5 h-3.5" />
              <span>CCTV & Patrol</span>
            </button>

            {/* Language Switch */}
            <div className="flex items-center space-x-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-emerald-500 text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                  language === 'ta'
                    ? 'bg-emerald-500 text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                  language === 'hi'
                    ? 'bg-emerald-500 text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Theme Switch */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="px-6 sm:px-10 pt-6 pb-2 text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <Building className="w-3.5 h-3.5 text-emerald-500" />
            <span>Campus Departmental Directory & Access Portal</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Institutional Department Login
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Select your academic department, operations division, or faculty unit to access role-tailored incident response dashboards, AI camera surveillance, and task routing.
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-center pt-3">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80">
              <button
                onClick={() => {
                  setAuthTab('credentials');
                  setLoginError(null);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  authTab === 'credentials'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>User Login (Username • Password • Role)</span>
              </button>

              <button
                onClick={() => {
                  setAuthTab('departments');
                  setLoginError(null);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  authTab === 'departments'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Department Directory (8 Divisions)</span>
              </button>

              <button
                onClick={() => {
                  setAuthTab('register');
                  setLoginError(null);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  authTab === 'register'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Register Member</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {loginError && (
          <div className="mx-6 sm:mx-10 mt-2 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center space-x-2.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        {/* TAB 1: SEPARATE USERS BY DEPARTMENT */}
        {authTab === 'departments' && (
          <div className="p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Department Quick Filter Tabs & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                <button
                  onClick={() => setSelectedDeptId('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedDeptId === 'all'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  All Departments (8)
                </button>
                {DEPARTMENTS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDeptId(d.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedDeptId === d.id
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {d.short}
                  </button>
                ))}
              </div>

              {/* Department Search */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search department, staff, role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Department Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredDepartments.map((dept) => {
                const IconComponent = dept.icon;
                return (
                  <div
                    key={dept.id}
                    className="p-5 rounded-3xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-700/80 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all space-y-3.5"
                  >
                    {/* Department Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${dept.color} flex items-center justify-center text-white shadow-md`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                            {dept.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {dept.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Associated Authority Personas in this Department */}
                    <div className="space-y-2">
                      {dept.users.map(({ key, user, roleLabel, privileges }) => (
                        <div
                          key={key}
                          onClick={() => handlePersonaLogin(key as Role)}
                          className="group p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/80 hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer transition-all flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black text-base flex items-center justify-center shadow-md ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-[8px] text-white">
                                ✓
                              </span>
                            </div>

                            <div className="text-left">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                  {user.name}
                                </span>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold uppercase">
                                  {user.role}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                {roleLabel} • ID: <span className="font-mono">{user.collegeId}</span>
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                                🔑 {privileges}
                              </p>
                            </div>
                          </div>

                          <button className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all flex items-center space-x-1 shrink-0">
                            <span>Access</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Google Fast SSO Strip */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 gap-3">
              <div className="flex items-center space-x-3 text-xs text-left">
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Institutional Google Workspace / Gmail SSO
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Authenticate via institutional credentials to trigger live automated incident dispatch & HOD alerts.
                  </p>
                </div>
              </div>

              <button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 shadow-xs active:scale-95 transition-all shrink-0 flex items-center justify-center space-x-2"
              >
                <span>Authorize with Google</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: User Login (Username, Password, Role) */}
        {authTab === 'credentials' && (
          <div className="p-6 sm:p-10 max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Quick Demo Pre-fill Pills */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                ⚡ Quick 1-Click Persona Pre-fills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuickUserRole('student', 'student')}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 shadow-xs transition-all flex items-center space-x-1"
                >
                  <span>🎓</span>
                  <span>Student (Praveen)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickUserRole('staff', 'staff')}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 shadow-xs transition-all flex items-center space-x-1"
                >
                  <span>👩‍🏫</span>
                  <span>Staff (Prof. Pavithra.V)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickUserRole('hod', 'hod')}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 shadow-xs transition-all flex items-center space-x-1"
                >
                  <span>🏛️</span>
                  <span>HOD (Dr. Sekar)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickUserRole('cleaning', 'cleaning')}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 shadow-xs transition-all flex items-center space-x-1"
                >
                  <span>🧹</span>
                  <span>Housekeeping (Murugan)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickUserRole('security', 'security')}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 shadow-xs transition-all flex items-center space-x-1"
                >
                  <span>🛡️</span>
                  <span>Security (Vikram)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickUserRole('admin', 'admin')}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 shadow-xs transition-all flex items-center space-x-1"
                >
                  <span>👑</span>
                  <span>Dean (Dr. Ananya)</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              {/* Username field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Username / Roll Number / Campus Email</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    e.g. praveen, 22CS1049, sekar
                  </span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username, roll no, or institutional email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Select Campus Role</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Active: <strong className="uppercase text-emerald-600 dark:text-emerald-400">{selectedRole}</strong>
                  </span>
                </label>

                {/* Role Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { role: 'student' as Role, label: 'Student', icon: GraduationCap, color: 'text-blue-500' },
                    { role: 'staff' as Role, label: 'Staff / Faculty', icon: Briefcase, color: 'text-emerald-500' },
                    { role: 'hod' as Role, label: 'HOD (Head)', icon: Building2, color: 'text-amber-500' },
                    { role: 'cleaning' as Role, label: 'Housekeeping', icon: Trash2, color: 'text-teal-500' },
                    { role: 'maintenance' as Role, label: 'Maintenance', icon: Wrench, color: 'text-orange-500' },
                    { role: 'security' as Role, label: 'Security', icon: ShieldAlert, color: 'text-rose-500' },
                    { role: 'lost_found' as Role, label: 'Lost & Found', icon: Search, color: 'text-purple-500' },
                    { role: 'admin' as Role, label: 'Dean / Admin', icon: Shield, color: 'text-slate-500' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedRole === item.role;
                    return (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setSelectedRole(item.role)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center space-x-2 ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs ring-1 ring-emerald-500'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Trust and remember this workstation</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In as {selectedRole.toUpperCase().replace('_', ' ')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Google Workspace Sign-In option */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 gap-3">
              <div className="flex items-center space-x-3 text-xs text-left">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Google Workspace SSO
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Instant auth with institutional @campus.edu Google account
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 shadow-xs active:scale-95 transition-all shrink-0 flex items-center justify-center space-x-1.5"
              >
                <span>Authorize Google</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: New Member Registration */}
        {authTab === 'register' && (
          <div className="p-6 sm:p-10 max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-blue-500/15 border border-emerald-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 text-xs">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-lg font-bold shrink-0">
                  🎁
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    Join Your Academic Department on WasteBot
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Receive <strong>+50 Eco-Points</strong> immediately upon account activation.
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                +50 PTS
              </span>
            </div>

            {regSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Account created successfully! Logging you into campus terminal...</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Campus Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="aarav@campus.edu"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Campus Role Authority
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as Role)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="student">Student (Undergraduate / Postgraduate)</option>
                    <option value="staff">Faculty / Research Scholar</option>
                    <option value="hod">Head of Department (HOD)</option>
                    <option value="cleaning">Housekeeping / Clearing Staff</option>
                    <option value="maintenance">Maintenance / Engineering Crew</option>
                    <option value="security">Campus Security & Vigilance</option>
                    <option value="lost_found">Lost & Found Officer</option>
                    <option value="admin">Dean / Campus Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Roll Number / Employee ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 23CS1088 or FAC_MECH_04"
                    value={regCollegeId}
                    onChange={(e) => setRegCollegeId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Assigned Department
                  </label>
                  <select
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Mechanical & Robotics Engineering">Mechanical & Robotics Engineering</option>
                    <option value="Civil & Environmental Engineering">Civil & Environmental Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Science & Biotech Laboratories">Science & Biotech Laboratories</option>
                    <option value="Campus Housekeeping Services">Campus Housekeeping Services</option>
                    <option value="Electrical & Civil Maintenance">Electrical & Civil Maintenance</option>
                    <option value="Campus Safety & Vigilance">Campus Safety & Vigilance</option>
                  </select>
                </div>

                {regRole === 'student' ? (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Academic Year
                    </label>
                    <select
                      value={regYear}
                      onChange={(e) => setRegYear(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="1st Year B.Tech">1st Year B.Tech</option>
                      <option value="2nd Year B.Tech">2nd Year B.Tech</option>
                      <option value="3rd Year B.Tech">3rd Year B.Tech</option>
                      <option value="4th Year B.Tech">4th Year B.Tech</option>
                      <option value="Postgraduate / M.Tech">Postgraduate / M.Tech</option>
                      <option value="Ph.D. Scholar">Ph.D. Scholar</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Access Authorization
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Authorized Institutional Staff"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Create Master Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <span>Register Department Account & Claim 50 Pts</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Footer Security Badges & Public Access Link */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Departmental Tier-4 Access</span>
            </span>
            <span className="flex items-center space-x-1">
              <Bot className="w-3.5 h-3.5 text-emerald-500" />
              <span>Autonomous Patrol Link</span>
            </span>
            <span className="flex items-center space-x-1">
              <Video className="w-3.5 h-3.5 text-purple-500" />
              <span>CCTV Grid Telemetry</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('landing')}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center space-x-1"
            >
              <span>Explore Public Portal</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Interactive Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold">
                <KeyRound className="w-5 h-5 text-emerald-500" />
                <span>Reset Department Credentials</span>
              </div>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSuccess(false);
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 space-y-2">
                <p className="font-bold">✓ Reset instructions dispatched!</p>
                <p>
                  A temporary password verification token has been routed to <strong>{forgotEmail}</strong>. Check your departmental campus inbox.
                </p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSuccess(false);
                  }}
                  className="mt-2 w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (forgotEmail) setForgotSuccess(true);
                }}
                className="space-y-3"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your registered department campus email or employee/student ID to receive a secure password recovery link.
                </p>
                <input
                  type="email"
                  required
                  placeholder="name@campus.edu"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
                  >
                    Send Recovery Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
