import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import { ArchiveBoxIcon, FunnelIcon, MagnifyingGlassIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { Article, ArticleStatus, Journal, User, UserRole, SelectOption, PaymentStatus } from '../../types';
import { LocalizationKeys } from '../../constants';
import apiService, { createFormData } from '../../services/apiService';

const StatusBadgeAdmin: React.FC<{ status: ArticleStatus }> = ({ status }) => {
  const { translate } = useLanguage();
  const statusInfo = {
    [ArticleStatus.PENDING]: { textKey: 'status_pending', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500' },
    [ArticleStatus.REVIEWING]: { textKey: 'status_reviewing', color: 'bg-sky-500/20 text-sky-300 border-sky-500' },
    [ArticleStatus.NEEDS_REVISION]: { textKey: 'status_needs_revision', color: 'bg-amber-500/20 text-amber-300 border-amber-500' },
    [ArticleStatus.ACCEPTED]: { textKey: 'status_accepted', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500' },
    [ArticleStatus.REJECTED]: { textKey: 'status_rejected', color: 'bg-red-500/20 text-red-300 border-red-500' },
    [ArticleStatus.PUBLISHED]: { textKey: LocalizationKeys.STATUS_PUBLISHED, color: 'bg-purple-500/20 text-purple-300 border-purple-500' },
  };
  const currentStatus = statusInfo[status] || statusInfo[ArticleStatus.PENDING];
  
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${currentStatus.color}`}>
      {translate(currentStatus.textKey, status)}
    </span>
  );
};

const AdminArticleOverviewPage: React.FC = () => {
    const { translate } = useLanguage();
    const [articles, setArticles] = useState<Article[]>([]);
    const [journals, setJournals] = useState<Journal[]>([]);
    const [editors, setEditors] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterJournal, setFilterJournal] = useState<string>('ALL');
    const [filterStatus, setFilterStatus] = useState<ArticleStatus | 'ALL'>('ALL');
    const [filterEditor, setFilterEditor] = useState<string>('ALL');
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [currentArticleForReassign, setCurrentArticleForReassign] = useState<Article | null>(null);
    const [newEditorId, setNewEditorId] = useState<string | number>('');
    const [actionMessage, setActionMessage] = useState<{type:'success'|'error', text:string}|null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setActionMessage(null);
        try {
            const [articlesRes, journalsRes, usersRes] = await Promise.all([
                apiService.get<Article[]>('/articles/'),
                apiService.get<Journal[]>('/journals/'),
                apiService.get<User[]>('/users/')
            ]);
            // Faqat to'lovi tasdiqlanganlarni ko'rsatamiz
            const approvedArticles = articlesRes.data.filter(
                art => art.submissionPaymentStatus !== PaymentStatus.PAYMENT_PENDING_ADMIN_APPROVAL
            );
            setArticles(approvedArticles);
            setJournals(journalsRes.data);
            setEditors(usersRes.data.filter(u => u.role === UserRole.JOURNAL_MANAGER));
        } catch (error: any) {
            setActionMessage({type: 'error', text: 'Maʼlumotlarni yuklashda server xatoligi yuz berdi.'});
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const statusOptions: SelectOption[] = [{value: 'ALL', label: translate('all_statuses')}, ...Object.values(ArticleStatus).map(s => ({value: s, label: translate('status_'+s)}))];
    const journalOptions: SelectOption[] = [{value: 'ALL', label: translate('all_journals')}, ...journals.map(j => ({value: j.id, label: j.name}))];
    const editorOptions: SelectOption[] = [{value: 'ALL', label: translate('all_editors')}, ...editors.map(e => ({value: e.id, label: `${e.name} ${e.surname}`}))];

    const filteredArticles = useMemo(() => {
        return articles.filter(art => {
            if (searchTerm && !art.title.toLowerCase().includes(searchTerm.toLowerCase()) && !(art.author.name.toLowerCase().includes(searchTerm.toLowerCase()))) return false;
            if (filterJournal !== 'ALL' && art.journal !== Number(filterJournal)) return false;
            if (filterStatus !== 'ALL' && art.status !== filterStatus) return false;
            if (filterEditor !== 'ALL' && art.assignedEditor !== Number(filterEditor)) return false;
            return true;
        });
    }, [articles, searchTerm, filterJournal, filterStatus, filterEditor]);

    const handleOpenReassignModal = (article: Article) => {
        setCurrentArticleForReassign(article);
        setNewEditorId(article.assignedEditor || '');
        setIsReassignModalOpen(true);
    };
    
    const handleReassignEditor = async () => {
        if (!currentArticleForReassign || !newEditorId) return;
        setIsLoading(true);
        try {
            const formData = createFormData({ assignedEditor: newEditorId });
            await apiService.patch(`/articles/${currentArticleForReassign.id}/`, formData);
            await fetchData();
            setActionMessage({type: 'success', text: translate(LocalizationKeys.ARTICLE_REASSIGNED_SUCCESS_MESSAGE)});
            setIsReassignModalOpen(false);
            setCurrentArticleForReassign(null);
        } catch(error) {
            setActionMessage({type: 'error', text: "Redaktorni tayinlashda xatolik."});
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-3">
                <ArchiveBoxIcon className="h-8 w-8 text-accent-sky" />
                <h1 className="text-3xl font-bold text-accent-sky">{translate(LocalizationKeys.ARTICLE_OVERVIEW_TITLE_ADMIN)}</h1>
            </div>

            {actionMessage && <Alert type={actionMessage.type} message={actionMessage.text} onClose={() => setActionMessage(null)} className="my-4"/>}

            <Card>
                {isLoading ? <LoadingSpinner message={translate('loading_articles_overview')} />
                : filteredArticles.length === 0 && !actionMessage?.text ? (
                    <p className="text-center text-medium-text py-8">{translate(LocalizationKeys.NO_ARTICLES_IN_SYSTEM_MESSAGE)}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                             <thead className="bg-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Sarlavha</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Muallif</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Jurnal</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Redaktor</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Holat</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Amal</th>
                                </tr>
                            </thead>
                            <tbody className="bg-secondary-dark divide-y divide-slate-700">
                                {filteredArticles.map(article => (
                                    <tr key={article.id} className="hover:bg-slate-700/50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-light-text font-medium">{article.title}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-medium-text">{article.author.name} {article.author.surname}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-medium-text">{article.journalName}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-medium-text">{article.assignedEditorName || translate('unassigned')}</td>
                                        <td className="px-4 py-3 whitespace-nowrap"><StatusBadgeAdmin status={article.status} /></td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <Button size="sm" variant="ghost" onClick={() => handleOpenReassignModal(article)} leftIcon={<ArrowsRightLeftIcon className="h-4 w-4"/>}>
                                                {translate('reassign_button')}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {currentArticleForReassign && (
                <Modal isOpen={isReassignModalOpen} onClose={() => setIsReassignModalOpen(false)} title={`${translate(LocalizationKeys.REASSIGN_EDITOR_BUTTON)}: ${currentArticleForReassign.title}`}>
                    <div className="mb-4">
                        <label htmlFor="newEditor" className="block text-sm font-medium text-light-text mb-1">{translate(LocalizationKeys.SELECT_NEW_EDITOR_LABEL)}</label>
                        <select
                            id="newEditor"
                            value={newEditorId}
                            onChange={(e) => setNewEditorId(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-light-text focus:ring-accent-sky focus:border-accent-sky"
                        >
                            <option value="">{translate('select_editor_option')}</option>
                            {editors.map(editor => (
                                <option key={editor.id} value={editor.id}>{editor.name} {editor.surname}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button variant="secondary" onClick={() => setIsReassignModalOpen(false)}>{translate('cancel_button')}</Button>
                        <Button onClick={handleReassignEditor} disabled={!newEditorId || isLoading}>{translate('reassign_button')}</Button>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default AdminArticleOverviewPage;