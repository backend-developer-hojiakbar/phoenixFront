import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { Article, ArticleStatus } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Textarea from '../../components/common/Textarea';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import DocumentViewer from '../../components/common/DocumentViewer';
import { CheckCircleIcon, XCircleIcon, PencilSquareIcon, EyeIcon, InboxStackIcon } from '@heroicons/react/24/outline'; 
import Input from '../../components/common/Input';
import apiService, { createFormData } from '../../services/apiService';

const ArticleReviewPage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const { translate } = useLanguage();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editorComment, setEditorComment] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [finalVersionFile, setFinalVersionFile] = useState<File | null>(null);
  
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) return;
      setIsLoading(true);
      try {
        const { data } = await apiService.get<Article>(`/articles/${articleId}/`);
        setArticle(data);
        setEditorComment(data.managerNotes || '');
      } catch (error) {
        setActionError("Maqolani yuklashda xatolik.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticle();
  }, [articleId]);
  
  const handleOpenFileViewer = (url: string | undefined, name: string) => {
    if (!url) {
        setActionError("Fayl manzili topilmadi.");
        return;
    }
    setViewingFile({ url, name });
    setIsViewerOpen(true);
  };

  const handleAction = async (action: 'request-revision' | 'reject' | 'accept') => {
    if (!article) return;
    if (action === 'accept' && !finalVersionFile) {
        setActionError(translate('final_version_required_for_acceptance'));
        return;
    }
    if ((action === 'request-revision' || action === 'reject') && !editorComment.trim()) {
        setActionError("Iltimos, muallif uchun izoh qoldiring.");
        return;
    }
    setIsProcessingAction(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
        let formData;
        if (action === 'accept') {
            formData = createFormData({ finalVersionFile: finalVersionFile!, notes: editorComment });
        } else {
            formData = createFormData({ notes: editorComment });
        }
        
        const response = await apiService.post(`/articles/${article.id}/${action}/`, formData, {
             headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        setArticle(response.data);
        setActionSuccess(`Amal muvaffaqiyatli bajarildi.`);
        setTimeout(() => navigate('/assigned-articles'), 2000);
    } catch (err: any) {
        setActionError(err.response?.data?.error || `Amalni bajarishda xatolik.`);
    } finally {
        setIsProcessingAction(false);
    }
  };
  
  const handleFinalFileVersion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setFinalVersionFile(file);
        setActionError(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={translate('loading_article_details')} />;
  }
  if (!article) {
    return <Card><p className="text-center text-red-400 py-8">{actionError || translate('article_not_found')}</p></Card>;
  }

  return (
    <>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-accent-sky">{translate('review_article_title')}: <span className="text-light-text">{article.title}</span></h1>

        {actionError && <Alert type="error" message={actionError} onClose={() => setActionError(null)} />}
        {actionSuccess && <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess(null)} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title={translate('article_content_title')}>
              <p className="text-sm text-medium-text mb-3">{translate('submitted_by_author')} {article.author.name} {article.author.surname}</p>
              <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                  <h4 className="font-semibold text-accent-sky mb-1">{translate('abstract_label')}</h4>
                  <p className="text-sm text-light-text whitespace-pre-line">{article.abstract_en}</p>
              </div>
            </Card>

            <Card title="Versiyalar va Fayllar" icon={<InboxStackIcon className="h-6 w-6 text-accent-purple"/>}>
                <div className="space-y-4">
                    {article.versions && article.versions.length > 0 ? (
                        article.versions.map(v => (
                          <div key={v.id} className="p-3 mb-2 bg-slate-700 rounded-md border border-slate-600 flex justify-between items-center">
                              <div>
                                  <p className="text-sm font-medium text-light-text">{translate('version_label')} {v.versionNumber}</p>
                                  <p className="text-xs text-medium-text">{v.notes || translate('no_notes_for_version')}</p>
                              </div>
                              <Button onClick={() => handleOpenFileViewer(v.file_url, `Versiya ${v.versionNumber}`)} variant="ghost" size="sm" leftIcon={<EyeIcon className="h-4 w-4"/>}>
                                  Ko'rish
                              </Button>
                          </div>
                        ))
                    ) : <p className="text-medium-text">Hali versiyalar mavjud emas.</p>}
                </div>
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
                disabled={isProcessingAction || article.status !== ArticleStatus.REVIEWING}
              />
              { (article.status === ArticleStatus.REVIEWING) &&
                <div className="space-y-3 mt-4">
                  <Button onClick={() => handleAction('request-revision')} variant="secondary" fullWidth leftIcon={<PencilSquareIcon className="h-5 w-5"/>} isLoading={isProcessingAction} disabled={isProcessingAction}>
                    {translate('request_revision_button')}
                  </Button>
                  <Button onClick={() => handleAction('reject')} variant="danger" fullWidth leftIcon={<XCircleIcon className="h-5 w-5"/>} isLoading={isProcessingAction} disabled={isProcessingAction}>
                    {translate('reject_article_button')}
                  </Button>
                  <div className="p-3 border border-slate-700 rounded-md">
                      <h4 className="text-md font-semibold text-accent-emerald mb-2">{translate('accept_article_title_section')}</h4>
                      <label htmlFor="finalVersionFile" className="block text-sm font-medium text-light-text mb-1">{translate('upload_final_edited_version_label')}</label>
                      <Input type="file" id="finalVersionFile" onChange={handleFinalFileVersion} disabled={isProcessingAction}/>
                      {finalVersionFile && <p className="text-xs text-medium-text mt-2">{translate('selected_file_label')} {finalVersionFile.name}</p>}
                      <Button onClick={() => handleAction('accept')} variant="primary" fullWidth leftIcon={<CheckCircleIcon className="h-5 w-5"/>} isLoading={isProcessingAction} disabled={isProcessingAction || !finalVersionFile}>
                        {translate('accept_and_publish_button')}
                      </Button>
                  </div>
                </div>
              }
            </Card>
          </div>
        </div>
      </div>
      <Modal isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} title={viewingFile?.name} size="4xl">
          {viewingFile && <DocumentViewer fileUrl={viewingFile.url} fileName={viewingFile.name} />}
      </Modal>
    </>
  );
};

export default ArticleReviewPage;