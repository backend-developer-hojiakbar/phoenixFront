import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { Article, ArticleStatus, User, ArticleVersion } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Textarea from '../../components/common/Textarea';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { CheckCircleIcon, XCircleIcon, PencilSquareIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'; 
import { api } from '../../services/api';

const ArticleReviewPage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const { translate } = useLanguage();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editorComment, setEditorComment] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  
  const fetchArticle = () => {
    if (!articleId) return;
    setIsLoading(true);
    api.get(`/articles/${articleId}/`)
      .then(data => {
        setArticle(data);
      })
      .catch(err => setActionError(err.message || "Article not found or you don't have permission."))
      .finally(() => setIsLoading(false));
  };
  
  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const handleStatusChange = async (newStatus: ArticleStatus) => {
    if (!article) return;
    setIsProcessingAction(true);
    setActionError(null);
    setActionSuccess(null);
    
    const data: { status: ArticleStatus, comment?: string } = { status: newStatus };
    if (editorComment) {
        data.comment = editorComment;
    }
    
    try {
        await api.patch(`/articles/${article.id}/`, data);
        setActionSuccess(translate('status_updated_successfully_to').replace('{status}', translate('status_'+newStatus.toLowerCase(), newStatus)));
        fetchArticle();
    } catch(err: any) {
        setActionError(err.message || "Failed to update status.");
    } finally {
        setIsProcessingAction(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={translate('loading_article_details')} />;
  }

  if (!article) {
    return <Card><p className="text-center text-red-400 py-8">{actionError || translate('article_not_found')}</p></Card>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold text-accent-sky">{translate('review_article_title')}: <span className="text-light-text">{article.title}</span></h1>
      </div>

      {actionError && <Alert type="error" message={actionError} onClose={() => setActionError(null)} />}
      {actionSuccess && <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title={translate('article_content_title')}>
            <h3 className="text-lg font-semibold text-light-text">{article.title}</h3>
            <p className="text-xs text-medium-text mb-2">
                {translate('submitted_by_author')} {article.author?.name} {article.author?.surname}
            </p>
            <p className="text-sm text-medium-text mb-3">{translate('submitted_on_label')} {new Date(article.submittedDate).toLocaleDateString()}</p>
            
            <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                <h4 className="font-semibold text-accent-sky mb-1">{translate('abstract_label')}</h4>
                <p className="text-sm text-light-text whitespace-pre-line">{article.abstract}</p>
            </div>
          </Card>

          <Card title={translate('versions_and_files_title')}>
            {article.versions && article.versions.length > 0 ? article.versions.map((v: ArticleVersion) => (
              <div key={v.id} className="p-3 mb-2 bg-slate-700 rounded-md border border-slate-600">
                <div className="flex justify-between items-center mb-1">
                    <div>
                        <p className="text-sm font-medium text-light-text">{translate('version_label')} {v.versionNumber} ({new Date(v.submittedDate).toLocaleDateString()})</p>
                        <p className="text-xs text-medium-text">{v.notes || translate('no_notes_for_version')}</p>
                    </div>
                    {v.file_url && (
                        <a href={v.file_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="ghost" leftIcon={<ArrowDownTrayIcon className="h-4 w-4"/>}>
                                {translate('download_button')}
                            </Button>
                        </a>
                    )}
                </div>
              </div>
            )) : <p className="text-sm text-medium-text">{translate('no_versions_found', 'No versions found.')}</p>}
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card title={translate('actions_and_comments_title')}>
            <Textarea
              label={translate('editor_comments_for_author_label')}
              value={editorComment}
              onChange={(e) => setEditorComment(e.target.value)}
              rows={5}
              placeholder={translate('enter_comments_placeholder')}
              disabled={isProcessingAction || article.status === 'accepted' || article.status === 'published' || article.status === 'rejected'}
            />
            { (article.status !== ArticleStatus.ACCEPTED && article.status !== ArticleStatus.REJECTED && article.status !== ArticleStatus.PUBLISHED) &&
              <div className="space-y-3 mt-4">
                <Button onClick={() => handleStatusChange(ArticleStatus.NEEDS_REVISION)} variant="secondary" fullWidth leftIcon={<PencilSquareIcon className="h-5 w-5"/>} isLoading={isProcessingAction} disabled={isProcessingAction}>
                  {translate('request_revision_button')}
                </Button>
                <Button onClick={() => handleStatusChange(ArticleStatus.REJECTED)} variant="danger" fullWidth leftIcon={<XCircleIcon className="h-5 w-5"/>} isLoading={isProcessingAction} disabled={isProcessingAction}>
                  {translate('reject_article_button')}
                </Button>
                
                <div className="p-3 border border-slate-700 rounded-md">
                    <h4 className="text-md font-semibold text-accent-emerald mb-2">{translate('accept_article_title_section')}</h4>
                    <Button onClick={() => handleStatusChange(ArticleStatus.ACCEPTED)} variant="primary" fullWidth leftIcon={<CheckCircleIcon className="h-5 w-5"/>} isLoading={isProcessingAction} disabled={isProcessingAction}>
                      {translate('accept_and_publish_button')}
                    </Button>
                </div>
              </div>
            }
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArticleReviewPage;