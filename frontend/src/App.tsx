import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BulkImportPage } from './pages/BulkImportPage';
import { SubmissionPage } from './pages/SubmissionPage';
import { GuideReviewPage } from './pages/GuideReviewPage';
import { PanelReviewPage } from './pages/PanelReviewPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { TeamPage } from './pages/TeamPage';
import { WorkloadBalancerPage } from './pages/WorkloadBalancerPage';
import { ContributionPage } from './pages/ContributionPage';
import { MilestoneReviewsPage } from './pages/MilestoneReviewsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SystemHealthPage } from './pages/SystemHealthPage';
import { ErrorBoundary } from './components/ErrorBoundary';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/70 to-indigo-50/30 text-slate-800 flex flex-col selection:bg-indigo-600 selection:text-white">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && <DashboardPage onNavigate={setCurrentTab} />}
            {currentTab === 'submission' && <SubmissionPage />}
            {currentTab === 'team' && <TeamPage />}
            {currentTab === 'contribution' && <ContributionPage />}
            {currentTab === 'guide-reviews' && <GuideReviewPage />}
            {currentTab === 'milestones' && <MilestoneReviewsPage />}
            {currentTab === 'panel-reviews' && <PanelReviewPage />}
            {currentTab === 'guide-allocation' && <WorkloadBalancerPage />}
            {currentTab === 'section-oversight' && <WorkloadBalancerPage />}
            {currentTab === 'bulk-import' && <BulkImportPage />}
            {currentTab === 'audit-logs' && <AuditLogPage />}
            {currentTab === 'system-health' && <SystemHealthPage />}
            {currentTab === 'profile' && <ProfilePage />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ErrorBoundary>
  );
}
