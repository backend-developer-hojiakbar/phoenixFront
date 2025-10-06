import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { UserRole, DashboardSummary, Article } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { 
  DocumentPlusIcon, 
  DocumentMagnifyingGlassIcon, 
  UsersIcon, 
  CogIcon, 
  PresentationChartBarIcon, 
  BanknotesIcon, 
  DocumentCheckIcon, 
  EyeIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import DocumentViewer from '../components/common/DocumentViewer';
import Alert from '../components/common/Alert';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for approval modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const { data } = await apiService.get<DashboardSummary>('/dashboard-summary/');
        setSummary(data);
    } catch (err) {
        setError(translate('loading_user_data'));
        console.error("Failed to fetch dashboard summary", err);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchSummary();
    }
  }, [user]);
  
  const handleOpenApprovalModal = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };
  
  const handleApprovePayment = async () => {
    if (!selectedArticle) return;
    setIsApproving(true);
    setError(null);
    try {
      await apiService.post(`/approve-payment/${selectedArticle.id}/`);
      setIsModalOpen(false);
      await fetchSummary(); // Refresh dashboard data
    } catch (err: any) {
      setError(err.response?.data?.error || translate('login_failed_default_error'));
    } finally {
      setIsApproving(false);
    }
  };

  const renderApprovalSection = () => (
    <Card title={translate('pending_payments_list_title', 'Tasdiqlanishi Kutilayotgan To\'lovlar')} icon={<DocumentCheckIcon className="h-6 w-6 text-accent-sky"/>}>
      {summary?.pending_payments_list && summary.pending_payments_list.length > 0 ? (
        <div className="overflow-x-auto">
            <table className="modern-table">
                <thead>
                    <tr>
                        <th>{translate('article_title_label', 'Maqola')}</th>
                        <th>{translate('author_label', 'Muallif')}</th>
                        <th>{translate('action_label', 'Amal')}</th>
                    </tr>
                </thead>
                <tbody>
                    {summary.pending_payments_list.map(article => (
                        <tr key={article.id}>
                            <td>{article.title}</td>
                            <td>{article.author.name} {article.author.surname}</td>
                            <td>
                                <Button size="sm" onClick={() => handleOpenApprovalModal(article)} leftIcon={<EyeIcon className="h-4 w-4"/>}>
                                    {translate('view_and_approve_button', 'Ko\'rish va Tasdiqlash')}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      ) : (
        <p className="text-center text-medium-text py-4">{translate('no_pending_payments_message', 'Tasdiqlanishi kutilayotgan to\'lovlar mavjud emas.')}</p>
      )}
    </Card>
  );

  const renderClientDashboard = () => (
    <div className="modern-dashboard-grid">
      <div className="modern-dashboard-card">
        <div className="modern-dashboard-card-header">
          <div className="modern-dashboard-card-icon bg-purple-500/10 text-purple-500">
            <DocumentTextIcon className="h-6 w-6" />
          </div>
          <h3 className="modern-dashboard-card-title">{translate('articles_pending_review', 'Ko\'rib chiqilmoqda')}</h3>
        </div>
        <p className="modern-dashboard-card-value">{summary?.pending || 0}</p>
      </div>
      
      <div className="modern-dashboard-card">
        <div className="modern-dashboard-card-header">
          <div className="modern-dashboard-card-icon bg-amber-500/10 text-amber-500">
            <CogIcon className="h-6 w-6" />
          </div>
          <h3 className="modern-dashboard-card-title">{translate('articles_need_revision', 'Qayta ishlash kerak')}</h3>
        </div>
        <p className="modern-dashboard-card-value">{summary?.revision || 0}</p>
      </div>
      
      <div className="modern-dashboard-card">
        <div className="modern-dashboard-card-header">
          <div className="modern-dashboard-card-icon bg-emerald-500/10 text-emerald-500">
            <CheckBadgeIcon className="h-6 w-6" />
          </div>
          <h3 className="modern-dashboard-card-title">{translate('articles_accepted', 'Qabul qilingan')}</h3>
        </div>
        <p className="modern-dashboard-card-value">{summary?.accepted || 0}</p>
      </div>
      
      <div className="modern-card">
        <h2 className="modern-card-title mb-4">
          <BookOpenIcon className="h-6 w-6 text-accent-sky mr-2" />
          {translate('quick_actions', 'Tezkor Amallar')}
        </h2>
        <Button 
          onClick={() => navigate('/submit-article')} 
          leftIcon={<DocumentPlusIcon className="h-5 w-5"/>} 
          className="w-full"
        >
          {translate('submit_new_article_button', 'Yangi maqola yuborish')}
        </Button>
      </div>
    </div>
  );

  const renderEditorDashboard = () => (
    <div className="modern-dashboard-grid">
      <div className="modern-dashboard-card">
        <div className="modern-dashboard-card-header">
          <div className="modern-dashboard-card-icon bg-sky-500/10 text-sky-500">
            <DocumentPlusIcon className="h-6 w-6" />
          </div>
          <h3 className="modern-dashboard-card-title">{translate('new_submissions', 'Yangi kelganlar')}</h3>
        </div>
        <p className="modern-dashboard-card-value">{summary?.newSubmissions || 0}</p>
      </div>
      
      <div className="modern-dashboard-card">
        <div className="modern-dashboard-card-header">
          <div className="modern-dashboard-card-icon bg-purple-500/10 text-purple-500">
            <DocumentMagnifyingGlassIcon className="h-6 w-6" />
          </div>
          <h3 className="modern-dashboard-card-title">{translate('currently_reviewing', 'Jarayonda')}</h3>
        </div>
        <p className="modern-dashboard-card-value">{summary?.reviewing || 0}</p>
      </div>
      
      <div className="modern-card">
        <h2 className="modern-card-title mb-4">
          <ChatBubbleLeftRightIcon className="h-6 w-6 text-accent-sky mr-2" />
          {translate('quick_actions', 'Tezkor Amallar')}
        </h2>
        <Button 
          onClick={() => navigate('/assigned-articles')} 
          leftIcon={<DocumentMagnifyingGlassIcon className="h-5 w-5"/>} 
          className="w-full"
        >
          {translate('view_assigned_articles_button', 'Maqolalarni ko\'rish')}
        </Button>
      </div>
    </div>
  );
  
  const renderAccountantDashboard = () => (
    <div className="space-y-6">
        <div className="modern-dashboard-grid">
            <div className="modern-dashboard-card">
              <div className="modern-dashboard-card-header">
                <div className="modern-dashboard-card-icon bg-emerald-500/10 text-emerald-500">
                  <BanknotesIcon className="h-6 w-6" />
                </div>
                <h3 className="modern-dashboard-card-title">{translate('total_revenue', 'Jami Tushum')}</h3>
              </div>
              <p className="modern-dashboard-card-value">
                {new Intl.NumberFormat('uz-UZ').format( (summary?.total_submission_fees || 0) + (summary?.total_publication_fees || 0) )} UZS
              </p>
            </div>
            
            <div className="modern-dashboard-card">
              <div className="modern-dashboard-card-header">
                <div className="modern-dashboard-card-icon bg-amber-500/10 text-amber-500">
                  <DocumentCheckIcon className="h-6 w-6" />
                </div>
                <h3 className="modern-dashboard-card-title">{translate('pending_payments_count', 'Tasdiqlanishi kutilayotgan to\'lovlar soni')}</h3>
              </div>
              <p className="modern-dashboard-card-value">{summary?.payments_pending_approval || 0}</p>
            </div>
        </div>
        {renderApprovalSection()}
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
        <div className="modern-dashboard-grid">
            <div className="modern-dashboard-card">
              <div className="modern-dashboard-card-header">
                <div className="modern-dashboard-card-icon bg-sky-500/10 text-sky-500">
                  <PresentationChartBarIcon className="h-6 w-6" />
                </div>
                <h3 className="modern-dashboard-card-title">{translate('total_users', 'Foydalanuvchilar')}</h3>
              </div>
              <p className="modern-dashboard-card-value">{summary?.totalUsers || 0}</p>
            </div>
            
            <div className="modern-dashboard-card">
              <div className="modern-dashboard-card-header">
                <div className="modern-dashboard-card-icon bg-purple-500/10 text-purple-500">
                  <BookOpenIcon className="h-6 w-6" />
                </div>
                <h3 className="modern-dashboard-card-title">{translate('total_journals', 'Jurnallar')}</h3>
              </div>
              <p className="modern-dashboard-card-value">{summary?.totalJournals || 0}</p>
            </div>
            
            <div className="modern-dashboard-card">
              <div className="modern-dashboard-card-header">
                <div className="modern-dashboard-card-icon bg-emerald-500/10 text-emerald-500">
                  <DocumentTextIcon className="h-6 w-6" />
                </div>
                <h3 className="modern-dashboard-card-title">{translate('total_articles_system', 'Maqolalar')}</h3>
              </div>
              <p className="modern-dashboard-card-value">{summary?.totalArticles || 0}</p>
            </div>
            
            <div className="modern-dashboard-card">
              <div className="modern-dashboard-card-header">
                <div className="modern-dashboard-card-icon bg-amber-500/10 text-amber-500">
                  <BanknotesIcon className="h-6 w-6" />
                </div>
                <h3 className="modern-dashboard-card-title">{translate('total_revenue', 'Jami Tushum')}</h3>
              </div>
              <p className="modern-dashboard-card-value">
                {new Intl.NumberFormat('uz-UZ').format( (summary?.total_submission_fees || 0) + (summary?.total_publication_fees || 0) )} UZS
              </p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="modern-card">
            <h2 className="modern-card-title mb-4">
              <UsersIcon className="h-6 w-6 text-accent-sky mr-2" />
              {translate('user_management', 'Foydalanuvchilarni Boshqarish')}
            </h2>
            <Button 
              fullWidth 
              variant="secondary" 
              onClick={() => navigate('/user-management')} 
              leftIcon={<UsersIcon className="h-5 w-5"/>}
            >
              {translate('manage_users_button', 'Foydalanuvchilarni Boshqarish')}
            </Button>
          </div>
          
          <div className="modern-card">
            <h2 className="modern-card-title mb-4">
              <CogIcon className="h-6 w-6 text-accent-sky mr-2" />
              {translate('system_settings', 'Tizim Sozlamalari')}
            </h2>
            <Button 
              fullWidth 
              variant="secondary" 
              onClick={() => navigate('/system-settings')} 
              leftIcon={<CogIcon className="h-5 w-5"/>}
            >
              {translate('go_to_system_settings', 'Tizim Sozlamalariga O\'tish')}
            </Button>
          </div>
        </div>
        
        {renderApprovalSection()}
    </div>
  );
  
  if (isLoading || !user) {
    return <LoadingSpinner message={translate('loading_user_data', 'Ma\'lumotlar yuklanmoqda...')} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-light-text mb-2">{translate('dashboard', 'Boshqaruv Paneli')}</h1>
        <p className="text-medium-text">{translate('dashboard_subtitle', 'Bu yerda sizning faoliyatingiz va tizim holati haqida umumiy ma’lumot.')}</p>
      </div>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {user.role === UserRole.CLIENT && renderClientDashboard()}
      {user.role === UserRole.JOURNAL_MANAGER && renderEditorDashboard()}
      {user.role === UserRole.ACCOUNTANT && renderAccountantDashboard()}
      {user.role === UserRole.ADMIN && renderAdminDashboard()}
      
      {selectedArticle && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={`${translate('approve_payment_title', 'To\'lovni tasdiqlash')}: ${selectedArticle.title}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className='text-lg font-semibold text-light-text mb-3'>
                {translate('uploaded_receipt', 'Foydalanuvchi yuklagan kvitansiya')}
              </h4>
              <DocumentViewer 
                fileUrl={selectedArticle.submissionReceiptFileUrl!} 
                fileName={translate('receipt', 'Kvitansiya')} 
              />
            </div>
            <div className="flex flex-col">
              <h4 className='text-lg font-semibold text-light-text mb-3'>
                {translate('approval', 'Tasdiqlash')}
              </h4>
              <p className='text-medium-text mb-6'>
                {translate('approve_payment_description', 'Ushbu maqola uchun to\'lov kvitansiyasini ko\'rib chiqdingizmi? "Tasdiqlash" tugmasini bosish orqali maqola ko\'rib chiqish jarayoniga o\'tkaziladi.')}
              </p>
              <div className='mt-auto flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3'>
                <Button 
                  variant='secondary' 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto"
                >
                  {translate('cancel_button', 'Bekor qilish')}
                </Button>
                <Button 
                  onClick={handleApprovePayment} 
                  isLoading={isApproving}
                  className="w-full sm:w-auto"
                >
                  {translate('approve_button', 'Tasdiqlash')}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DashboardPage;