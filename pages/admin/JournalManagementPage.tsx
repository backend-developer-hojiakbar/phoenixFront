import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Journal, User, Language } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Alert from '../../components/common/Alert';
import { PencilIcon, TrashIcon, BookOpenIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { LocalizationKeys } from '../../constants';
import { api } from '../../services/api';

const JournalManagementPage: React.FC = () => {
  const { translate, language } = useLanguage();

  const [journals, setJournals] = useState<Journal[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);
  const [formData, setFormData] = useState<Partial<Journal & { manager_id?: string | number }>>({});
  const [rulesFile, setRulesFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState<{type:'success'|'error', text:string}|null>(null);

  const fetchData = () => {
      setIsLoading(true);
      setIsDataLoaded(false);
      Promise.all([
          api.get('/journals/'),
          api.get('/users/') // Barcha foydalanuvchilarni olamiz
      ]).then(([journalsData, usersData]) => {
          setJournals(journalsData);
          setAllUsers(usersData);
          setIsDataLoaded(true);
      }).catch(err => {
          setActionMessage({type: 'error', text: err.message || 'Failed to load page data.'});
      }).finally(() => {
          setIsLoading(false);
      });
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (journal: Journal | null = null) => {
    setFormError(null);
    if (!isDataLoaded || allUsers.length === 0) {
        setActionMessage({type: 'error', text: "Jurnal yaratish/tahrirlash uchun tizimda foydalanuvchilar bo'lishi kerak."});
        return;
    }
    setEditingJournal(journal);
    
    if (journal && journal.manager) {
        setFormData({ ...journal, manager_id: journal.manager.id });
    } else {
        setFormData({ manager_id: allUsers.length > 0 ? allUsers[0].id : undefined });
    }

    setRulesFile(null);
    setTemplateFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJournal(null);
    setFormData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'rules' | 'template') => {
    const file = e.target.files?.[0];
    if(file) {
        if(fileType === 'rules') setRulesFile(file);
        else setTemplateFile(file);
    }
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!formData.name || !formData.description || !formData.manager_id) {
      setFormError(translate('name_desc_manager_required_error'));
      return;
    }
    
    setIsSubmitting(true);
    const dataToSend = new FormData();
    
    dataToSend.append('name', formData.name);
    dataToSend.append('description', formData.description);
    dataToSend.append('manager_id', String(formData.manager_id));
    
    if (formData.issn) dataToSend.append('issn', formData.issn);
    if (formData.publisher) dataToSend.append('publisher', formData.publisher);
    if (rulesFile) dataToSend.append('rulesFilePath', rulesFile);
    if (templateFile) dataToSend.append('templateFilePath', templateFile);
    
    const apiCall = editingJournal 
        ? api.patch(`/journals/${editingJournal.id}/`, dataToSend) 
        : api.post('/journals/', dataToSend);

    try {
        await apiCall;
        setActionMessage({type: 'success', text: editingJournal ? translate('journal_updated_successfully') : translate('journal_created_successfully') });
        fetchData();
        handleCloseModal();
    } catch (err: any) {
        setFormError(err.message || 'An unknown error occurred.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async (journalId: string | number) => {
    if (window.confirm(translate('confirm_delete_journal_prompt'))) {
      setIsSubmitting(true);
      try {
        await api.delete(`/journals/${journalId}/`);
        setActionMessage({type: 'success', text: translate('journal_deleted_successfully') });
        fetchData();
      } catch(err: any) {
        setActionMessage({type: 'error', text: err.message || 'Failed to delete journal.'});
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const filteredJournals = useMemo(() => {
    return journals.filter(journal =>
      (journal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (journal.description && journal.description.toLowerCase().includes(searchTerm.toLowerCase()))) 
    );
  }, [journals, searchTerm]);
  
  const getEditorName = (editor?: User) => {
    return editor ? `${editor.name} ${editor.surname}` : translate('unassigned');
  };

  const getJournalDisplayName = (journal: Journal) => {
    if (language === Language.UZ && journal.name_uz) return journal.name_uz;
    if (language === Language.RU && journal.name_ru) return journal.name_ru;
    return journal.name;
  };
  
  if (isLoading && !isDataLoaded) {
    return <LoadingSpinner message={translate('loading_journals')} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-accent-sky">{translate(LocalizationKeys.JURNALLARNI_BOSHQARISH_ADMIN)}</h1>
        <Button 
            onClick={() => handleOpenModal()} 
            leftIcon={<BookOpenIcon className="h-5 w-5"/>} 
            disabled={!isDataLoaded || allUsers.length === 0}
            title={!isDataLoaded ? "Ma'lumotlar yuklanmoqda..." : allUsers.length === 0 ? "Jurnal qo'shish uchun tizimda foydalanuvchilar bo'lishi kerak" : ""}
        >
            {translate('add_new_journal_button')}
        </Button>
      </div>
      
      {actionMessage && <Alert type={actionMessage.type} message={actionMessage.text} onClose={() => setActionMessage(null)} className="my-4"/>}

      <Card>
           <Input 
                label={translate('search_journals_label')}
                placeholder={translate('type_to_search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400"/>}
                wrapperClassName="mb-0"
            />
       </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? <LoadingSpinner /> : filteredJournals.length === 0 ? (
            <p className="text-center text-medium-text py-8 col-span-full">{translate('no_journals_found_criteria')}</p>
        ) : (
            filteredJournals.map(journal => (
            <Card key={journal.id} title={getJournalDisplayName(journal)} gradient className="flex flex-col justify-between">
                <div>
                    <p className="text-sm text-medium-text mb-2 line-clamp-3">{journal.description}</p>
                    <p className="text-xs text-slate-400 mb-1">{translate('manager_label')} {getEditorName(journal.manager)}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700 flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(journal)} title={translate('edit_journal_button')}>
                        <PencilIcon className="h-4 w-4"/>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(journal.id)} className="text-red-400 hover:text-red-300" title={translate('delete_journal_button')}>
                        <TrashIcon className="h-4 w-4"/>
                    </Button>
                </div>
            </Card>
            ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingJournal ? translate('edit_journal_modal_title') : translate('add_new_journal_modal_title')} size="lg">
        {formError && <Alert type="error" message={formError} onClose={() => setFormError(null)} className="mb-4" />}
        <Input label={translate('journal_name_label')} name="name" value={formData.name || ''} onChange={handleChange} required />
        <Textarea label={translate('journal_description_label')} name="description" value={formData.description || ''} onChange={handleChange} rows={3} required />
        <Input label="ISSN" name="issn" value={formData.issn || ''} onChange={handleChange} placeholder="e.g. 1234-5678"/>
        
        <div className="mb-4">
            <label htmlFor="manager_id" className="block text-sm font-medium text-light-text mb-1">{translate('assign_manager_label')}</label>
            <select
              id="manager_id"
              name="manager_id"
              value={String(formData.manager_id || '')}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-light-text focus:ring-2 focus:ring-accent-sky"
            >
              <option value="" disabled>{translate('select_editor_option')}</option>
              {allUsers.map(user => <option key={user.id} value={user.id}>{user.name} {user.surname} ({user.role})</option>)}
            </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="rulesFile" className="block text-sm font-medium text-light-text mb-1">{translate('rules_file_pdf_doc_label')}</label>
                <input type="file" id="rulesFile" name="rulesFile" onChange={(e) => handleFileChange(e, 'rules')} accept=".pdf,.doc,.docx" className="w-full text-sm text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0"/>
                {editingJournal && formData.rulesFilePath && !rulesFile && <p className="text-xs text-medium-text mt-1">{translate('current_file_label')} {String(formData.rulesFilePath).split('/').pop()}</p>}
            </div>
            <div>
                <label htmlFor="templateFile" className="block text-sm font-medium text-light-text mb-1">{translate('template_file_doc_label')}</label>
                <input type="file" id="templateFile" name="templateFile" onChange={(e) => handleFileChange(e, 'template')} accept=".doc,.docx" className="w-full text-sm text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0"/>
                {editingJournal && formData.templateFilePath && !templateFile && <p className="text-xs text-medium-text mt-1">{translate('current_file_label')} {String(formData.templateFilePath).split('/').pop()}</p>}
            </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <Button variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>{translate('cancel_button')}</Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={isSubmitting}>{editingJournal ? translate('save_changes_button') : translate('create_journal_button')}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default JournalManagementPage;