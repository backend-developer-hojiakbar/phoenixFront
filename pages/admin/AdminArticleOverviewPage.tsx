import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import { ArchiveBoxIcon, FunnelIcon, MagnifyingGlassIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { AdminArticleSummary, ArticleStatus, Journal, User, SelectOption } from '../../types';
import { LocalizationKeys } from '../../constants';
import { useLocation } from 'react-router-dom';
import { api } from '../../services/api';

const StatusBadgeAdmin: React.FC<{ status: ArticleStatus, daysInStatus?: number }> = ({ status, daysInStatus }) => {
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
  const isStuck = daysInStatus && daysInStatus > 30 && (status === ArticleStatus.PENDING || status === ArticleStatus.REVIEWING);
  
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${currentStatus.color} ${isStuck ? 'ring-2 ring-red-500 animate-pulse-fast' : ''}`}>
      {translate(currentStatus.textKey, status)} {isStuck ? `(${daysInStatus} ${translate('days_short_label')})` : ''}
    </span>
  );
};


const AdminArticleOverviewPage: React.FC = () => {
    const { translate } = useLanguage();
    const location = useLocation();
    const [articles, setArticles] = useState<AdminArticleSummary[]>([]);
    const [journals, setJournals] = useState<Pick<Journal, 'id' | 'name'>[]>([]);
    const [editors, setEditors] = useState<Pick<User, 'id' | 'name' | 'surname'>[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterJournal, setFilterJournal] = useState<string>('ALL');
    const [filterStatus, setFilterStatus] = useState<ArticleStatus | 'ALL'>((location.state as any)?.filterStuck ? ArticleStatus.PENDING : 'ALL');
    const [filterEditor, setFilterEditor] = useState<string>('ALL');
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [currentArticleForReassign, setCurrentArticleForReassign] = useState<AdminArticleSummary | null>(null);
    const [newEditorId, setNewEditorId] = useState<string>('');
    const [actionMessage, setActionMessage] = useState<{type:'success'|'error', text:string}|null>(null);

    const fetchData = () => {
        setIsLoading(true);
        Promise.all([
            api.get('/articles/'),
            api.get('/journals/'),
            api.get('/users/?role=journal_manager')
        ]).then(([articlesData, journalsData, editorsData]) => {
            setArticles(articlesData);
            setJournals(journalsData);
            setEditors(editorsData);
        }).catch(err => {
            setActionMessage({type: 'error', text: 'Failed to load data.'})
        }).finally(() => {
            setIsLoading(false);
        });
    }

    useEffect(() => {
        fetchData();
    }, []);

    const statusOptions: SelectOption[] = [{value: 'ALL', label: translate('all_statuses')}, ...Object.values(ArticleStatus).map(s => ({value: s, label: translate('status_'+s.toLowerCase() as any, s)}))];
    const journalOptions: SelectOption[] = [{value: 'ALL', label: translate('all_journals')}, ...journals.map(j => ({value: j.id, label: j.name}))];
    const editorOptions: SelectOption[] = [{value: 'ALL', label: translate('all_editors')}, ...editors.map(e => ({value: e.id, label: `${e.name} ${e.surname}`}))];


    const filteredArticles = useMemo(() => {
        return articles.filter(art => {
            if (searchTerm && !art.title.toLowerCase().includes(searchTerm.toLowerCase()) && !(art.authorName && art.authorName.toLowerCase().includes(searchTerm.toLowerCase()))) return false;
            if (filterJournal !== 'ALL' && art.journalId !== filterJournal) return false;
            if (filterStatus !== 'ALL' && art.status !== filterStatus) return false;
            if (filterEditor !== 'ALL' && art.assignedEditorId !== filterEditor) return false;
            return true;
        });
    }, [articles, searchTerm, filterJournal, filterStatus, filterEditor]);

    const handleOpenReassignModal = (article: AdminArticleSummary) => {
        setCurrentArticleForReassign(article);
        setNewEditorId(article.assignedEditorId || '');
        setIsReassignModalOpen(true);
    };
    
    const handleReassignEditor = async () => {
        if (!currentArticleForReassign || !newEditorId) return;
        
        try {
            await api.patch(`/articles/${currentArticleForReassign.id}/`, { assignedEditor: newEditorId });
            setActionMessage({type: 'success', text: translate(LocalizationKeys.ARTICLE_REASSIGNED_SUCCESS_MESSAGE)});
            setIsReassignModalOpen(false);
            setCurrentArticleForReassign(null);
            fetchData();
        } catch(err: any) {
            setActionMessage({type: 'error', text: err.message || 'Failed to reassign editor.'});
        }
    };


    if (isLoading && articles.length === 0) {
        return <LoadingSpinner message={translate('loading_articles_overview')} />;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-3">
                <ArchiveBoxIcon className="h-8 w-8 text-accent-sky" />
                <h1 className="text-3xl font-bold text-accent-sky">{translate(LocalizationKeys.ARTICLE_OVERVIEW_TITLE_ADMIN)}</h1>
            </div>

            {actionMessage && <Alert type={actionMessage.type} message={actionMessage.text} onClose={() => setActionMessage(null)} className="my-4"/>}

            <Card title={translate('filter_options_title')} icon={<FunnelIcon className="h-5 w-5 text-accent-purple"/>}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <Input 
                        label={translate('search_articles_title_author_label')}
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)}
                        leftIcon={<MagnifyingGlassIcon className="h-4 w-4 text-slate-400"/>}
                    />
                     <div>
                        <label htmlFor="journalFilter" className="block text-sm font-medium text-light-text mb-1">{translate(LocalizationKeys.FILTER_BY_JOURNAL_LABEL)}</label>
                        <select id="journalFilter" value={filterJournal} onChange={e => setFilterJournal(e.target.value)} className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-light-text text-sm">
                            {journalOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="statusFilterAdmin" className="block text-sm font-medium text-light-text mb-1">{translate(LocalizationKeys.FILTER_BY_STATUS_LABEL)}</label>
                        <select id="statusFilterAdmin" value={filterStatus} onChange={e => setFilterStatus(e.target.value as ArticleStatus | 'ALL')} className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-light-text text-sm">
                            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="editorFilter" className="block text-sm font-medium text-light-text mb-1">{translate(LocalizationKeys.ASSIGNED_EDITOR_LABEL)}</label>
                        <select id="editorFilter" value={filterEditor} onChange={e => setFilterEditor(e.target.value)} className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-light-text text-sm">
                           {editorOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                </div>
            </Card>

            <Card>
                {isLoading ? <LoadingSpinner message={translate('loading_articles_overview')} /> : 
                !filteredArticles.length ? (
                    <p className="text-center text-medium-text py-8">{translate(LocalizationKeys.NO_ARTICLES_IN_SYSTEM_MESSAGE)}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{translate('article_title_label')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{translate(LocalizationKeys.AUTHOR_NAME_LABEL)}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{translate('journal_label')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{translate(LocalizationKeys.ASSIGNED_EDITOR_LABEL)}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{translate('status_label')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{translate('actions_label')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-secondary-dark divide-y divide-slate-700">
                                {filteredArticles.map(article => (
                                    <tr key={article.id} className="hover:bg-slate-700/50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-light-text font-medium">{article.title}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-medium-text">{article.authorName}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-medium-text">{article.journalName}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-medium-text">{article.assignedEditorName || translate('unassigned')}</td>
                                        <td className="px-4 py-3 whitespace-nowrap"><StatusBadgeAdmin status={article.status} daysInStatus={article.daysInCurrentStatus} /></td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <Button size="sm" variant="ghost" onClick={() => handleOpenReassignModal(article)} leftIcon={<ArrowsRightLeftIcon className="h-4 w-4"/>} title={translate(LocalizationKeys.REASSIGN_EDITOR_BUTTON)}>
                                                {translate(LocalizationKeys.REASSIGN_EDITOR_BUTTON)}
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
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-light-text focus:ring-accent-sky"
                        >
                            <option value="">{translate('select_editor_option')}</option>
                            {editors.map(editor => (
                                <option key={editor.id} value={editor.id}>{editor.name} {editor.surname}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button variant="secondary" onClick={() => setIsReassignModalOpen(false)}>{translate('cancel_button')}</Button>
                        <Button onClick={handleReassignEditor} disabled={!newEditorId}>{translate('reassign_button')}</Button>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default AdminArticleOverviewPage;