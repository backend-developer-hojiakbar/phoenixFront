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
import PlagiarismCheckPage from './pages/author/PlagiarismCheckPage';
import AIDocumentUtilitiesPage from './pages/author/AIDocumentUtilitiesPage';
import ServicesPage from './pages/author/ServicesPage';
import PrintedPublicationsPage from './pages/author/PrintedPublicationsPage';
import TranslationServicePage from './pages/author/TranslationServicePage';
import ArticleWritingPage from './pages/author/ArticleWritingPage';
import EditorCommunicationPage from './pages/author/EditorCommunicationPage';
import LiteracyCheckPage from './pages/author/LiteracyCheckPage';
import UDCClassificationPage from './pages/author/UDCClassificationPage';
import ORCIDIntegrationPage from './pages/author/ORCIDIntegrationPage';
import CalendarServicePage from './pages/author/CalendarServicePage';
import DocumentPreviewPage from './pages/author/DocumentPreviewPage';
import CoAuthorManagementPage from './pages/author/CoAuthorManagementPage';
import StatisticalReportsPage from './pages/author/StatisticalReportsPage';
import GoogleScholarIndexingPage from './pages/author/GoogleScholarIndexingPage';
import JournalsPage from './pages/public/JournalsPage';
import JournalDetailPage from './pages/public/JournalDetailPage';
import JournalArticleSubmissionPage from './pages/public/JournalArticleSubmissionPage';
import JournalEditorialApplicationPage from './pages/public/JournalEditorialApplicationPage';
import PaymentStatusPage from './pages/PaymentStatusPage';
import SohaManagementPage from './pages/admin/SohaManagementPage';
import DocumentTypeManagementPage from './pages/admin/DocumentTypeManagementPage';
import AdminServiceManagementPage from './pages/admin/AdminServiceManagementPage';

