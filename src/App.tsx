/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { StudentDashboard } from './components/StudentDashboard';
import { HODCommandCenter } from './components/HODCommandCenter';
import { AIScannerView } from './components/AIScannerView';
import { ReportIssueView } from './components/ReportIssueView';
import { LostAndFoundView } from './components/LostAndFoundView';
import { TaskManagementView } from './components/TaskManagementView';
import { CampusMapView } from './components/CampusMapView';
import { AnalyticsView } from './components/AnalyticsView';
import { EcoPointsView } from './components/EcoPointsView';
import { AuditLogView } from './components/AuditLogView';
import { AdminCenterView } from './components/AdminCenterView';
import { LoginPage } from './components/LoginPage';
import { CCTVRobotMonitoringView } from './components/CCTVRobotMonitoringView';
import { AIAssistantModal } from './components/AIAssistantModal';
import { DemoModeModal } from './components/DemoModeModal';
import { GmailConfirmationModal } from './components/GmailConfirmationModal';

import {
  Role,
  UserProfile,
  CampusReport,
  LostItem,
  FoundItem,
  LostFoundMatch,
  ClaimRequest,
  NotificationItem,
  AuditLogItem,
  WasteScanResult,
} from './types';
import { Language } from './utils/i18n';
import {
  DEMO_USERS,
  INITIAL_REPORTS,
  INITIAL_LOST_ITEMS,
  INITIAL_FOUND_ITEMS,
  INITIAL_MATCHES,
  INITIAL_CLAIMS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from './data/initialData';
import { initAuth } from './services/firebaseAuth';
import { User } from 'firebase/auth';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('wastebot_theme') as 'light' | 'dark' | 'system') || 'light';
  });

  // Multilingual state
  const [language, setLanguage] = useState<Language>('en');

  // Active view navigation (starts on Department Login page)
  const [currentTab, setCurrentTab] = useState<string>('login');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Active User Persona (default: Student)
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS.student);

  // Data Collections
  const [reports, setReports] = useState<CampusReport[]>(INITIAL_REPORTS);
  const [lostItems, setLostItems] = useState<LostItem[]>(INITIAL_LOST_ITEMS);
  const [foundItems, setFoundItems] = useState<FoundItem[]>(INITIAL_FOUND_ITEMS);
  const [matches, setMatches] = useState<LostFoundMatch[]>(INITIAL_MATCHES);
  const [claims, setClaims] = useState<ClaimRequest[]>(INITIAL_CLAIMS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Scanner to Report bridge
  const [initialScanForReport, setInitialScanForReport] = useState<WasteScanResult | null>(null);

  // Google Auth User
  const [googleUser, setGoogleUser] = useState<User | null>(null);

  // Modals
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [demoTourOpen, setDemoTourOpen] = useState(false);
  const [gmailModalData, setGmailModalData] = useState<{
    isOpen: boolean;
    recipient: string;
    subject: string;
    body: string;
  }>({
    isOpen: false,
    recipient: '',
    subject: '',
    body: '',
  });

  // Apply theme class to document
  useEffect(() => {
    localStorage.setItem('wastebot_theme', theme);
    const root = document.documentElement;
    const body = document.body;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
      body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => setGoogleUser(user),
      () => setGoogleUser(null)
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Fetch initial data from server API
  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setReports(data);
      })
      .catch(() => {});

    fetch('/api/lost-items')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setLostItems(data);
      })
      .catch(() => {});

    fetch('/api/found-items')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setFoundItems(data);
      })
      .catch(() => {});

    fetch('/api/lost-found/matches')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setMatches(data);
      })
      .catch(() => {});

    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setNotifications(data);
      })
      .catch(() => {});

    fetch('/api/audit-logs')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setAuditLogs(data);
      })
      .catch(() => {});
  }, []);

  // Persona Switcher
  const handleSelectRole = (role: Role) => {
    if (DEMO_USERS[role]) {
      setCurrentUser(DEMO_USERS[role]);
    }
  };

  // Full Login / Registration Success Handler
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    // Add welcome notification
    const welcomeNotif: NotificationItem = {
      id: `notif_auth_${Date.now()}`,
      title: `Welcome, ${user.name.split(' ')[0]}! 👋`,
      message: `Signed in as ${user.role.toUpperCase()} (${user.department}). Ready for campus operations.`,
      type: 'eco',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [welcomeNotif, ...prev]);

    // Add audit log record
    const authLog: AuditLogItem = {
      id: `log_auth_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: user.name,
      role: user.role,
      action: 'Institutional Login / Auth',
      incidentId: 'AUTH-SESSION',
      details: `User authenticated via Campus SSO credentials into ${user.department}.`,
    };
    setAuditLogs((prev) => [authLog, ...prev]);

    // Redirect to appropriate operational dashboard
    setCurrentTab('dashboard');
  };

  // Bridge from Scanner into Report Form
  const handleReportIncidentFromScan = (scan: WasteScanResult) => {
    setInitialScanForReport(scan);
    setCurrentTab('report');
  };

  // Submit a new campus report
  const handleSubmitReport = async (reportData: Partial<CampusReport>) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });
      if (res.ok) {
        const created: CampusReport = await res.json();
        setReports((prev) => [created, ...prev]);

        // Award points to student
        if (currentUser.role === 'student') {
          setCurrentUser((prev) => ({
            ...prev,
            ecoPoints: prev.ecoPoints + 10,
            reportsCount: prev.reportsCount + 1,
          }));
        }

        // Refresh audit logs
        const auditRes = await fetch('/api/audit-logs');
        if (auditRes.ok) setAuditLogs(await auditRes.json());
      }
    } catch (e) {
      console.error('Failed to submit report', e);
    }
  };

  // Update status
  const handleUpdateStatus = async (reportId: string, status: any, notes?: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          actorName: currentUser.name,
          notes,
        }),
      });
      if (res.ok) {
        const updated: CampusReport = await res.json();
        setReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)));
        const auditRes = await fetch('/api/audit-logs');
        if (auditRes.ok) setAuditLogs(await auditRes.json());
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  // Before/After verification signoff
  const handleVerifyReport = async (reportId: string, afterPhoto: string, notes: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          afterPhoto,
          verificationNotes: notes,
          verifiedBy: currentUser.name,
        }),
      });
      if (res.ok) {
        const verified: CampusReport = await res.json();
        setReports((prev) => prev.map((r) => (r.id === reportId ? verified : r)));
        const auditRes = await fetch('/api/audit-logs');
        if (auditRes.ok) setAuditLogs(await auditRes.json());
      }
    } catch (e) {
      console.error('Verification failed', e);
    }
  };

  // Lost Item submit
  const handleReportLost = async (itemData: Partial<LostItem>) => {
    try {
      const res = await fetch('/api/lost-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (res.ok) {
        const created: LostItem = await res.json();
        setLostItems((prev) => [created, ...prev]);

        // Refresh matches
        const matchesRes = await fetch('/api/lost-found/matches');
        if (matchesRes.ok) setMatches(await matchesRes.json());
      }
    } catch (e) {
      console.error('Failed to log lost item', e);
    }
  };

  // Found Item submit
  const handleReportFound = async (itemData: Partial<FoundItem>) => {
    try {
      const res = await fetch('/api/found-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (res.ok) {
        const created: FoundItem = await res.json();
        setFoundItems((prev) => [created, ...prev]);

        // Refresh matches
        const matchesRes = await fetch('/api/lost-found/matches');
        if (matchesRes.ok) setMatches(await matchesRes.json());
      }
    } catch (e) {
      console.error('Failed to log found item', e);
    }
  };

  // Submit Claim
  const handleSubmitClaim = async (claimData: Partial<ClaimRequest>) => {
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimData),
      });
      if (res.ok) {
        const created: ClaimRequest = await res.json();
        setClaims((prev) => [created, ...prev]);
      }
    } catch (e) {
      console.error('Failed to submit claim', e);
    }
  };

  // Resolve Claim
  const handleResolveClaim = async (claimId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/claims/${claimId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          officerName: currentUser.name,
          notes: action === 'approve' ? 'Physical markings and inscription verified against vault records.' : 'Proof did not match physical item attributes.',
        }),
      });
      if (res.ok) {
        const updated: ClaimRequest = await res.json();
        setClaims((prev) => prev.map((c) => (c.id === claimId ? updated : c)));

        // Reload items
        const lRes = await fetch('/api/lost-items');
        if (lRes.ok) setLostItems(await lRes.json());
        const fRes = await fetch('/api/found-items');
        if (fRes.ok) setFoundItems(await fRes.json());
      }
    } catch (e) {
      console.error('Failed to resolve claim', e);
    }
  };

  // Reset Demo Dataset
  const handleResetDemoData = async () => {
    try {
      const res = await fetch('/api/demo-reset', { method: 'POST' });
      if (res.ok) {
        setReports(JSON.parse(JSON.stringify(INITIAL_REPORTS)));
        setLostItems(JSON.parse(JSON.stringify(INITIAL_LOST_ITEMS)));
        setFoundItems(JSON.parse(JSON.stringify(INITIAL_FOUND_ITEMS)));
        setMatches(JSON.parse(JSON.stringify(INITIAL_MATCHES)));
        setClaims(JSON.parse(JSON.stringify(INITIAL_CLAIMS)));
        setNotifications(JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)));
        setAuditLogs(JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS)));
      }
    } catch (e) {
      console.error('Reset failed', e);
    }
  };

  // Trigger Gmail modal
  const handleOpenGmailModal = (recipient: string, subject: string, body: string) => {
    setGmailModalData({
      isOpen: true,
      recipient,
      subject,
      body,
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B1120] text-[#172033] dark:text-[#F8FAFC] flex flex-col font-sans transition-colors duration-200">
      {/* Top Header Navbar */}
      <Navbar
        currentUser={currentUser}
        onSelectRole={handleSelectRole}
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
        notifications={notifications}
        onOpenNotifications={() => {}}
        onOpenDemoTour={() => setDemoTourOpen(true)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        googleUser={googleUser}
        setGoogleUser={setGoogleUser}
        onNavigate={(tab) => setCurrentTab(tab)}
      />

      {/* Main Body Area with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar + Mobile Bottom Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            if (tab === 'assistant') {
              setAssistantOpen(true);
            }
          }}
          userRole={currentUser.role}
          language={language}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-20 md:pb-8 overflow-y-auto">
          {currentTab === 'login' && (
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onNavigate={setCurrentTab}
              theme={theme}
              setTheme={setTheme}
              language={language}
              setLanguage={setLanguage}
              googleUser={googleUser}
              setGoogleUser={setGoogleUser}
            />
          )}

          {currentTab === 'surveillance' && (
            <CCTVRobotMonitoringView
              currentUser={currentUser}
              reports={reports}
              onSubmitReport={handleSubmitReport}
              onNavigate={setCurrentTab}
              language={language}
            />
          )}

          {currentTab === 'landing' && (
            <LandingPage
              onGetStarted={() => setCurrentTab('dashboard')}
              onOpenScanner={() => setCurrentTab('scanner')}
              onOpenDemoTour={() => setDemoTourOpen(true)}
              onOpenLogin={() => setCurrentTab('login')}
            />
          )}

          {currentTab === 'dashboard' && (
            <>
              {currentUser.role === 'hod' || currentUser.role === 'admin' ? (
                <HODCommandCenter
                  currentUser={currentUser}
                  reports={reports}
                  lostItems={lostItems}
                  foundItems={foundItems}
                  matches={matches}
                  onOpenGmailModal={handleOpenGmailModal}
                  onNavigate={setCurrentTab}
                />
              ) : currentUser.role === 'cleaning' || currentUser.role === 'maintenance' ? (
                <TaskManagementView
                  currentUser={currentUser}
                  reports={reports}
                  onUpdateStatus={handleUpdateStatus}
                  onVerifyReport={handleVerifyReport}
                />
              ) : (
                <StudentDashboard
                  currentUser={currentUser}
                  reports={reports}
                  onNavigate={setCurrentTab}
                  language={language}
                />
              )}
            </>
          )}

          {currentTab === 'scanner' && (
            <AIScannerView onReportIncidentFromScan={handleReportIncidentFromScan} />
          )}

          {currentTab === 'report' && (
            <ReportIssueView
              currentUser={currentUser}
              initialScanData={initialScanForReport}
              onSubmitReport={handleSubmitReport}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'lost-found' && (
            <LostAndFoundView
              currentUser={currentUser}
              lostItems={lostItems}
              foundItems={foundItems}
              matches={matches}
              claims={claims}
              onReportLost={handleReportLost}
              onReportFound={handleReportFound}
              onSubmitClaim={handleSubmitClaim}
              onResolveClaim={handleResolveClaim}
            />
          )}

          {currentTab === 'tasks' && (
            <TaskManagementView
              currentUser={currentUser}
              reports={reports}
              onUpdateStatus={handleUpdateStatus}
              onVerifyReport={handleVerifyReport}
            />
          )}

          {currentTab === 'map' && (
            <CampusMapView
              reports={reports}
              lostItems={lostItems}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'analytics' && <AnalyticsView reports={reports} />}

          {currentTab === 'eco' && <EcoPointsView currentUser={currentUser} />}

          {currentTab === 'reports' && <AuditLogView auditLogs={auditLogs} />}

          {currentTab === 'admin' && (
            <AdminCenterView
              currentUser={currentUser}
              onResetDemo={handleResetDemoData}
            />
          )}
        </main>
      </div>

      {/* Floating AI Assistant Trigger (Bottom Right) */}
      <button
        onClick={() => setAssistantOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-5 z-40 p-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 group"
        title="Open WasteBot Assistant"
      >
        <span className="text-xl">🤖</span>
        <span className="font-extrabold text-xs hidden sm:inline pr-1">WasteBot AI</span>
      </button>

      {/* Floating Assistant Modal */}
      <AIAssistantModal
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        language={language}
      />

      {/* 18-Step Live Interactive Demo Tour Modal */}
      <DemoModeModal
        isOpen={demoTourOpen}
        onClose={() => setDemoTourOpen(false)}
        onSelectRole={handleSelectRole}
        onNavigate={setCurrentTab}
        onResetDemo={handleResetDemoData}
      />

      {/* Mandatory Gmail User Confirmation Modal */}
      <GmailConfirmationModal
        isOpen={gmailModalData.isOpen}
        onClose={() => setGmailModalData((prev) => ({ ...prev, isOpen: false }))}
        recipientEmail={gmailModalData.recipient}
        subject={gmailModalData.subject}
        bodyText={gmailModalData.body}
      />
    </div>
  );
}
