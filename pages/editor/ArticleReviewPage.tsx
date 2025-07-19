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
import { CheckCircleIcon, XCircleIcon, PencilSquareIcon, EyeIcon, LinkIcon, PaperClipIcon } from '@heroicons/react/24/outline'; 
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
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [finalVersionFile, setFinalVersionFile] = useState<File | null>(null);
  const [externalLink, setExternalLink] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  
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
        setExternalLink(data.external_link || '');
      } catch (error) {
        setActionError("Maqolani yuklashda xatolik.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticle();
  }, [articleId]);
  
  const handleAction = async (action: 'request_revision' | 'reject_article' | 'accept_article') => {
    if (!article) return;
    setIsProcessingAction(true);
    
    const data: Record<string, any> = { notes: editorComment };
    if (action === 'accept_article' && finalVersionFile) {
        data.finalVersionFile = finalVersionFile;
    }

    try {
        await apiService.post(`/articles/${article.id}/${action}/`, createFormData(data), {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        navigate('/assigned-articles');
    } catch (err: any) {
        setActionError(err.response?.data?.error || `Amalni bajarishda xatolik.`);
    } finally {
        setIsProcessingAction(false);
    }
  };
  
  const handleAddLinkOrAttachment = async () => {
    if (!article) return;
    setIsProcessingAction(true);
    const data: Record<string, any> = { external_link: externalLink };
    if (attachmentFile) {
        data.attachment_file = attachmentFile;
    }
    try {
        await apiService.patch(`/articles/${article.id}/add-link-or-attachment/`, createFormData(data), {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        setActionError(null);
        await fetchArticle(); // refresh data
    } catch(err) {
        setActionError("Link yoki faylni qo'shishda xatolik.");
    } finally {
        setIsProcessingAction(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Maqola yuklanmoqda..." />;
  if (!article) return <Alert type="error" message={actionError || 'Maqola topilmadi'} />;

  return (
    <>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-accent-sky">{article.title}</h1>
        {actionError && <Alert type="error" message={actionError} onClose={() => setActionError(null)} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Maqola mazmuni">
              <p>Muallif: {article.author.name} {article.author.surname}</p>
              <p className='text-emerald-300 font-bold'>Anti-plagiat: {article.plagiarism_percentage?.toFixed(2) || 'N/A'}%</p>
              <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Annotatsiya</h4>
                  <p>{article.abstract_en}</p>
              </div>
              <Button onClick={() => setViewingFile({url: article.versions?.[0]?.file_url || '', name: 'Maqola'}) & setIsViewerOpen(true)} className="mt-4" leftIcon={<EyeIcon className="h-5 w-5"/>}>Maqolani Ko'rish</Button>
            </Card>
            <Card title="Link yoki fayl qo'shish">
                <Input label="Tashqi havola (DOI, etc.)" value={externalLink} onChange={e => setExternalLink(e.target.value)} />
                <Input label="Qo'shimcha fayl (.pdf, etc.)" type="file" onChange={e => setAttachmentFile(e.target.files?.[0] || null)} />
                <Button onClick={handleAddLinkOrAttachment} isLoading={isProcessingAction} className="mt-2" leftIcon={<PaperClipIcon className="h-5 w-5"/>}>Saqlash</Button>
            </Card>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Card title="Boshqaruv">
              <Textarea label="Muallif uchun izoh" value={editorComment} onChange={(e) => setEditorComment(e.target.value)} rows={4} />
              <div className="space-y-3 mt-4">
                  <Button onClick={() => handleAction('request_revision')} fullWidth leftIcon={<PencilSquareIcon className="h-5 w-5"/>}>Qayta ko'rib chiqishga yuborish</Button>
                  <Button onClick={() => handleAction('reject_article')} variant="danger" fullWidth leftIcon={<XCircleIcon className="h-5 w-5"/>}>Rad etish</Button>
                  <div className="p-3 border border-emerald-500 rounded-md">
                      <h4 className="font-semibold text-emerald-300 mb-2">Qabul qilish</h4>
                      <Input label="Yakuniy versiya (.pdf, .doc)" type="file" onChange={e => setFinalVersionFile(e.target.files?.[0] || null)}/>
                      <Button onClick={() => handleAction('accept_article')} variant="primary" fullWidth leftIcon={<CheckCircleIcon className="h-5 w-5"/>} className="mt-2" disabled={!finalVersionFile}>Qabul qilish</Button>
                  </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Modal isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} title={viewingFile?.name || ''} size="4xl">
          {viewingFile && <DocumentViewer fileUrl={viewingFile.url} fileName={viewingFile.name} />}
      </Modal>
    </>
  );
};

export default ArticleReviewPage;