// Writer Pages
import WriterDashboardPage from './pages/writer/WriterDashboardPage';
import WriterSubmitArticlePage from './pages/writer/WriterSubmitArticlePage';
import WriterMyArticlesPage from './pages/writer/WriterMyArticlesPage';
import WriterProfilePage from './pages/writer/WriterProfilePage';
import WriterArticleDetailPage from './pages/writer/WriterArticleDetailPage';
import WriterDraftsManagementPage from './pages/writer/WriterDraftsManagementPage';
import WriterTestPage from './pages/writer/WriterTestPage';
import WriterUDCAssignmentPage from './pages/writer/WriterUDCAssignmentPage';
import WriterMyUDCOrdersPage from './pages/writer/WriterMyUDCOrdersPage';
import WriterPrintedPublicationsPage from './pages/writer/WriterPrintedPublicationsPage';
import AdminPrintedPublicationsPage from './pages/admin/AdminPrintedPublicationsPage';

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
        <Route path="/payment-status" element={<ProtectedRoute><PaymentStatusPage /></ProtectedRoute>} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route path="journals" element={<JournalsPage />} />
          <Route path="journals/:journalId" element={<JournalDetailPage />} />
          <Route path="journals/:journalId/submit-article" element={<ProtectedRoute roles={[UserRole.CLIENT]}><JournalArticleSubmissionPage /></ProtectedRoute>} />
          <Route path="journals/:journalId/apply-for-editorship" element={<ProtectedRoute roles={[UserRole.CLIENT]}><JournalEditorialApplicationPage /></ProtectedRoute>} />

          <Route path="submit-article" element={<ProtectedRoute roles={[UserRole.CLIENT]}><SubmitArticlePage /></ProtectedRoute>} />
          <Route path="my-articles" element={<ProtectedRoute roles={[UserRole.CLIENT]}><MyArticlesPage /></ProtectedRoute>} />
          <Route path="my-articles/:articleId" element={<ProtectedRoute roles={[UserRole.CLIENT]}><ArticleDetailPage /></ProtectedRoute>} />
          <Route path="services" element={<ProtectedRoute roles={[UserRole.CLIENT]}><ServicesPage /></ProtectedRoute>} />
          <Route path="apply-for-editorship" element={<ProtectedRoute roles={[UserRole.CLIENT]}><EditorialApplicationPage /></ProtectedRoute>} />
          
          <Route path="plagiarism-check" element={<ProtectedRoute roles={[UserRole.CLIENT]}><PlagiarismCheckPage /></ProtectedRoute>} />
          <Route path="ai-document-utilities" element={<ProtectedRoute roles={[UserRole.CLIENT]}><AIDocumentUtilitiesPage /></ProtectedRoute>} />
          <Route path="printed-publications" element={<ProtectedRoute roles={[UserRole.CLIENT]}><PrintedPublicationsPage /></ProtectedRoute>} />
          <Route path="translation-service" element={<ProtectedRoute roles={[UserRole.CLIENT]}><TranslationServicePage /></ProtectedRoute>} />
          <Route path="article-writing" element={<ProtectedRoute roles={[UserRole.CLIENT]}><ArticleWritingPage /></ProtectedRoute>} />
          <Route path="editor-communication" element={<ProtectedRoute roles={[UserRole.CLIENT]}><EditorCommunicationPage /></ProtectedRoute>} />
          <Route path="literacy-check" element={<ProtectedRoute roles={[UserRole.CLIENT]}><LiteracyCheckPage /></ProtectedRoute>} />
          <Route path="udc-classification" element={<ProtectedRoute roles={[UserRole.CLIENT]}><UDCClassificationPage /></ProtectedRoute>} />
          <Route path="orcid-integration" element={<ProtectedRoute roles={[UserRole.CLIENT]}><ORCIDIntegrationPage /></ProtectedRoute>} />
          <Route path="calendar-service" element={<ProtectedRoute roles={[UserRole.CLIENT]}><CalendarServicePage /></ProtectedRoute>} />
          <Route path="document-preview" element={<ProtectedRoute roles={[UserRole.CLIENT]}><DocumentPreviewPage /></ProtectedRoute>} />
          <Route path="coauthor-management" element={<ProtectedRoute roles={[UserRole.CLIENT]}><CoAuthorManagementPage /></ProtectedRoute>} />
          <Route path="statistical-reports" element={<ProtectedRoute roles={[UserRole.CLIENT]}><StatisticalReportsPage /></ProtectedRoute>} />
          <Route path="google-scholar-indexing" element={<ProtectedRoute roles={[UserRole.CLIENT]}><GoogleScholarIndexingPage /></ProtectedRoute>} />
          
          <Route path="assigned-articles" element={<ProtectedRoute roles={[UserRole.JOURNAL_MANAGER]}><AssignedArticlesPage /></ProtectedRoute>} />
          <Route path="assigned-articles/:articleId" element={<ProtectedRoute roles={[UserRole.JOURNAL_MANAGER, UserRole.ADMIN]}><ArticleReviewPage /></ProtectedRoute>} />
          
          <Route path="financial-report" element={<ProtectedRoute roles={[UserRole.ACCOUNTANT, UserRole.ADMIN]}><FinancialReportPage /></ProtectedRoute>} />
          
          <Route path="user-management" element={<ProtectedRoute roles={[UserRole.ADMIN]}><UserManagementPage /></ProtectedRoute>} />
          <Route path="journal-management" element={<ProtectedRoute roles={[UserRole.ADMIN, UserRole.JOURNAL_MANAGER]}><JournalManagementPage /></ProtectedRoute>} />
          <Route path="article-overview" element={<ProtectedRoute roles={[UserRole.ADMIN]}><AdminArticleOverviewPage /></ProtectedRoute>} />
          <Route path="applications-overview" element={<ProtectedRoute roles={[UserRole.ADMIN]}><ApplicationsOverviewPage /></ProtectedRoute>} />
          <Route path="audit-log" element={<ProtectedRoute roles={[UserRole.ADMIN]}><AdminAuditLogPage /></ProtectedRoute>} />
          <Route path="system-settings" element={<ProtectedRoute roles={[UserRole.ADMIN]}><AdminSystemSettingsPage /></ProtectedRoute>} />
          <Route path="soha-management" element={<ProtectedRoute roles={[UserRole.ADMIN]}><SohaManagementPage /></ProtectedRoute>} />
          <Route path="document-type-management" element={<ProtectedRoute roles={[UserRole.ADMIN]}><DocumentTypeManagementPage /></ProtectedRoute>} />
          <Route path="service-management" element={<ProtectedRoute roles={[UserRole.ADMIN]}><AdminServiceManagementPage /></ProtectedRoute>} />
          
          {/* Writer Routes */}
          <Route path="writer/dashboard" element={<ProtectedRoute roles={[UserRole.WRITER]}><WriterDashboardPage /></ProtectedRoute>} />
          <Route path="writer/submit-article" element={<ProtectedRoute roles={[UserRole.WRITER]}><WriterSubmitArticlePage /></ProtectedRoute>} />
          <Route path="writer/my-articles" element={<ProtectedRoute roles={[UserRole.WRITER]}><WriterMyArticlesPage /></ProtectedRoute>} />
          <Route path="writer/my-articles/:articleId" element={<ProtectedRoute roles={[UserRole.WRITER]}><WriterArticleDetailPage /></ProtectedRoute>} />
          <Route path="writer/profile" element={<ProtectedRoute roles={[UserRole.WRITER]}><WriterProfilePage /></ProtectedRoute>} />
          <Route path="writer/article-drafts" element={<ProtectedRoute roles={[UserRole.WRITER]}><WriterDraftsManagementPage /></ProtectedRoute>} />
          <Route path="writer/test" element={<ProtectedRoute roles={[UserRole.WRITER]}><WriterTestPage /></ProtectedRoute>} />
          <Route path="writer/udc-assignment" element={<ProtectedRoute roles={[UserRole.WRITER]}><WriterUDCAssignmentPage /></ProtectedRoute>} />
          <Route path="writer/my-udc-orders" element={<ProtectedRoute roles={[UserRole.WRITER]}><WriterMyUDCOrdersPage /></ProtectedRoute>} />
          <Route path="writer/printed-publications" element={<ProtectedRoute roles={[UserRole.WRITER]}><WriterPrintedPublicationsPage /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="admin/printed-publications" element={<ProtectedRoute roles={[UserRole.ADMIN]}><AdminPrintedPublicationsPage /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;