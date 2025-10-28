import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import { ArchiveBoxIcon, FunnelIcon, MagnifyingGlassIcon, ArrowsRightLeftIcon, DocumentTextIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { Article, ArticleStatus, Journal, User, UserRole, PaymentStatus } from '../../types';
import { LocalizationKeys } from '../../constants';
import apiService, { createFormData } from '../../services/apiService';

// Define SelectOption interface inline since it's not in the types file
interface SelectOption {
  value: string | number;
  label: string;
}

const StatusBadgeAdmin: React.FC<{ status: ArticleStatus }> = ({ status }) => {
  const { translate } = useLanguage();
  const statusInfo = {
    [ArticleStatus.PENDING]: { textKey: 'status_pending', color: 'modern-badge modern-badge-warning' },
    [ArticleStatus.REVIEWING]: { textKey: 'status_reviewing', color: 'modern-badge modern-badge-secondary' },
    [ArticleStatus.NEEDS_REVISION]: { textKey: 'status_needs_revision', color: 'modern-badge modern-badge-warning' },
    [ArticleStatus.ACCEPTED]: { textKey: 'status_accepted', color: 'modern-badge modern-badge-success' },
    [ArticleStatus.REJECTED]: { textKey: 'status_rejected', color: 'modern-badge modern-badge-danger' },
    [ArticleStatus.PUBLISHED]: { textKey: LocalizationKeys.STATUS_PUBLISHED, color: 'modern-badge modern-badge-primary' },
  };
  const currentStatus = statusInfo[status] || statusInfo[ArticleStatus.PENDING];
  
  return (
    <span className={currentStatus.color}>
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
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <ArchiveBoxIcon className="h-6 w-6 sm:h-8 sm:w-8 text-accent-sky flex-shrink-0" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-accent-sky">{translate(LocalizationKeys.ARTICLE_OVERVIEW_TITLE_ADMIN)}</h1>
                </div>
            </div>

            {/* Action Message */}
            {actionMessage && <Alert type={actionMessage.type} message={actionMessage.text} onClose={() => setActionMessage(null)} className="my-4" />}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="modern-dashboard-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-medium-text">Jami maqolalar</p>
                            <p className="text-2xl font-bold text-light-text mt-1">{articles.length}</p>
                        </div>
                        <div className="p-3 bg-sky-500/10 rounded-lg">
                            <DocumentTextIcon className="h-6 w-6 text-sky-500" />
                        </div>
                    </div>
                </div>
                
                <div className="modern-dashboard-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-medium-text">Ko'rib chiqilmoqda</p>
                            <p className="text-2xl font-bold text-light-text mt-1">{articles.filter(a => a.status === ArticleStatus.REVIEWING).length}</p>
                        </div>
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                            <ArchiveBoxIcon className="h-6 w-6 text-purple-500" />
                        </div>
                    </div>
                </div>
                
                <div className="modern-dashboard-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-medium-text">Qabul qilingan</p>
                            <p className="text-2xl font-bold text-light-text mt-1">{articles.filter(a => a.status === ArticleStatus.ACCEPTED).length}</p>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-lg">
                            <DocumentTextIcon className="h-6 w-6 text-emerald-500" />
                        </div>
                    </div>
                </div>
                
                <div className="modern-dashboard-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-medium-text">Nashr etilgan</p>
                            <p className="text-2xl font-bold text-light-text mt-1">{articles.filter(a => a.status === ArticleStatus.PUBLISHED).length}</p>
                        </div>
                        <div className="p-3 bg-amber-500/10 rounded-lg">
                            <DocumentTextIcon className="h-6 w-6 text-amber-500" />
                        </div>
                    </div>
                </div>
                
                {/* Printed Publications Card */}
                <div className="modern-dashboard-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-medium-text">Bosma Nashrlar</p>
                            <Button 
                                onClick={() => window.location.hash = '#/admin/printed-publications'}
                                className="mt-2 modern-button modern-button-secondary text-sm"
                            >
                                Boshqarish
                            </Button>
                        </div>
                        <div className="p-3 bg-indigo-500/10 rounded-lg">
                            <BookOpenIcon className="h-6 w-6 text-indigo-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Card */}
            <Card title={translate('filter_options_title')} icon={<FunnelIcon className="h-6 w-6 text-accent-purple"/>}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                            type="text"
                            placeholder={translate('search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="modern-input pl-10"
                        />
                    </div>
                    <div>
                        <label htmlFor="journalFilter" className="block text-sm font-medium text-light-text mb-1">
                            {translate(LocalizationKeys.FILTER_BY_JOURNAL_LABEL)}
                        </label>
                        <select 
                            id="journalFilter"
                            value={filterJournal} 
                            onChange={e => setFilterJournal(e.target.value)}
                            className="modern-select"
                        >
                            {journalOptions.map(opt => <option key={opt.value} value={opt.value as string}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="statusFilter" className="block text-sm font-medium text-light-text mb-1">
                            {translate(LocalizationKeys.FILTER_BY_STATUS_LABEL)}
                        </label>
                        <select 
                            id="statusFilter"
                            value={filterStatus} 
                            onChange={e => setFilterStatus(e.target.value as ArticleStatus | 'ALL')}
                            className="modern-select"
                        >
                            {statusOptions.map(opt => <option key={opt.value} value={opt.value as string}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="editorFilter" className="block text-sm font-medium text-light-text mb-1">
                            {translate(LocalizationKeys.FILTER_BY_AUTHOR_LABEL)}
                        </label>
                        <select 
                            id="editorFilter"
                            value={filterEditor} 
                            onChange={e => setFilterEditor(e.target.value)}
                            className="modern-select"
                        >
                            {editorOptions.map(opt => <option key={opt.value} value={opt.value as string}>{opt.label}</option>)}
                        </select>
                    </div>
                </div>
            </Card>
            
            {isLoading ? <LoadingSpinner message={translate('loading_articles_overview')} />
            : filteredArticles.length === 0 && !actionMessage?.text ? (
                <Card title={undefined} icon={undefined}>
                    <div className="text-center py-12">
                        <ArchiveBoxIcon className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                        <h3 className="text-lg font-medium text-light-text mb-2">{translate(LocalizationKeys.NO_ARTICLES_IN_SYSTEM_MESSAGE)}</h3>
                        <p className="text-medium-text mb-4">Hozirda hech qanday maqola topilmadi.</p>
                        <Button 
                          onClick={fetchData} 
                          variant="secondary"
                        >
                          Qayta yuklash
                        </Button>
                    </div>
                </Card>
            ) : (
                <Card title={`Maqolalar (${filteredArticles.length})`} icon={<DocumentTextIcon className="h-6 w-6 text-accent-sky"/>}>
                    <div className="overflow-x-auto rounded-lg border border-slate-700">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Sarlavha</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Muallif</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Jurnal</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Redaktor</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Holat</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Amal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredArticles.map(article => (
                                    <tr key={article.id} className="hover:bg-slate-700/50 transition-colors">
                                        <td className="px-4 py-4 text-sm font-medium text-light-text max-w-xs truncate">{article.title}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-medium-text">{article.author.name} {article.author.surname}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-medium-text max-w-[120px] truncate">{article.journalName}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-medium-text max-w-[120px] truncate">{article.assignedEditorName || translate('unassigned')}</td>
                                        <td className="px-4 py-4 whitespace-nowrap"><StatusBadgeAdmin status={article.status} /></td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                onClick={() => handleOpenReassignModal(article)} 
                                                leftIcon={<ArrowsRightLeftIcon className="h-4 w-4"/>}
                                            >
                                                <span className="hidden xs:inline">{translate('reassign_button')}</span>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Reassign Editor Modal */}
            {currentArticleForReassign && (
                <Modal 
                    isOpen={isReassignModalOpen} 
                    onClose={() => setIsReassignModalOpen(false)} 
                    title={`${translate(LocalizationKeys.REASSIGN_EDITOR_BUTTON)}: ${currentArticleForReassign.title}`}
                >
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="newEditor" className="block text-sm font-medium text-light-text mb-1">{translate(LocalizationKeys.SELECT_NEW_EDITOR_LABEL)}</label>
                            <select
                                id="newEditor"
                                value={newEditorId}
                                onChange={(e) => setNewEditorId(e.target.value)}
                                className="modern-select"
                            >
                                <option value="">{translate('select_editor_option')}</option>
                                {editors.map(editor => (
                                    <option key={editor.id} value={editor.id}>{editor.name} {editor.surname}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                            <Button 
                                variant="secondary" 
                                onClick={() => setIsReassignModalOpen(false)}
                            >
                                {translate('cancel_button')}
                            </Button>
                            <Button 
                                onClick={handleReassignEditor} 
                                disabled={!newEditorId || isLoading} 
                                isLoading={isLoading}
                            >
                                {translate('reassign_button')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminArticleOverviewPage;