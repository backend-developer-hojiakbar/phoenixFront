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
  CheckBadgeIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  AcademicCapIcon
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
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="modern-dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-medium-text">{translate('articles_pending_review', 'Ko\'rib chiqilmoqda')}</p>
              <p className="text-2xl font-bold text-light-text mt-1">{summary?.pending || 0}</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-medium-text">
              <span>{translate('view_all', 'Barchasini ko\'rish')}</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="modern-dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-medium-text">{translate('articles_need_revision', 'Qayta ishlash kerak')}</p>
              <p className="text-2xl font-bold text-light-text mt-1">{summary?.revision || 0}</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <CogIcon className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-medium-text">
              <span>{translate('view_all', 'Barchasini ko\'rish')}</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="modern-dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-medium-text">{translate('articles_accepted', 'Qabul qilingan')}</p>
              <p className="text-2xl font-bold text-light-text mt-1">{summary?.accepted || 0}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <CheckBadgeIcon className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-medium-text">
              <span>{translate('view_all', 'Barchasini ko\'rish')}</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="modern-dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-medium-text">{translate('new_submissions', 'Yangi kelganlar')}</p>
              <p className="text-2xl font-bold text-light-text mt-1">{summary?.newSubmissions || 0}</p>
            </div>
            <div className="p-3 bg-sky-500/10 rounded-lg">
              <DocumentPlusIcon className="h-6 w-6 text-sky-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-medium-text">
              <span>{translate('view_all', 'Barchasini ko\'rish')}</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title={translate('quick_actions', 'Tezkor Amallar')} icon={<BookOpenIcon className="h-6 w-6 text-accent-sky"/>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              onClick={() => navigate('/submit-article')} 
              leftIcon={<DocumentPlusIcon className="h-5 w-5"/>}
              className="w-full justify-start"
            >
              {translate('submit_new_article_button', 'Yangi maqola yuborish')}
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/my-articles')} 
              leftIcon={<DocumentTextIcon className="h-5 w-5"/>}
              className="w-full justify-start"
            >
              {translate('view_my_articles_button', 'Mening maqolalarim')}
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/services')} 
              leftIcon={<PresentationChartBarIcon className="h-5 w-5"/>}
              className="w-full justify-start"
            >
              {translate('view_services_button', 'Xizmatlarni ko\'rish')}
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/profile')} 
              leftIcon={<UserGroupIcon className="h-5 w-5"/>}
              className="w-full justify-start"
            >
              {translate('view_profile_button', 'Profilim')}
            </Button>
          </div>
        </Card>
        
        {/* Recent Activity */}
        <Card title={translate('recent_activity', 'So\'nggi faoliyat')} icon={<ArrowTrendingUpIcon className="h-6 w-6 text-accent-sky"/>}>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 bg-emerald-500/10 rounded-lg">
                <CheckBadgeIcon className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-light-text">Maqola qabul qilindi</p>
                <p className="text-xs text-medium-text">2 soat oldin</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 bg-amber-500/10 rounded-lg">
                <CogIcon className="h-4 w-4 text-amber-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-light-text">Qayta ishlash kerak</p>
                <p className="text-xs text-medium-text">1 kun oldin</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 bg-sky-500/10 rounded-lg">
                <DocumentTextIcon className="h-4 w-4 text-sky-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-light-text">Yangi maqola yuborildi</p>
                <p className="text-xs text-medium-text">2 kun oldin</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderEditorDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="modern-dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-medium-text">{translate('new_submissions', 'Yangi kelganlar')}</p>
              <p className="text-2xl font-bold text-light-text mt-1">{summary?.newSubmissions || 0}</p>
            </div>
            <div className="p-3 bg-sky-500/10 rounded-lg">
              <DocumentPlusIcon className="h-6 w-6 text-sky-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-medium-text">
              <span>{translate('view_all', 'Barchasini ko\'rish')}</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="modern-dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-medium-text">{translate('currently_reviewing', 'Jarayonda')}</p>
              <p className="text-2xl font-bold text-light-text mt-1">{summary?.reviewing || 0}</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <DocumentMagnifyingGlassIcon className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-medium-text">
              <span>{translate('view_all', 'Barchasini ko\'rish')}</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="modern-dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-medium-text">{translate('articles_accepted', 'Qabul qilingan')}</p>
              <p className="text-2xl font-bold text-light-text mt-1">{summary?.accepted || 0}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <CheckBadgeIcon className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-medium-text">
              <span>{translate('view_all', 'Barchasini ko\'rish')}</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions and Assigned Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title={translate('quick_actions', 'Tezkor Amallar')} icon={<ChatBubbleLeftRightIcon className="h-6 w-6 text-accent-sky"/>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              onClick={() => navigate('/assigned-articles')} 
              leftIcon={<DocumentMagnifyingGlassIcon className="h-5 w-5"/>}
              className="w-full justify-start"
            >
              {translate('view_assigned_articles_button', 'Maqolalarni ko\'rish')}
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/journal-management')} 
              leftIcon={<AcademicCapIcon className="h-5 w-5"/>}
              className="w-full justify-start"
            >
              {translate('manage_journals_button', 'Jurnallarni boshqarish')}
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/profile')} 
              leftIcon={<UserGroupIcon className="h-5 w-5"/>}
              className="w-full justify-start"
            >
              {translate('view_profile_button', 'Profilim')}
            </Button>
          </div>
        </Card>
        
        {/* Recent Activity */}
        <Card title={translate('recent_activity', 'So\'nggi faoliyat')} icon={<ArrowTrendingUpIcon className="h-6 w-6 text-accent-sky"/>}>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 bg-emerald-500/10 rounded-lg">
                <CheckBadgeIcon className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-light-text">Maqola ko'rib chiqildi</p>
                <p className="text-xs text-medium-text">3 soat oldin</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 bg-sky-500/10 rounded-lg">
                <DocumentPlusIcon className="h-4 w-4 text-sky-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-light-text">Yangi maqola tayinlandi</p>
                <p className="text-xs text-medium-text">1 kun oldin</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 bg-purple-500/10 rounded-lg">
                <DocumentMagnifyingGlassIcon className="h-4 w-4 text-purple-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-light-text">Ko'rib chiqish boshlandi</p>
                <p className="text-xs text-medium-text">2 kun oldin</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
  
  const renderAccountantDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="modern-dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-medium-text">{translate('total_revenue', 'Umumiy daromad')}</p>
              <p className="text-2xl font-bold text-light-text mt-1">{summary?.total_submission_fees ? `${summary.total_submission_fees} USD` : '0 USD'}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>
        
        <div className="modern-dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-medium-text">{translate('pending_payments', 'Kutilayotgan to\'lovlar')}</p>
              <p className="text-2xl font-bold text-light-text mt-1">{summary?.payments_pending_approval || 0}</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </div>
        
        <div className="modern-dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-medium-text">{translate('total_publication_fees', 'Nashr uchun to\'lovlar')}</p>
              <p className="text-2xl font-bold text-light-text mt-1">{summary?.total_publication_fees ? `${summary.total_publication_fees} USD` : '0 USD'}</p>
            </div>
            <div className="p-3 bg-sky-500/10 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-sky-500" />
            </div>
          </div>
        </div>
        
        <div className="modern-dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-medium-text">{translate('articles_for_payment', 'To\'lov qilish kerak')}</p>
              <p className="text-2xl font-bold text-light-text mt-1">{summary?.pendingAll || 0}</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions and Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title={translate('quick_actions', 'Tezkor Amallar')} icon={<PresentationChartBarIcon className="h-6 w-6 text-accent-sky"/>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              onClick={() => navigate('/financial-report')} 
              leftIcon={<BanknotesIcon className="h-5 w-5"/>}
              className="w-full justify-start"
            >
              {translate('view_financial_report_button', 'Moliyaviy hisobot')}
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/profile')} 
              leftIcon={<UserGroupIcon className="h-5 w-5"/>}
              className="w-full justify-start"
            >
              {translate('view_profile_button', 'Profilim')}
            </Button>
          </div>
        </Card>
        
        {/* Recent Activity */}
        <Card title={translate('recent_activity', 'So\'nggi faoliyat')} icon={<ArrowTrendingUpIcon className="h-6 w-6 text-accent-sky"/>}>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 bg-emerald-500/10 rounded-lg">
                <CurrencyDollarIcon className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-light-text">To'lov tasdiqlandi</p>
                <p className="text-xs text-medium-text">4 soat oldin</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 bg-amber-500/10 rounded-lg">
                <BanknotesIcon className="h-4 w-4 text-amber-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-light-text">Yangi to'lov kutilmoqda</p>
                <p className="text-xs text-medium-text">1 kun oldin</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 bg-sky-500/10 rounded-lg">
                <DocumentTextIcon className="h-4 w-4 text-sky-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-light-text">Hisobot yaratildi</p>
                <p className="text-xs text-medium-text">2 kun oldin</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Pending Payments Section */}
      {user?.role === UserRole.ACCOUNTANT && renderApprovalSection()}
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="modern-dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-medium-text">{translate('total_users', 'Umumiy foydalanuvchilar')}</p>
              <p className="text-2xl font-bold text-light-text mt-1">{summary?.totalUsers || 0}</p>
            </div>
            <div className="p-3 bg-sky-500/10 rounded-lg">
              <UsersIcon className="h-6 w-6 text-sky-500" />
            </div>
          </div>
        </div>
        
        <div className="modern-dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-medium-text">{translate('total_journals', 'Umumiy jurnallar')}</p>
              <p className="text-2xl font-bold text-light-text mt-1">{summary?.totalJournals || 0}</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
        
        <div className="modern-dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-medium-text">{translate('total_articles', 'Umumiy maqolalar')}</p>
              <p className="text-2xl font-bold text-light-text mt-1">{summary?.totalArticles || 0}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>
        
        <div className="modern-dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-medium-text">{translate('pending_approvals', 'Tasdiqlash kutilmoqda')}</p>
              <p className="text-2xl font-bold text-light-text mt-1">{summary?.pendingAll || 0}</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <DocumentCheckIcon className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions and System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title={translate('quick_actions', 'Tezkor Amallar')} icon={<CogIcon className="h-6 w-6 text-accent-sky"/>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              onClick={() => navigate('/user-management')} 
              leftIcon={<UsersIcon className="h-5 w-5"/>}
              className="w-full justify-start"
            >
              {translate('manage_users_button', 'Foydalanuvchilarni boshqarish')}
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/journal-management')} 
              leftIcon={<BookOpenIcon className="h-5 w-5"/>}
              className="w-full justify-start"
            >
              {translate('manage_journals_button', 'Jurnallarni boshqarish')}
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/article-overview')} 
              leftIcon={<DocumentTextIcon className="h-5 w-5"/>}
              className="w-full justify-start"
            >
              {translate('manage_articles_button', 'Maqolalarni boshqarish')}
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/system-settings')} 
              leftIcon={<CogIcon className="h-5 w-5"/>}
              className="w-full justify-start"
            >
              {translate('system_settings_button', 'Tizim sozlamalari')}
            </Button>
          </div>
        </Card>
        
        {/* Recent Activity */}
        <Card title={translate('recent_activity', 'So\'nggi faoliyat')} icon={<ArrowTrendingUpIcon className="h-6 w-6 text-accent-sky"/>}>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 bg-emerald-500/10 rounded-lg">
                <UsersIcon className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-light-text">Yangi foydalanuvchi ro'yxatdan o'tdi</p>
                <p className="text-xs text-medium-text">5 soat oldin</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 bg-sky-500/10 rounded-lg">
                <BookOpenIcon className="h-4 w-4 text-sky-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-light-text">Yangi jurnal qo'shildi</p>
                <p className="text-xs text-medium-text">1 kun oldin</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 bg-purple-500/10 rounded-lg">
                <DocumentTextIcon className="h-4 w-4 text-purple-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-light-text">Maqola qabul qilindi</p>
                <p className="text-xs text-medium-text">2 kun oldin</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Pending Payments Section */}
      {user?.role === UserRole.ADMIN && renderApprovalSection()}
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner message={translate('loading_dashboard')} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-accent-sky">
          {translate('dashboard_title', 'Boshqaruv paneli')}
        </h1>
        <div className="flex items-center space-x-2">
          <span className="text-medium-text">{translate('welcome_back', 'Xush kelibsiz')},</span>
          <span className="font-semibold text-light-text">{user?.name} {user?.surname}</span>
        </div>
      </div>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      {user?.role === UserRole.CLIENT && renderClientDashboard()}
      {user?.role === UserRole.JOURNAL_MANAGER && renderEditorDashboard()}
      {user?.role === UserRole.ACCOUNTANT && renderAccountantDashboard()}
      {user?.role === UserRole.ADMIN && renderAdminDashboard()}
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={translate('approve_payment_title', 'To\'lovni Tasdiqlash')}
      >
        {selectedArticle && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-light-text">{translate('article_title_label', 'Maqola nomi')}:</h3>
              <p className="text-medium-text">{selectedArticle.title}</p>
            </div>
            <div>
              <h3 className="font-medium text-light-text">{translate('author_label', 'Muallif')}:</h3>
              <p className="text-medium-text">{selectedArticle.author.name} {selectedArticle.author.surname}</p>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={isApproving}
              >
                {translate('cancel_button', 'Bekor qilish')}
              </Button>
              <Button
                variant="primary"
                onClick={handleApprovePayment}
                isLoading={isApproving}
              >
                {translate('approve_button', 'Tasdiqlash')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardPage;