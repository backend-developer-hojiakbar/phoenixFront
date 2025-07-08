import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { Issue, Journal } from '../../types'; 
import { LocalizationKeys } from '../../constants';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/apiService';

const JournalIssueManagementPage: React.FC = () => {
    const { journalId } = useParams<{ journalId: string }>();
    const { translate } = useLanguage();

    const [journal, setJournal] = useState<Journal | null>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
    const [formData, setFormData] = useState<Partial<Issue>>({});

    const fetchData = async () => {
        if (!journalId) return;
        setIsLoading(true);
        setError(null);
        try {
            const [journalRes, issuesRes] = await Promise.all([
                apiService.get<Journal>(`/journals/${journalId}/`),
                apiService.get<Issue[]>(`/issues/?journal=${journalId}`)
            ]);
            setJournal(journalRes.data);
            setIssues(issuesRes.data);
        } catch (err) {
            setError(translate('journal_not_found'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [journalId]);

    const handleOpenModal = (issue: Issue | null = null) => {
        setEditingIssue(issue);
        setFormData(issue ? { ...issue } : { journal: Number(journalId), isPublished: false, publicationDate: new Date().toISOString().split('T')[0] });
        setIsModalOpen(true);
        setError(null);
        setSuccess(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingIssue(null);
        setFormData({});
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async () => {
        if (!formData.issueNumber || !formData.publicationDate) {
            setError(translate('issue_number_date_required'));
            return;
        }
        
        setIsLoading(true);
        try {
            if (editingIssue) {
                await apiService.patch(`/issues/${editingIssue.id}/`, formData);
                setSuccess(translate(LocalizationKeys.ISSUE_UPDATED_SUCCESS));
            } else {
                await apiService.post('/issues/', formData);
                setSuccess(translate(LocalizationKeys.ISSUE_CREATED_SUCCESS));
            }
            await fetchData();
            handleCloseModal();
        } catch (err) {
            setError("Amalni bajarishda xatolik yuz berdi.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeleteIssue = async (issueIdToDelete: number) => {
        if (window.confirm(translate('confirm_delete_issue_prompt'))) {
            setIsLoading(true);
            try {
                await apiService.delete(`/issues/${issueIdToDelete}/`);
                setSuccess(translate('issue_deleted_successfully'));
                await fetchData();
            } catch (err) {
                setError("Nashrni o'chirishda xatolik.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    if (isLoading && !journal) {
        return <LoadingSpinner message={translate('loading_journal_issues')} />;
    }

    if (error && !journal) { 
        return <Alert type="error" message={error} />;
    }
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-accent-sky">
                    {translate(LocalizationKeys.JOURNAL_ISSUE_MANAGEMENT_TITLE)}: <span className="text-light-text">{journal?.name}</span>
                </h1>
                <Button onClick={() => handleOpenModal(null)} leftIcon={<PlusIcon className="h-5 w-5"/>}>
                    {translate(LocalizationKeys.CREATE_NEW_ISSUE_BUTTON)}
                </Button>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-4" />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} className="mb-4" />}

            {issues.length === 0 ? (
                <Card>
                    <p className="text-center text-medium-text py-8">{translate(LocalizationKeys.NO_ISSUES_FOUND)}</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {issues.map(issue => (
                        <Card key={issue.id} title={issue.issueNumber} gradient className="flex flex-col justify-between">
                            <div>
                                <p className="text-sm text-medium-text mb-1">
                                    {translate(LocalizationKeys.PUBLICATION_DATE_LABEL)}: {new Date(issue.publicationDate).toLocaleDateString()}
                                </p>
                                <p className={`text-sm font-semibold mb-2 ${issue.isPublished ? 'text-accent-emerald' : 'text-amber-400'}`}>
                                    {issue.isPublished ? translate('published_status_true') : translate('published_status_false')}
                                </p>
                                <p className="text-xs text-slate-400 mb-1">{translate(LocalizationKeys.ARTICLES_IN_ISSUE_LABEL)} {issue.articles?.length || 0}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-700 flex flex-wrap gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleOpenModal(issue)} leftIcon={<PencilIcon className="h-4 w-4"/>}>
                                    {translate('edit_button')}
                                </Button>
                                {!issue.isPublished && (
                                     <Button variant="danger" size="sm" onClick={() => handleDeleteIssue(issue.id)} leftIcon={<TrashIcon className="h-4 w-4"/>}>
                                        {translate('delete_button')}
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {isModalOpen && (
                 <Modal 
                    isOpen={isModalOpen} 
                    onClose={handleCloseModal} 
                    title={editingIssue ? translate(LocalizationKeys.EDIT_ISSUE_MODAL_TITLE) : translate(LocalizationKeys.CREATE_ISSUE_MODAL_TITLE)}
                    size="md"
                 >
                    {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-4" />}
                    <Input 
                        label={translate(LocalizationKeys.ISSUE_NUMBER_LABEL)}
                        name="issueNumber"
                        value={formData.issueNumber || ''}
                        onChange={handleChange}
                        placeholder={translate(LocalizationKeys.ISSUE_NUMBER_PLACEHOLDER)}
                        required
                    />
                    <Input 
                        label={translate(LocalizationKeys.PUBLICATION_DATE_LABEL)}
                        type="date"
                        name="publicationDate"
                        value={formData.publicationDate || ''}
                        onChange={handleChange}
                        required
                    />
                     <div className="my-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="isPublished"
                                checked={formData.isPublished || false} 
                                onChange={handleChange} 
                                className="form-checkbox h-5 w-5 text-accent-purple bg-slate-600 border-slate-500 rounded focus:ring-accent-purple"
                            />
                            <span className="text-sm text-light-text">{translate(LocalizationKeys.IS_PUBLISHED_LABEL)}</span>
                        </label>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <Button variant="secondary" onClick={handleCloseModal}>{translate('cancel_button')}</Button>
                        <Button onClick={handleSubmit} isLoading={isLoading}>{editingIssue ? translate('save_changes_button') : translate('create_button')}</Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default JournalIssueManagementPage;