import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/apiService';



const WriterArticleDetailPage: React.FC = () => {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.get(`/writer-articles/${articleId}/`);
        setArticle(response.data);
      } catch (err) {
        setError("Maqola ma'lumotlarini yuklashda xatolik yuz berdi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

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
    return <LoadingSpinner message="Maqola ma'lumotlari yuklanmoqda..." />;
  }

  if (error) {
    return <Alert type="error" message={error} onClose={() => navigate('/writer/my-articles')} />;
  }

  if (!article) {
    return (
      <Alert 
        type="error" 
        message="Maqola topilmadi." 
        onClose={() => navigate('/writer/my-articles')} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Button 
            variant="secondary"
            onClick={() => navigate('/writer/my-articles')}
            leftIcon={<ArrowLeftIcon className="h-4 w-4"/>}
            className="mb-4"
          >
            {translate('back_to_my_articles', 'Mening maqolalarimga qaytish')}
          </Button>
          <h1 className="text-3xl font-bold text-accent-sky flex items-center">
            <DocumentTextIcon className="h-8 w-8 mr-2" />
            {article.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(article.status)}
          {getStatusBadge(article.status)}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title={translate('article_details', 'Maqola tafsilotlari')} icon={<DocumentTextIcon className="h-6 w-6 text-accent-sky"/>}>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-light-text mb-2">{translate('abstract_label', 'Annotatsiya')}</h3>
                <p className="text-medium-text">{article.abstract}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-light-text mb-2">{translate('keywords_label', 'Kalit so\'zlar')}</h3>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.split(',').map((keyword: string, index: number) => (
                    <span key={index} className="modern-badge modern-badge-secondary">
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-light-text mb-2">{translate('journal_label', 'Jurnal')}</h3>
                  <p className="text-medium-text">{article.journal}</p>
                </div>
                <div>
                  <h3 className="font-medium text-light-text mb-2">{translate('submitted_date_label', 'Yuborilgan sana')}</h3>
                  <p className="text-medium-text">{new Date(article.submittedDate).toLocaleDateString('uz-UZ')}</p>
                </div>
              </div>
              
              {article.udk && (
                <div>
                  <h3 className="font-medium text-light-text mb-2">UDK</h3>
                  <p className="text-medium-text">{article.udk}</p>
                </div>
              )}
              
              {article.managerNotes && (
                <div>
                  <h3 className="font-medium text-light-text mb-2 flex items-center">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-accent-sky" />
                    {translate('manager_notes', 'Menejer izohlari')}
                  </h3>
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <p className="text-medium-text">{article.managerNotes}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          <Card title={translate('versions_history', 'Versiyalar tarixi')} icon={<ClockIcon className="h-6 w-6 text-accent-sky"/>}>
            <div className="space-y-4">
              {article.versions && article.versions.length > 0 ? (
                article.versions.map((version: any) => (
                  <div key={version.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div>
                      <h4 className="font-medium text-light-text">Versiya {version.versionNumber}</h4>
                      <p className="text-sm text-medium-text">{new Date(version.submittedDate).toLocaleDateString('uz-UZ')}</p>
                      {version.notes && <p className="text-sm text-medium-text mt-1">{version.notes}</p>}
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
                    >
                      {translate('download_button', 'Yuklab olish')}
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-medium-text py-4">
                  {translate('no_versions_found', 'Hali versiyalar mavjud emas')}
                </p>
              )}
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card title={translate('article_actions', 'Maqola amallari')} icon={<PencilSquareIcon className="h-6 w-6 text-accent-sky"/>}>
            <div className="space-y-4">
              <Button 
                fullWidth 
                leftIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
              >
                {translate('download_article', 'Maqolani yuklab olish')}
              </Button>
              
              {article.status === 'needs_revision' && (
                <Button 
                  fullWidth 
                  variant="primary"
                  onClick={() => navigate(`/writer/article/${articleId}/edit`)}
                  leftIcon={<PencilSquareIcon className="h-5 w-5" />}
                >
                  {translate('edit_article', 'Maqolani tahrirlash')}
                </Button>
              )}
              
              {article.status === 'accepted' && (
                <Button 
                  fullWidth 
                  variant="secondary"
                  leftIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
                >
                  {translate('download_certificate', 'Sertifikatni yuklab olish')}
                </Button>
              )}
              
              <Button 
                fullWidth 
                variant="secondary"
                leftIcon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
              >
                {translate('contact_editor', 'Redaktor bilan bog\'lanish')}
              </Button>
            </div>
          </Card>
          
          <Card title={translate('plagiarism_report', 'Plagiat hisoboti')} icon={<ExclamationTriangleIcon className="h-6 w-6 text-accent-sky"/>}>
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 mb-3">
                  <ExclamationTriangleIcon className="h-8 w-8 text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-light-text">{article.plagiarism_percentage}%</p>
                <p className="text-medium-text">{translate('plagiarism_percentage', 'Plagiat foizi')}</p>
              </div>
              
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div 
                  className="bg-amber-500 h-2.5 rounded-full" 
                  style={{ width: `${Math.min(article.plagiarism_percentage, 100)}%` }}
                ></div>
              </div>
              
              <div className="text-center">
                {article.plagiarism_percentage < 20 ? (
                  <p className="text-emerald-400 font-medium">
                    {translate('plagiarism_acceptable', 'Plagiat darajasi qabul qilinadi')}
                  </p>
                ) : article.plagiarism_percentage < 50 ? (
                  <p className="text-amber-400 font-medium">
                    {translate('plagiarism_moderate', 'Plagiat darajasi o\'rtacha')}
                  </p>
                ) : (
                  <p className="text-red-400 font-medium">
                    {translate('plagiarism_high', 'Plagiat darajasi yuqori')}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WriterArticleDetailPage;