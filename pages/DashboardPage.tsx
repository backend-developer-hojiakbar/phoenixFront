import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { UserRole, DashboardSummary } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { DocumentPlusIcon, DocumentMagnifyingGlassIcon, UsersIcon, CogIcon, PresentationChartBarIcon, ServerIcon, ShieldCheckIcon, ArchiveBoxIcon, ListBulletIcon, TrophyIcon, MagnifyingGlassIcon, ChartBarIcon, BanknotesIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
import { LocalizationKeys } from '../constants';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/common/LoadingSpinner';


const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
        setIsLoading(true);
        try {
            const { data } = await apiService.get<DashboardSummary>('/dashboard-summary/');
            setSummary(data);
        } catch (error) {
            console.error("Failed to fetch dashboard summary", error);
        } finally {
            setIsLoading(false);
        }
    };
    if (user) {
        fetchSummary();
    }
  }, [user]);

  if (isLoading || !user) {
    return <LoadingSpinner message={translate('loading_user_data')} />;
  }

  const renderClientDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card title={translate('my_articles_summary')} gradient>
        <p className="text-medium-text mb-2">{translate('articles_pending_review')}: <span className="text-accent-sky font-semibold">{summary?.pending || 0}</span></p>
        <p className="text-medium-text mb-2">{translate('articles_need_revision')}: <span className="text-amber-400 font-semibold">{summary?.revision || 0}</span></p>
        <p className="text-medium-text mb-4">{translate('articles_accepted')}: <span className="text-accent-emerald font-semibold">{summary?.accepted || 0}</span></p>
        <Button onClick={() => navigate('/submit-article')} leftIcon={<DocumentPlusIcon className="h-5 w-5"/>}>{translate('submit_new_article_button')}</Button>
      </Card>
      
      <Card title={translate(LocalizationKeys.MY_ACHIEVEMENTS_TITLE)} icon={<TrophyIcon className="h-6 w-6 text-amber-400"/>} gradient>
            <p className="text-medium-text">{translate('Gamification coming soon...')}</p>
      </Card>

      <Card title={translate('quick_links')} gradient>
        <ul className="space-y-2">
          <li><Button variant="ghost" onClick={() => navigate('/my-articles')}>{translate('view_all_my_articles')}</Button></li>
          <li><Button variant="ghost" onClick={() => navigate('/profile')}>{translate('manage_my_profile')}</Button></li>
          <li><Button variant="ghost" onClick={() => navigate('/search')} leftIcon={<MagnifyingGlassIcon className="h-4 w-4"/>}>{translate(LocalizationKeys.PUBLIC_SEARCH_PAGE_TITLE)}</Button></li>
          <li><Button variant="ghost" onClick={() => navigate('/rankings')} leftIcon={<ChartBarIcon className="h-4 w-4"/>}>{translate(LocalizationKeys.VIEW_RANKINGS_BUTTON)}</Button></li>
        </ul>
      </Card>
    </div>
  );

  const renderEditorDashboard = () => (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card title={translate('articles_for_review')} gradient>
        <p className="text-medium-text mb-2">{translate('new_submissions')}: <span className="text-accent-sky font-semibold">{summary?.newSubmissions || 0}</span></p>
        <p className="text-medium-text mb-4">{translate('currently_reviewing')}: <span className="text-amber-400 font-semibold">{summary?.reviewing || 0}</span></p>
        <Button onClick={() => navigate('/assigned-articles')} leftIcon={<DocumentMagnifyingGlassIcon className="h-5 w-5"/>}>{translate('view_assigned_articles_button')}</Button>
      </Card>
       <Card title={translate('quick_actions_editor')} gradient>
        <ul className="space-y-2">
           <li><Button variant="ghost" onClick={() => navigate('/profile')}>{translate('manage_my_profile')}</Button></li>
           <li><Button variant="ghost" onClick={() => navigate('/search')} leftIcon={<MagnifyingGlassIcon className="h-4 w-4"/>}>{translate(LocalizationKeys.PUBLIC_SEARCH_PAGE_TITLE)}</Button></li>
           <li><Button variant="ghost" onClick={() => navigate('/rankings')} leftIcon={<ChartBarIcon className="h-4 w-4"/>}>{translate(LocalizationKeys.VIEW_RANKINGS_BUTTON)}</Button></li>
        </ul>
      </Card>
    </div>
  );
  
  const renderAccountantDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title={translate("Jami Tushum")} icon={<BanknotesIcon className="h-6 w-6 text-accent-emerald"/>}>
            <p className="text-4xl font-bold text-light-text">{new Intl.NumberFormat('uz-UZ').format( (summary?.total_submission_fees || 0) + (summary?.total_publication_fees || 0) )} UZS</p>
        </Card>
        <Card title={translate("Tasdiqlanishi kutilayotgan to'lovlar")} icon={<DocumentCheckIcon className="h-6 w-6 text-accent-sky"/>}>
            <p className="text-4xl font-bold text-light-text">{summary?.payments_pending_approval || 0}</p>
        </Card>
         <Card title={translate('quick_links')} gradient>
            <ul className="space-y-2">
            <li><Button variant="ghost" onClick={() => navigate('/financial-overview')} leftIcon={<ChartBarIcon className="h-4 w-4"/>}>{translate(LocalizationKeys.NAV_FINANCIAL_OVERVIEW)}</Button></li>
            <li><Button variant="ghost" onClick={() => navigate('/profile')}>{translate('manage_my_profile')}</Button></li>
            </ul>
        </Card>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card title={translate('system_overview')} gradient icon={<PresentationChartBarIcon className="h-6 w-6 text-accent-sky"/>}>
        <p className="text-medium-text mb-2">{translate('total_users')}: <span className="text-accent-sky font-semibold">{summary?.totalUsers || 0}</span></p>
        <p className="text-medium-text mb-2">{translate('total_journals')}: <span className="text-accent-purple font-semibold">{summary?.totalJournals || 0}</span></p>
        <p className="text-medium-text mb-2">{translate('total_articles_system')}: <span className="text-accent-emerald font-semibold">{summary?.totalArticles || 0}</span></p>
        <p className="text-medium-text mb-4">{translate('articles_pending_review', 'Pending Review (All):')} <span className="text-yellow-400 font-semibold">{summary?.pendingAll || 0}</span></p>
      </Card>
      
       <Card title={translate(LocalizationKeys.SYSTEM_HEALTH_TITLE)} gradient icon={<ServerIcon className="h-6 w-6 text-accent-emerald"/>}>
           <p className="text-medium-text">Coming Soon</p>
      </Card>
      
      <Card title={translate(LocalizationKeys.INTEGRATION_STATUS_TITLE)} gradient icon={<ShieldCheckIcon className="h-6 w-6 text-accent-purple"/>}>
           <p className="text-medium-text">Coming Soon</p>
      </Card>

      <Card title={translate('management_tools')} gradient icon={<CogIcon className="h-6 w-6 text-accent-sky"/>} className="lg:col-span-3">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button fullWidth variant="secondary" onClick={() => navigate('/user-management')} leftIcon={<UsersIcon className="h-5 w-5"/>}>{translate('manage_users_button')}</Button>
            <Button fullWidth variant="secondary" onClick={() => navigate('/journal-management')} leftIcon={<ListBulletIcon className="h-5 w-5"/>}>{translate('manage_journals_button')}</Button>
            <Button fullWidth variant="secondary" onClick={() => navigate('/article-overview')} leftIcon={<ArchiveBoxIcon className="h-5 w-5"/>}>{translate(LocalizationKeys.MAQOLALARNI_BOSHQARISH_ADMIN)}</Button>
            <Button fullWidth variant="secondary" onClick={() => navigate('/audit-log')} leftIcon={<DocumentMagnifyingGlassIcon className="h-5 w-5"/>}>{translate(LocalizationKeys.AUDIT_JURNALI_ADMIN)}</Button>
            <Button fullWidth variant="secondary" onClick={() => navigate('/system-settings')} leftIcon={<CogIcon className="h-5 w-5"/>}>{translate('go_to_system_settings')}</Button>
            <Button fullWidth variant="secondary" onClick={() => navigate('/search')} leftIcon={<MagnifyingGlassIcon className="h-5 w-5"/>}>{translate(LocalizationKeys.PUBLIC_SEARCH_PAGE_TITLE)}</Button>
            <Button fullWidth variant="secondary" onClick={() => navigate('/rankings')} leftIcon={<ChartBarIcon className="h-5 w-5"/>}>{translate(LocalizationKeys.VIEW_RANKINGS_BUTTON)}</Button>
         </div>
      </Card>
    </div>
  );
  
  const welcomeMessage = `${translate('welcome_back')}, ${user.name}!`;

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-xl bg-gradient-to-r from-accent-purple to-accent-sky shadow-xl">
        <h1 className="text-3xl font-bold text-white">{welcomeMessage}</h1>
        <p className="text-purple-200 mt-1">{translate('dashboard_subtitle')}</p>
      </div>

      {user.role === UserRole.CLIENT && renderClientDashboard()}
      {user.role === UserRole.JOURNAL_MANAGER && renderEditorDashboard()}
      {user.role === UserRole.ACCOUNTANT && renderAccountantDashboard()}
      {user.role === UserRole.ADMIN && renderAdminDashboard()}
    </div>
  );
};

export default DashboardPage;