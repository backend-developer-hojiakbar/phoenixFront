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
import { ArrowLeftIcon, EyeIcon, InboxStackIcon, PaperAirplaneIcon, LinkIcon, PaperClipIcon, TrophyIcon, SparklesIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
import apiService, { createFormData } from '../../services/apiService';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';

const StatusBadge: React.FC<{ status: ArticleStatus }> = ({ status }) => {
  const statusInfo = {
    [ArticleStatus.PENDING]: 'bg-yellow-500/20 text-yellow-300',
    [ArticleStatus.REVIEWING]: 'bg-sky-500/20 text-sky-300',
    [ArticleStatus.NEEDS_REVISION]: 'bg-amber-500/20 text-amber-300',
    [ArticleStatus.ACCEPTED]: 'bg-emerald-500/20 text-emerald-300',
    [ArticleStatus.REJECTED]: 'bg-red-500/20 text-red-300',
    [ArticleStatus.PUBLISHED]: 'bg-purple-500/20 text-purple-300',
  };
  return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusInfo[status]}`}>{status}</span>;
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
    const [isResubmitting, setIsResubmitting] = useState(false);
    
    const fetchArticle = async () => {
        if (!articleId) return;
        setIsLoading(true);
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
        const formData = createFormData({ file: newVersionFile });

        try {
            await apiService.post(`/articles/${articleId}/submit-revision/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccessMessage("Yangi versiya muvaffaqiyatli yuborildi!");
            await fetchArticle();
        } catch (err: any) {
            setError(err.response?.data?.error || "Qayta yuborishda xatolik.");
        } finally {
            setIsResubmitting(false);
        }
    };

    if (isLoading) return <LoadingSpinner message="Maqola yuklanmoqda..." />;
    if (error) return <Alert type="error" message={error} />;
    if (!article) return <Alert type="info" message="Maqola topilmadi." />;

    return (
        <>
            <div className="space-y-8">
                <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-bold text-light-text">{article.title}</h1>
                    <StatusBadge status={article.status} />
                </div>
                <Card title="Versiyalar va Fayllar">
                    <div className="space-y-3">
                        {article.versions?.map(version => (
                            <div key={version.id} className="p-3 bg-slate-700/50 rounded-md flex justify-between items-center">
                                <p>Versiya {version.versionNumber}</p>
                                <Button onClick={() => handleOpenFileViewer(version.file_url, `Versiya ${version.versionNumber}`)} variant="ghost" size="sm" leftIcon={<EyeIcon className="h-5 w-5"/>} />
                            </div>
                        ))}
                        {article.certificate_file_url && (
                             <div className="p-3 bg-emerald-900/40 rounded-md flex justify-between items-center">
                                <p className="font-bold text-emerald-300">Qabul qilinganlik sertifikati</p>
                                <Button onClick={() => handleOpenFileViewer(article.certificate_file_url, "Sertifikat")} variant="primary" size="sm" leftIcon={<TrophyIcon className="h-5 w-5"/>}>
                                    Ko'rish / Yuklab olish
                                </Button>
                            </div>
                        )}
                        {article.external_link && (
                            <a href={article.external_link} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-700/50 rounded-md flex justify-between items-center hover:bg-slate-700">
                                <p>Tashqi havola</p>
                                <LinkIcon className="h-5 w-5 text-accent-sky"/>
                            </a>
                        )}
                        {article.attachment_file_url && (
                             <div className="p-3 bg-slate-700/50 rounded-md flex justify-between items-center">
                                <p>Qo'shimcha fayl</p>
                                <Button onClick={() => handleOpenFileViewer(article.attachment_file_url, "Qo'shimcha fayl")} variant="ghost" size="sm" leftIcon={<PaperClipIcon className="h-5 w-5"/>} />
                            </div>
                        )}
                    </div>
                </Card>

                {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}
                {article.status === ArticleStatus.NEEDS_REVISION && (
                    <Card title="Maqolani Qayta Yuborish">
                        <p className="text-sm text-amber-200 mb-4">Redaktor izohi: {article.managerNotes || "Izoh qoldirilmagan."}</p>
                        <form onSubmit={handleResubmit}>
                            <Input type="file" onChange={(e) => setNewVersionFile(e.target.files ? e.target.files[0] : null)} required />
                            <Button type="submit" isLoading={isResubmitting} leftIcon={<PaperAirplaneIcon className="h-5 w-5"/>} className="mt-2">
                                Yangi Versiyani Yuborish
                            </Button>
                        </form>
                    </Card>
                )}

                <Button onClick={() => navigate(-1)} variant="secondary" leftIcon={<ArrowLeftIcon className="h-5 w-5"/>}>
                    Orqaga
                </Button>
            </div>
            <Modal isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} title={viewingFile?.name || ''} size="4xl">
                {viewingFile && <DocumentViewer fileUrl={viewingFile.url} fileName={viewingFile.name} />}
            </Modal>
        </>
    );
};

export default ArticleDetailPage;