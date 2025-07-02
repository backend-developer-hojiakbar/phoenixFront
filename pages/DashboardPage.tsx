import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { UserRole } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { DocumentPlusIcon, DocumentMagnifyingGlassIcon, UsersIcon, CogIcon, PresentationChartBarIcon, ServerIcon, ShieldCheckIcon, ExclamationTriangleIcon, ArchiveBoxIcon, ListBulletIcon, ArrowRightCircleIcon, StarIcon, AcademicCapIcon, SparklesIcon, TrophyIcon, MagnifyingGlassIcon, ChartBarIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { LocalizationKeys } from '../constants';
import { api } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';


const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      api.get('/dashboard-summary/')
        .then(data => {
          setDashboardData(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to load dashboard data:", err);
          setIsLoading(false);
        });
    }
  }, [user]);

  if (isLoading || !user) {
    return <LoadingSpinner message={translate('loading_user_data')} />;
  }
  
  const getBadgeIcon = (iconName: string) => {
    const iconClass = "h-6 w-6";
    switch(iconName) {
        case 'AcademicCapIcon': return <AcademicCapIcon className={`${iconClass} text-sky-400`} />;
        case 'GlobeAltIcon': return <GlobeAltIcon className={`${iconClass} text-emerald-400`} />;
        case 'SparklesIcon': return <SparklesIcon className={`${iconClass} text-purple-400`} />;
        case 'TrophyIcon': return <TrophyIcon className={`${iconClass} text-amber-400`} />;
        default: return <StarIcon className={`${iconClass} text-yellow-400`} />;
    }
  }

  const getAuthorLevelText = (level?: 'new' | 'active' | 'prestigious') => {
    if (!level) return '';
    const levelKey = `AUTHOR_LEVEL_${level.toUpperCase()}` as keyof typeof LocalizationKeys;
    return translate(LocalizationKeys[levelKey] || level);
  }

  const renderClientDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card title={translate('my_articles_summary')} gradient>
        <p className="text-medium-text mb-2">{translate('articles_pending_review')} <span className="text-accent-sky font-semibold">{dashboardData?.pending || 0}</span></p>
        <p className="text-medium-text mb-2">{translate('articles_need_revision')} <span className="text-amber-400 font-semibold">{dashboardData?.revision || 0}</span></p>
        <p className="text-medium-text mb-4">{translate('articles_accepted')} <span className="text-accent-emerald font-semibold">{dashboardData?.accepted || 0}</span></p>
        <Button onClick={() => navigate('/submit-article')} leftIcon={<DocumentPlusIcon className="h-5 w-5"/>}>{translate('submit_new_article_button')}</Button>
      </Card>
      
      {dashboardData?.gamification && (
        <Card title={translate(LocalizationKeys.MY_ACHIEVEMENTS_TITLE)} icon={<TrophyIcon className="h-6 w-6 text-amber-400"/>} gradient>
            <div className="mb-3">
                <span className="text-sm text-medium-text">{translate(LocalizationKeys.AUTHOR_LEVEL_LABEL)}</span>
                <p className="text-lg font-semibold text-accent-emerald">{getAuthorLevelText(dashboardData.gamification.authorLevel)}</p>
            </div>
            {dashboardData.gamification.badges && dashboardData.gamification.badges.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-light-text mb-2">{translate(LocalizationKeys.BADGES_LABEL)}</h4>
                    <div className="flex flex-wrap gap-3">
                        {dashboardData.gamification.badges.map((badge: any) => (
                            <div key={badge.id} className="flex flex-col items-center p-3 bg-slate-700/60 rounded-lg shadow-md hover:shadow-purple-500/30 transition-shadow duration-300" title={`${translate(badge.nameKey)} - Achieved: ${new Date(badge.achievedDate).toLocaleDateString()}`}>
                                {getBadgeIcon(badge.iconName)}
                                <span className="text-xs text-slate-300 mt-1.5 text-center">{translate(badge.nameKey)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
      )}
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
        <p className="text-medium-text mb-2">{translate('new_submissions')} <span className="text-accent-sky font-semibold">{dashboardData?.newSubmissions || 0}</span></p>
        <p className="text-medium-text mb-4">{translate('currently_reviewing')} <span className="text-amber-400 font-semibold">{dashboardData?.reviewing || 0}</span></p>
        <Button onClick={() => navigate('/assigned-articles')} leftIcon={<DocumentMagnifyingGlassIcon className="h-5 w-5"/>}>{translate('view_assigned_articles_button')}</Button>
      </Card>
      
      {dashboardData?.stats && (
        <Card title={translate(LocalizationKeys.EDITORIAL_STATS_TITLE)} icon={<PresentationChartBarIcon className="h-6 w-6 text-accent-purple"/>} gradient>
            <p className="text-medium-text mb-1">
                {translate(LocalizationKeys.ARTICLES_REVIEWED_LABEL)} <span className="font-semibold text-light-text">{dashboardData.stats.articlesReviewed}</span>
            </p>
            <p className="text-medium-text">
                {translate(LocalizationKeys.AVG_REVIEW_TIME_LABEL)} <span className="font-semibold text-light-text">{dashboardData.stats.avgReviewTimeDays} {translate('days_short_label')}</span>
            </p>
        </Card>
      )}
       <Card title={translate('quick_actions_editor')} gradient>
        <ul className="space-y-2">
           <li><Button variant="ghost" onClick={() => navigate('/profile')}>{translate('manage_my_profile')}</Button></li>
           <li><Button variant="ghost" onClick={() => navigate('/search')} leftIcon={<MagnifyingGlassIcon className="h-4 w-4"/>}>{translate(LocalizationKeys.PUBLIC_SEARCH_PAGE_TITLE)}</Button></li>
           <li><Button variant="ghost" onClick={() => navigate('/rankings')} leftIcon={<ChartBarIcon className="h-4 w-4"/>}>{translate(LocalizationKeys.VIEW_RANKINGS_BUTTON)}</Button></li>
        </ul>
      </Card>
    </div>
  );

  const renderAdminDashboard = () => (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card title={translate('system_overview')} gradient icon={<PresentationChartBarIcon className="h-6 w-6 text-accent-sky"/>}>
        <p className="text-medium-text mb-2">{translate('total_users')} <span className="text-accent-sky font-semibold">{dashboardData?.totalUsers || 0}</span></p>
        <p className="text-medium-text mb-2">{translate('total_journals')} <span className="text-accent-purple font-semibold">{dashboardData?.totalJournals || 0}</span></p>
        <p className="text-medium-text mb-2">{translate('total_articles_system')} <span className="text-accent-emerald font-semibold">{dashboardData?.totalArticles || 0}</span></p>
        <p className="text-medium-text mb-4">{translate('articles_pending_review')} <span className="text-yellow-400 font-semibold">{dashboardData?.pendingAll || 0}</span></p>
      </Card>

      {dashboardData?.systemHealth && (
        <Card title={translate(LocalizationKeys.SYSTEM_HEALTH_TITLE)} gradient icon={<ServerIcon className="h-6 w-6 text-accent-emerald"/>}>
            <p className="text-sm text-medium-text">{translate(LocalizationKeys.DATABASE_STATUS_LABEL)}: <span className={dashboardData.systemHealth.databaseStatus === 'operational' ? 'text-accent-emerald' : 'text-red-400'}> {translate(dashboardData.systemHealth.databaseStatus)}</span></p>
            <p className="text-sm text-medium-text">{translate(LocalizationKeys.API_SERVICE_STATUS_LABEL)}: <span className={dashboardData.systemHealth.apiServiceStatus === 'operational' ? 'text-accent-emerald' : 'text-red-400'}> {translate(dashboardData.systemHealth.apiServiceStatus)}</span></p>
            <p className="text-sm text-medium-text">{translate(LocalizationKeys.STORAGE_USAGE_LABEL)}: {dashboardData.systemHealth.storageUsagePercent}%</p>
            <p className="text-sm text-medium-text">{translate(LocalizationKeys.LAST_BACKUP_LABEL)}: {dashboardData.systemHealth.lastBackupDate}</p>
        </Card>
      )}
      
      {dashboardData?.integrationStatus && (
        <Card title={translate(LocalizationKeys.INTEGRATION_STATUS_TITLE)} gradient icon={<ShieldCheckIcon className="h-6 w-6 text-accent-purple"/>}>
            {dashboardData.integrationStatus.map((service: any) => (
                <div key={service.serviceName} className="text-sm mb-1">
                    <span className="text-light-text">{service.serviceName}: </span>
                    <span className={service.status === 'operational' ? 'text-accent-emerald' : 'text-red-400'}>{translate(service.status)}</span>
                </div>
            ))}
            <Button size="sm" variant="ghost" className="mt-2" onClick={() => navigate('/system-settings')}>{translate('manage_integrations_button')}</Button>
        </Card>
      )}

      <Card title={translate('management_tools')} gradient icon={<CogIcon className="h-6 w-6 text-accent-sky"/>}>
         <div className="space-y-3">
            <Button fullWidth variant="secondary" onClick={() => navigate('/user-management')} leftIcon={<UsersIcon className="h-5 w-5"/>}>{translate('manage_users_button')}</Button>
            <Button fullWidth variant="secondary" onClick={() => navigate('/journal-management')} leftIcon={<ListBulletIcon className="h-5 w-5"/>}>{translate('manage_journals_button')}</Button>
            <Button fullWidth variant="secondary" onClick={() => navigate('/article-overview')} leftIcon={<ArchiveBoxIcon className="h-5 w-5"/>}>{translate(LocalizationKeys.MAQOLALARNI_BOSHQARISH_ADMIN)}</Button>
         </div>
      </Card>
    </div>
    </>
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
      {user.role === UserRole.ADMIN && renderAdminDashboard()}
    </div>
  );
};

export default DashboardPage;