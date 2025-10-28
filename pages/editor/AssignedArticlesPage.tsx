import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Article, ArticleStatus } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { EyeIcon, FunnelIcon, MagnifyingGlassIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import { LocalizationKeys } from '../../constants';
import apiService from '../../services/apiService';
import Alert from '../../components/common/Alert';

// Define SelectOption interface inline since it's not in the types file
interface SelectOption {
  value: string;
  label: string;
}

const StatusBadge: React.FC<{ status: ArticleStatus }> = ({ status }) => {
  const { translate } = useLanguage();
  const statusInfo = {
    [ArticleStatus.PENDING]: { textKey: 'status_pending', color: 'modern-badge modern-badge-warning' },
    [ArticleStatus.REVIEWING]: { textKey: 'status_reviewing', color: 'modern-badge modern-badge-secondary' },
    [ArticleStatus.NEEDS_REVISION]: { textKey: 'status_needs_revision', color: 'modern-badge modern-badge-warning' },
    [ArticleStatus.ACCEPTED]: { textKey: 'status_accepted', color: 'modern-badge modern-badge-success' },
    [ArticleStatus.REJECTED]: { textKey: 'status_rejected', color: 'modern-badge modern-badge-danger' },
    [ArticleStatus.PUBLISHED]: { textKey: LocalizationKeys.STATUS_PUBLISHED, color: 'modern-badge modern-badge-primary' },
  };
  const currentStatus = statusInfo[status] || statusInfo[ArticleStatus.PENDING];
  return (
    <span className={currentStatus.color}>
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-accent-sky flex items-center">
          <DocumentTextIcon className="h-8 w-8 mr-2" />
          {translate('assigned_articles_title')}
        </h1>
        <div className="text-sm text-medium-text">
          {filteredArticles.length} {translate('articles_found')}
        </div>
      </div>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Card title={translate('filter_options_title')} icon={<FunnelIcon className="h-6 w-6 text-accent-purple"/>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text"
                placeholder={translate('type_to_search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="modern-input pl-10"
              />
            </div>
             <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-light-text mb-1">{translate(LocalizationKeys.FILTER_BY_STATUS_LABEL)}</label>
                <select 
                  id="statusFilter" 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value as ArticleStatus | 'ALL')}
                  className="modern-select"
                >
                  {statusOptions.map(opt => <option key={opt.value} value={opt.value as string}>{opt.label}</option>)}
                </select>
            </div>
        </div>
      </Card>

      {filteredArticles.length === 0 && !isLoading ? (
        <Card title={undefined} icon={undefined}>
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 mx-auto text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-light-text mb-2">{translate('no_articles_found')}</h3>
            <p className="text-medium-text">{translate('no_articles_found_criteria')}</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredArticles.map(article => (
            <Card key={article.id} title={undefined} icon={undefined} className="hover:shadow-accent-purple/40">
              <div className="flex flex-col md:flex-row justify-between md:items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-light-text mb-2">{article.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-medium-text mb-3">
                    <span>
                      <span className="font-medium">{translate(LocalizationKeys.AUTHOR_NAME_LABEL)}:</span> {article.author.name} {article.author.surname}
                    </span>
                    <span>
                      <span className="font-medium">{translate('journal_label')}:</span> {article.journalName}
                    </span>
                    <span>
                      <span className="font-medium">{translate('submitted_on_label')}:</span> {new Date(article.submittedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <StatusBadge status={article.status} />
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => navigate(`/assigned-articles/${article.id}`)} 
                  leftIcon={<EyeIcon className="h-4 w-4"/>}
                >
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