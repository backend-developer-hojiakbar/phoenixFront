import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Article, ArticleStatus, PaymentStatus } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { EyeIcon, DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { LocalizationKeys } from '../../constants';
import Alert from '../../components/common/Alert';
import apiService from '../../services/apiService';

const StatusBadge: React.FC<{ status: ArticleStatus, paymentStatus: PaymentStatus }> = ({ status, paymentStatus }) => {
  const { translate } = useLanguage();
  const statusInfo: Record<ArticleStatus, { textKey: string; color: string }> = {
    [ArticleStatus.PENDING]: { textKey: 'status_pending', color: 'modern-badge modern-badge-warning' },
    [ArticleStatus.REVIEWING]: { textKey: 'status_reviewing', color: 'modern-badge modern-badge-secondary' },
    [ArticleStatus.NEEDS_REVISION]: { textKey: 'status_needs_revision', color: 'modern-badge modern-badge-warning' },
    [ArticleStatus.ACCEPTED]: { textKey: 'status_accepted', color: 'modern-badge modern-badge-success' },
    [ArticleStatus.REJECTED]: { textKey: 'status_rejected', color: 'modern-badge modern-badge-danger' },
    [ArticleStatus.PUBLISHED]: { textKey: LocalizationKeys.STATUS_PUBLISHED, color: 'modern-badge modern-badge-primary' },
  };

  let displayText = translate(statusInfo[status]?.textKey, status);
  let colorClass = statusInfo[status]?.color;

  if (status === ArticleStatus.PENDING) {
      if (paymentStatus === 'payment_pending_admin_approval') {
          displayText = translate(LocalizationKeys.HISTORY_STATUS_PAYMENT_PENDING_ADMIN_APPROVAL);
          colorClass = 'modern-badge modern-badge-warning';
      } else if (paymentStatus === 'payment_approved_processing') {
          displayText = translate(LocalizationKeys.HISTORY_STATUS_PAYMENT_APPROVED_PROCESSING);
          colorClass = 'modern-badge modern-badge-success';
      }
  }

  return (
    <span className={colorClass}>
      {displayText}
    </span>
  );
};

const MyArticlesPage: React.FC = () => {
  const { translate } = useLanguage();
  const navigate = useNavigate();
  
  const [articles, setArticles] = useState<Article[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiService.get<Article[]>('/articles/');
            setArticles(response.data);
        } catch (err) {
            setError("Maqolalarni yuklashda xatolik yuz berdi.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    fetchArticles();
  }, []);

  const handleViewDetails = (articleId: number) => { 
    navigate(`/my-articles/${articleId}`);
  };

  if (isLoading) { 
    return <LoadingSpinner message={translate('loading_my_articles')} />; 
  }
  
  return (
    <div className="space-y-8 modern-page-container">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-accent-sky modern-page-title">
          <DocumentTextIcon className="h-8 w-8 inline-block mr-2" />
          {translate('my_articles_title')}
        </h1>
        <Button 
          variant="primary" 
          onClick={() => navigate('/submit-article')}
          leftIcon={<PlusIcon className="h-5 w-5" />}
          className="modern-button-shadow"
        >
          {translate('submit_new_article')}
        </Button>
      </div>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-4" />}
      
      {articles.length === 0 && !isLoading ? (
        <Card className="text-center modern-empty-state-card">
          <div className="py-12">
            <DocumentTextIcon className="h-16 w-16 mx-auto text-slate-500 mb-4" />
            <h3 className="text-xl font-semibold text-light-text mb-2">{translate('no_articles_submitted')}</h3>
            <p className="text-medium-text mb-6">{translate('submit_your_first_article_description')}</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/submit-article')}
              leftIcon={<PlusIcon className="h-5 w-5" />}
              size="lg"
              className="modern-button-shadow"
            >
              {translate('submit_your_first_article')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <Card key={article.id} className="hover:shadow-accent-purple/40 modern-article-card">
                <div className="flex flex-col h-full">
                  <div className="flex flex-col md:flex-row justify-between md:items-start mb-3 gap-2">
                    <h2 className="text-xl font-semibold text-light-text mb-1 md:mb-0 line-clamp-2">
                      {article.title}
                    </h2>
                    <StatusBadge status={article.status} paymentStatus={article.submissionPaymentStatus} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-medium-text mb-1 flex items-center">
                      <span className="font-medium mr-1">{translate('journal_label')}</span> 
                      {article.journalName || article.journal}
                    </p>
                    <p className="text-sm text-medium-text mb-1 flex items-center">
                      <span className="font-medium mr-1">{translate('submitted_on_label')}</span>
                      {new Date(article.submittedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewDetails(article.id)} 
                      leftIcon={<EyeIcon className="h-4 w-4"/>}
                      className="modern-button-ghost-hover"
                    > 
                      {translate('view_details_button')} 
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyArticlesPage;