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
import LoadingSpinner from './components/common/LoadingSpinner';
import EditorialApplicationPage from './pages/author/EditorialApplicationPage';
import ApplicationsOverviewPage from './pages/admin/ApplicationsOverviewPage';
import FinancialReportPage from './pages/accountant/FinancialReportPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: UserRole[] }> = ({ children, roles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner message="Authenticating..." /></div>;
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
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route path="submit-article" element={<ProtectedRoute roles={[UserRole.CLIENT]}><SubmitArticlePage /></ProtectedRoute>} />
          <Route path="my-articles" element={<ProtectedRoute roles={[UserRole.CLIENT]}><MyArticlesPage /></ProtectedRoute>} />
          <Route path="my-articles/:articleId" element={<ProtectedRoute roles={[UserRole.CLIENT]}><ArticleDetailPage /></ProtectedRoute>} />
          <Route path="apply-for-editorship" element={<ProtectedRoute roles={[UserRole.CLIENT]}><EditorialApplicationPage /></ProtectedRoute>} />

          <Route path="assigned-articles" element={<ProtectedRoute roles={[UserRole.JOURNAL_MANAGER]}><AssignedArticlesPage /></ProtectedRoute>} />
          <Route path="assigned-articles/:articleId" element={<ProtectedRoute roles={[UserRole.JOURNAL_MANAGER, UserRole.ADMIN]}><ArticleReviewPage /></ProtectedRoute>} />
          
          <Route path="financial-report" element={<ProtectedRoute roles={[UserRole.ACCOUNTANT, UserRole.ADMIN]}><FinancialReportPage /></ProtectedRoute>} />
          
          <Route path="user-management" element={<ProtectedRoute roles={[UserRole.ADMIN]}><UserManagementPage /></ProtectedRoute>} />
          <Route path="journal-management" element={<ProtectedRoute roles={[UserRole.ADMIN, UserRole.JOURNAL_MANAGER]}><JournalManagementPage /></ProtectedRoute>} />
          <Route path="article-overview" element={<ProtectedRoute roles={[UserRole.ADMIN]}><AdminArticleOverviewPage /></ProtectedRoute>} />
          <Route path="applications-overview" element={<ProtectedRoute roles={[UserRole.ADMIN]}><ApplicationsOverviewPage /></ProtectedRoute>} />
          <Route path="audit-log" element={<ProtectedRoute roles={[UserRole.ADMIN]}><AdminAuditLogPage /></ProtectedRoute>} />
          <Route path="system-settings" element={<ProtectedRoute roles={[UserRole.ADMIN]}><AdminSystemSettingsPage /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;