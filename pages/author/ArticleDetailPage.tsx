import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { Article, ArticleStatus, PaymentStatus } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import DocumentViewer from '../../components/common/DocumentViewer';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import { ArrowLeftIcon, ArrowDownTrayIcon, ChatBubbleBottomCenterTextIcon, InboxStackIcon, EyeIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import apiService, { createFormData } from '../../services/apiService';
import { LocalizationKeys } from '../../constants';

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

const ArticleDetailPage: React.FC = () => {
    const { articleId } = useParams<{ articleId: string }>();
    const navigate = useNavigate();
    const { translate } = useLanguage();

    const [article, setArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewingFile, setViewingFile] = useState<{ url: string; name: string } | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
    const [revisionNotes, setRevisionNotes] = useState('');
    const [isResubmitting, setIsResubmitting] = useState(false);
    
    const fetchArticle = async () => {
        if (!articleId) return;
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await apiService.get<Article>(`/articles/${articleId}/`);
            setArticle(data);
        } catch (err) {
            setError("Maqola ma'lumotlarini yuklashda xatolik yuz berdi.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchArticle();
    }, [articleId]);

    const handleOpenFileViewer = (url: string | undefined, name: string) => {
        if(!url) return;
        setViewingFile({ url, name });
        setIsViewerOpen(true);
    };

    const handleResubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVersionFile) {
            setError("Iltimos, maqolaning yangi versiyasini yuklang.");
            return;
        }
        setIsResubmitting(true);
        setError(null);
        setSuccessMessage(null);

        const formData = createFormData({
            file: newVersionFile,
            notes: revisionNotes
        });

        try {
            await apiService.post(`/articles/${articleId}/submit-revision/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccessMessage("Maqolaning yangi versiyasi muvaffaqiyatli yuborildi!");
            setNewVersionFile(null);
            setRevisionNotes('');
            await fetchArticle();
        } catch (err: any) {
            setError(err.response?.data?.error || "Qayta yuborishda xatolik yuz berdi.");
        } finally {
            setIsResubmitting(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner message={translate('loading_article_details')} />;
    }
    if (error && !article) {
        return <Alert type="error" message={error} />;
    }
    if (!article) {
        return <Alert type="error" message="Maqola topilmadi." />;
    }

    const canResubmit = article.status === ArticleStatus.NEEDS_REVISION || article.status === ArticleStatus.REJECTED;

    return (
        <>
            <div className="space-y-8">
                <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-bold text-light-text">{article.title}</h1>
                    <StatusBadge status={article.status} paymentStatus={article.submissionPaymentStatus} />
                </div>

                {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
                {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}

                {canResubmit && (
                    <Card title="Maqolani Qayta Yuborish" className="border-2 border-accent-sky shadow-lg shadow-accent-sky/10">
                        <form onSubmit={handleResubmit}>
                            <p className="text-sm text-sky-200 mb-4">
                                Maqolangiz redaktor tomonidan qayta ko'rib chiqish uchun qaytarildi yoki rad etildi. Iltimos, kerakli o'zgartirishlarni kiriting va yangi faylni yuklang.
                            </p>
                            <div className="mb-4">
                                <label htmlFor="newVersionFile" className="block text-sm font-medium text-light-text mb-1">Yangi Faylni Yuklash (.doc, .docx, .pdf)</label>
                                <Input 
                                    type="file" 
                                    id="newVersionFile"
                                    onChange={(e) => setNewVersionFile(e.target.files ? e.target.files[0] : null)}
                                    required
                                />
                                {newVersionFile && <p className="text-xs text-slate-400 mt-1">Tanlangan fayl: {newVersionFile.name}</p>}
                            </div>
                            <div className="mb-4">
                                <Textarea 
                                    label="Kiritilgan O'zgarishlar Haqida Izoh (Ixtiyoriy)"
                                    value={revisionNotes}
                                    onChange={(e) => setRevisionNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Masalan: 2-bo'limga qo'shimcha ma'lumotlar kiritildi, adabiyotlar ro'yxati yangilandi..."
                                />
                            </div>
                            <Button type="submit" isLoading={isResubmitting} disabled={isResubmitting} leftIcon={<PaperAirplaneIcon className="h-5 w-5"/>}>
                                Yangi Versiyani Yuborish
                            </Button>
                        </form>
                    </Card>
                )}

                {article.managerNotes && (
                    <Card title="Redaktor Izohlari" icon={<ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-amber-400"/>}>
                        <p className="text-sm text-amber-200 bg-amber-500/10 p-4 rounded-md whitespace-pre-line">{article.managerNotes}</p>
                    </Card>
                )}

                <Card title="Versiyalar va Fayllar" icon={<InboxStackIcon className="h-6 w-6 text-accent-purple" />}>
                    <div className="space-y-4">
                        <h4 className="text-md font-semibold text-light-text">Maqola Versiyalari</h4>
                        {article.versions && article.versions.length > 0 ? (
                            article.versions.map(version => (
                                <div key={version.id} className="p-3 bg-slate-700/50 rounded-md border border-slate-600 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-light-text">Versiya {version.versionNumber}</p>
                                        <p className="text-xs text-slate-400">Yuborildi: {new Date(version.submittedDate).toLocaleString()}</p>
                                    </div>
                                    <Button onClick={() => handleOpenFileViewer(version.file_url, `Versiya ${version.versionNumber}`)} variant="ghost" size="sm" leftIcon={<EyeIcon className="h-5 w-5"/>}>
                                        Ko'rish
                                    </Button>
                                </div>
                            ))
                        ) : <p className="text-medium-text">Hali maqola versiyalari mavjud emas.</p>}
                        
                        <div className='pt-4 border-t border-slate-700 space-y-3'>
                            <h4 className="text-md font-semibold text-light-text">Qo'shimcha Fayllar</h4>
                            {article.submissionReceiptFileUrl && (
                                <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md">
                                    <p className="text-sm text-light-text">To'lov kvitansiyasi</p>
                                    <Button onClick={() => handleOpenFileViewer(article.submissionReceiptFileUrl, "To'lov kvitansiyasi")} variant="ghost" size="sm" leftIcon={<EyeIcon className="h-5 w-5"/>}>
                                        Ko'rish
                                    </Button>
                                </div>
                            )}
                            {article.finalVersionFileUrl && (
                                <div className="flex justify-between items-center bg-emerald-900/40 p-3 rounded-md">
                                    <p className="text-sm font-bold text-emerald-300">Yakuniy versiya (Qabul qilingan)</p>
                                    <Button onClick={() => handleOpenFileViewer(article.finalVersionFileUrl, "Yakuniy versiya")} variant="primary" size="sm" leftIcon={<EyeIcon className="h-5 w-5"/>}>
                                        Ko'rish
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                <div className="mt-8">
                    <Button onClick={() => navigate(-1)} variant="secondary" leftIcon={<ArrowLeftIcon className="h-5 w-5"/>}>
                        Orqaga qaytish
                    </Button>
                </div>
            </div>

            <Modal isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} title={viewingFile?.name} size="4xl">
                {viewingFile && <DocumentViewer fileUrl={viewingFile.url} fileName={viewingFile.name} />}
            </Modal>
        </>
    );
};

export default ArticleDetailPage;