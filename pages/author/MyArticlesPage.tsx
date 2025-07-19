import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Article, ArticleStatus, PaymentStatus } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { EyeIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { LocalizationKeys } from '../../constants';
import Alert from '../../components/common/Alert';
import apiService from '../../services/apiService';

const StatusBadge: React.FC<{ status: ArticleStatus, paymentStatus: PaymentStatus }> = ({ status, paymentStatus }) => {
  const { translate } = useLanguage();
  const statusInfo: Record<ArticleStatus, { textKey: string; color: string }> = {
    [ArticleStatus.PENDING]: { textKey: 'status_pending', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500' },
    [ArticleStatus.REVIEWING]: { textKey: 'status_reviewing', color: 'bg-sky-500/20 text-sky-300 border-sky-500' },
    [ArticleStatus.NEEDS_REVISION]: { textKey: 'status_needs_revision', color: 'bg-amber-500/20 text-amber-300 border-amber-500' },
    [ArticleStatus.ACCEPTED]: { textKey: 'status_accepted', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500' },
    [ArticleStatus.REJECTED]: { textKey: 'status_rejected', color: 'bg-red-500/20 text-red-300 border-red-500' },
    [ArticleStatus.PUBLISHED]: { textKey: LocalizationKeys.STATUS_PUBLISHED, color: 'bg-purple-500/20 text-purple-300 border-purple-500' },
  };

  let displayText = translate(statusInfo[status]?.textKey, status);
  let color = statusInfo[status]?.color;

  if (status === ArticleStatus.PENDING) {
      if (paymentStatus === 'payment_pending_admin_approval') {
          displayText = translate(LocalizationKeys.HISTORY_STATUS_PAYMENT_PENDING_ADMIN_APPROVAL);
          color = 'bg-orange-500/20 text-orange-300 border-orange-500';
      } else if (paymentStatus === 'payment_approved_processing') {
          displayText = translate(LocalizationKeys.HISTORY_STATUS_PAYMENT_APPROVED_PROCESSING);
          color = 'bg-teal-500/20 text-teal-300 border-teal-500';
      }
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${color}`}>
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
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-accent-sky">{translate('my_articles_title')}</h1>
      {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-4" />}
      
      {articles.length === 0 && !isLoading ? (
        <Card>
          <p className="text-center text-medium-text py-8">{translate('no_articles_submitted')}</p>
          <div className="text-center"> <Button onClick={() => navigate('/submit-article')}>{translate('submit_your_first_article')}</Button> </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {articles.map(article => (
            <Card key={article.id} className="hover:shadow-accent-purple/40">
              <div className="flex flex-col md:flex-row justify-between md:items-start mb-3">
                <h2 className="text-xl font-semibold text-light-text mb-1 md:mb-0">{article.title}</h2>
                <StatusBadge status={article.status} paymentStatus={article.submissionPaymentStatus} />
              </div>
              <p className="text-sm text-medium-text mb-1">{translate('journal_label')} {article.journalName || article.journal}</p>
              <p className="text-sm text-medium-text mb-1">{translate('submitted_on_label')} {new Date(article.submittedDate).toLocaleDateString()}</p>
              
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700">
                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(article.id)} leftIcon={<EyeIcon className="h-4 w-4"/>}> 
                    {translate('view_details_button')} 
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyArticlesPage;