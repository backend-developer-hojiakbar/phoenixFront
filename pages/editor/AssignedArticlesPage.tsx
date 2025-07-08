import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Article, ArticleStatus, SelectOption } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { EyeIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import { LocalizationKeys } from '../../constants';
import apiService from '../../services/apiService';
import Alert from '../../components/common/Alert';

const StatusBadge: React.FC<{ status: ArticleStatus }> = ({ status }) => {
  const { translate } = useLanguage();
  const statusInfo = {
    [ArticleStatus.PENDING]: { textKey: 'status_pending', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500' },
    [ArticleStatus.REVIEWING]: { textKey: 'status_reviewing', color: 'bg-sky-500/20 text-sky-300 border-sky-500' },
    [ArticleStatus.NEEDS_REVISION]: { textKey: 'status_needs_revision', color: 'bg-amber-500/20 text-amber-300 border-amber-500' },
    [ArticleStatus.ACCEPTED]: { textKey: 'status_accepted', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500' },
    [ArticleStatus.REJECTED]: { textKey: 'status_rejected', color: 'bg-red-500/20 text-red-300 border-red-500' },
    [ArticleStatus.PUBLISHED]: { textKey: LocalizationKeys.STATUS_PUBLISHED, color: 'bg-purple-500/20 text-purple-300 border-purple-500' },
  };
  const currentStatus = statusInfo[status] || statusInfo[ArticleStatus.PENDING];
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${currentStatus.color}`}>
      {translate(currentStatus.textKey, status)}
    </span>
  );
};

const AssignedArticlesPage: React.FC = () => {
  const { translate } = useLanguage();
  const navigate = useNavigate();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | 'ALL'>('ALL');

  useEffect(() => {
    const fetchArticles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiService.get<Article[]>('/articles/');
            setArticles(response.data);
        } catch (err: any) {
            setError("Sizga biriktirilgan maqolalarni yuklashda xatolik yuz berdi.");
            console.error("Fetch assigned articles error:", err.response ? err.response.data : err.message);
        } finally {
            setIsLoading(false);
        }
    };
    fetchArticles();
  }, []);

  const statusOptions: SelectOption[] = [
    { value: 'ALL', label: translate('all_statuses') },
    ...Object.values(ArticleStatus).map(s => ({ value: s, label: translate('status_' + s.toLowerCase() as any, s) }))
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = article.title.toLowerCase().includes(term) || article.author.name.toLowerCase().includes(term);
        const matchesStatus = statusFilter === 'ALL' || article.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
  }, [articles, searchTerm, statusFilter]);

  if (isLoading) {
    return <LoadingSpinner message={translate('loading_assigned_articles')} />;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-accent-sky">{translate('assigned_articles_title')}</h1>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Card title={translate('filter_options_title')} icon={<FunnelIcon className="h-6 w-6 text-accent-purple"/>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <Input 
                label={translate('search_articles_label')}
                placeholder={translate('type_to_search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400"/>}
            />
             <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-light-text mb-1">{translate(LocalizationKeys.FILTER_BY_STATUS_LABEL)}</label>
                <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ArticleStatus | 'ALL')}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-light-text focus:ring-2 focus:ring-accent-sky focus:border-accent-sky focus:outline-none">
                  {statusOptions.map(opt => <option key={opt.value} value={opt.value as string}>{opt.label}</option>)}
                </select>
            </div>
        </div>
      </Card>

      {filteredArticles.length === 0 && !isLoading ? (
        <Card>
          <p className="text-center text-medium-text py-8">{translate('no_articles_found_criteria')}</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredArticles.map(article => (
            <Card key={article.id} className="hover:shadow-accent-purple/40">
              <div className="flex flex-col md:flex-row justify-between md:items-start mb-3">
                <div>
                    <h2 className="text-xl font-semibold text-light-text mb-1 md:mb-0">{article.title}</h2>
                    <p className="text-xs text-medium-text">
                        {translate(LocalizationKeys.AUTHOR_NAME_LABEL)}: {article.author.name} {article.author.surname}
                    </p>
                </div>
                <StatusBadge status={article.status} />
              </div>
              <p className="text-sm text-medium-text mb-1">{translate('journal_label')} {article.journalName}</p>
              <p className="text-sm text-medium-text mb-1">{translate('submitted_on_label')} {new Date(article.submittedDate).toLocaleDateString()}</p>
              
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700">
                <Button variant="primary" size="sm" onClick={() => navigate(`/assigned-articles/${article.id}`)} leftIcon={<EyeIcon className="h-4 w-4"/>}>
                  {translate('review_article_button')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedArticlesPage;