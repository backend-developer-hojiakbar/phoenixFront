import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { UserRole, DashboardSummary, Article } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { 
  DocumentPlusIcon, 
  DocumentTextIcon, 
  BookOpenIcon, 
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  PresentationChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

const WriterDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const { data } = await apiService.get<DashboardSummary>('/writer-dashboard-summary/');
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

  const renderWriterDashboard = () => (
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
        </div>
        
        <div className="modern-dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-medium-text">{translate('articles_need_revision', 'Qayta ishlash kerak')}</p>
              <p className="text-2xl font-bold text-light-text mt-1">{summary?.revision || 0}</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <PencilSquareIcon className="h-6 w-6 text-amber-500" />
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
              <BookOpenIcon className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>
        
        <div className="modern-dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-medium-text">{translate('total_articles', 'Jami maqolalar')}</p>
              <p className="text-2xl font-bold text-light-text mt-1">{summary?.totalArticles || 0}</p>
            </div>
            <div className="p-3 bg-sky-500/10 rounded-lg">
              <DocumentPlusIcon className="h-6 w-6 text-sky-500" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title={translate('quick_actions', 'Tezkor Amallar')} icon={<BookOpenIcon className="h-6 w-6 text-accent-sky"/>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              onClick={() => navigate('/writer/submit-article')} 
              leftIcon={<DocumentPlusIcon className="h-5 w-5"/>}
              className="w-full justify-start"
            >
              {translate('submit_new_article_button', 'Yangi maqola yuborish')}
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/writer/my-articles')} 
              leftIcon={<DocumentTextIcon className="h-5 w-5"/>}
              className="w-full justify-start"
            >
              {translate('view_my_articles_button', 'Mening maqolalarim')}
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/writer/article-drafts')} 
              leftIcon={<PencilSquareIcon className="h-5 w-5"/>}
              className="w-full justify-start"
            >
              {translate('manage_drafts_button', 'Qoralamalarni boshqarish')}
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/writer/profile')} 
              leftIcon={<UserGroupIcon className="h-5 w-5"/>}
              className="w-full justify-start"
            >
              {translate('view_profile_button', 'Profilim')}
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/writer/udc-assignment')} 
              leftIcon={<TagIcon className="h-5 w-5"/>}
              className="w-full justify-start"
            >
              {translate('udc_assignment_button', 'UDC tayinlash')}
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/writer/printed-publications')} 
              leftIcon={<BookOpenIcon className="h-5 w-5"/>}
              className="w-full justify-start"
            >
              {translate('printed_publications_button', 'Bosma nashrlar')}
            </Button>
          </div>
        </Card>
        
        {/* Recent Activity */}
        <Card title={translate('recent_activity', 'So\'nggi faoliyat')} icon={<ArrowTrendingUpIcon className="h-6 w-6 text-accent-sky"/>}>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 bg-emerald-500/10 rounded-lg">
                <BookOpenIcon className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-light-text">Maqola qabul qilindi</p>
                <p className="text-xs text-medium-text">2 soat oldin</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 bg-amber-500/10 rounded-lg">
                <PencilSquareIcon className="h-4 w-4 text-amber-500" />
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

  if (isLoading) {
    return <LoadingSpinner message={translate('loading_dashboard')} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-accent-sky">
          {translate('writer_dashboard_title', 'Yozuvchi paneli')}
        </h1>
        <div className="flex items-center space-x-2">
          <span className="text-medium-text">{translate('welcome_back', 'Xush kelibsiz')},</span>
          <span className="font-semibold text-light-text">{user?.name} {user?.surname}</span>
        </div>
      </div>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      {renderWriterDashboard()}
    </div>
  );
};

export default WriterDashboardPage;