import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  EyeIcon, 
  PencilSquareIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import apiService from '../../services/apiService';

const WriterMyArticlesPage: React.FC = () => {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.get('/writer-articles/');
        setArticles(response.data);
      } catch (err) {
        setError("Maqolalarni yuklashda xatolik yuz berdi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <span className="modern-badge modern-badge-success">Qabul qilingan</span>;
      case 'reviewing':
        return <span className="modern-badge modern-badge-primary">Ko'rib chiqilmoqda</span>;
      case 'needs_revision':
        return <span className="modern-badge modern-badge-warning">Qayta ishlash kerak</span>;
      case 'pending':
        return <span className="modern-badge modern-badge-secondary">Kutilmoqda</span>;
      default:
        return <span className="modern-badge modern-badge-secondary">Noma'lum</span>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon className="h-5 w-5 text-emerald-500" />;
      case 'reviewing':
        return <ClockIcon className="h-5 w-5 text-purple-500" />;
      case 'needs_revision':
        return <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-slate-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-slate-500" />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Maqolalar yuklanmoqda..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-accent-sky flex items-center">
          <DocumentTextIcon className="h-8 w-8 mr-2" />
          {translate('my_articles_title', 'Mening Maqolalarim')}
        </h1>
        <Button 
          onClick={() => navigate('/writer/submit-article')}
          leftIcon={<DocumentTextIcon className="h-4 w-4"/>}
        >
          {translate('submit_new_article_button', 'Yangi maqola yuborish')}
        </Button>
      </div>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Card title={undefined} icon={undefined}>
        {articles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>{translate('article_title_label', 'Maqola')}</th>
                  <th>{translate('journal_label', 'Jurnal')}</th>
                  <th>{translate('status_label', 'Status')}</th>
                  <th>{translate('submitted_date_label', 'Yuborilgan sana')}</th>
                  <th>{translate('actions_label', 'Amallar')}</th>
                </tr>
              </thead>
              <tbody>
                {articles.map(article => (
                  <tr key={article.id}>
                    <td className="font-medium text-light-text">{article.title}</td>
                    <td>{article.journal}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(article.status)}
                        {getStatusBadge(article.status)}
                      </div>
                    </td>
                    <td>{new Date(article.submittedDate).toLocaleDateString('uz-UZ')}</td>
                    <td>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => navigate(`/writer/article/${article.id}`)}
                          leftIcon={<EyeIcon className="h-4 w-4"/>}
                        >
                          {translate('view_button', 'Ko\'rish')}
                        </Button>
                        {article.status === 'needs_revision' && (
                          <Button 
                            size="sm" 
                            onClick={() => navigate(`/writer/article/${article.id}/edit`)}
                            leftIcon={<PencilSquareIcon className="h-4 w-4"/>}
                          >
                            {translate('edit_button', 'Tahrirlash')}
                          </Button>
                        )}
                        {article.status === 'accepted' && (
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => navigate(`/writer/article/${article.id}/resubmit`)}
                            leftIcon={<ArrowPathIcon className="h-4 w-4"/>}
                          >
                            {translate('resubmit_button', 'Qayta yuborish')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 mx-auto text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-light-text mb-2">
              {translate('no_articles_found', 'Hali maqolalar mavjud emas')}
            </h3>
            <p className="text-medium-text mb-6">
              {translate('submit_first_article', 'Birinchi maqolani yuborish uchun quyidagi tugmani bosing')}
            </p>
            <Button 
              onClick={() => navigate('/writer/submit-article')}
              leftIcon={<DocumentTextIcon className="h-4 w-4"/>}
            >
              {translate('submit_new_article_button', 'Yangi maqola yuborish')}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default WriterMyArticlesPage;