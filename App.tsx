import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SubmitArticlePage from './pages/author/SubmitArticlePage';
import MyArticlesPage from './pages/author/MyArticlesPage';
import ArticleDetailPage from './pages/author/ArticleDetailPage';
import ArticleReviewPage from './pages/editor/ArticleReviewPage'; 
import AssignedArticlesPage from './pages/editor/AssignedArticlesPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import JournalManagementPage from './pages/admin/JournalManagementPage'; 
import AdminSystemSettingsPage from './pages/admin/AdminSystemSettingsPage';
import AdminAuditLogPage from './pages/admin/AdminAuditLogPage';
import AdminArticleOverviewPage from './pages/admin/AdminArticleOverviewPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './hooks/useAuth';
import { UserRole } from './types';
import JournalIssueManagementPage from './pages/editor/JournalIssueManagementPage'; 
import PublicSearchPage from './pages/public/PublicSearchPage';
import CalendarPage from './pages/author/CalendarPage';
import RankingsPage from './pages/public/RankingsPage';
import AIDocumentUtilitiesPage from './pages/author/AIDocumentUtilitiesPage'; 
import PlagiarismCheckPage from './pages/author/PlagiarismCheckPage';
import FinancialOverviewPage from './pages/accountant/FinancialOverviewPage';
import LoadingSpinner from './components/common/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: UserRole[] }> = ({ children, roles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Authenticating..." className="h-screen" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />; 
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/search" element={<PublicSearchPage />} />
        <Route path="/rankings" element={<RankingsPage />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />

          {isAuthenticated && user?.role === UserRole.CLIENT && (
            <>
              <Route path="submit-article" element={<SubmitArticlePage />} />
              <Route path="my-articles" element={<MyArticlesPage />} />
              <Route path="my-articles/:articleId" element={<ArticleDetailPage />} />
              <Route path="calendar" element={<CalendarPage />} /> 
              <Route path="ai-doc-utils" element={<AIDocumentUtilitiesPage />} /> 
              <Route path="plagiarism-check" element={<PlagiarismCheckPage />} />
            </>
          )}

          {isAuthenticated && user?.role === UserRole.JOURNAL_MANAGER && (
            <>
              <Route path="assigned-articles" element={<AssignedArticlesPage />} />
              <Route path="assigned-articles/:articleId" element={<ArticleReviewPage />} />
              <Route path="journal-management" element={<JournalManagementPage />} /> 
              <Route path="journal-issue-management/:journalId" element={<JournalIssueManagementPage />} />
            </>
          )}

          {isAuthenticated && (user?.role === UserRole.ACCOUNTANT || user?.role === UserRole.ADMIN) && (
            <>
              <Route path="financial-overview" element={<FinancialOverviewPage />} />
            </>
          )}
          
          {isAuthenticated && user?.role === UserRole.ADMIN && (
            <>
              <Route path="user-management" element={<UserManagementPage />} />
              <Route path="journal-management" element={<JournalManagementPage />} />
              <Route path="article-overview" element={<AdminArticleOverviewPage />} />
              <Route path="audit-log" element={<AdminAuditLogPage />} />
              <Route path="system-settings" element={<AdminSystemSettingsPage />} />
            </>
          )}
          
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;