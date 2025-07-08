import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Journal, User, UserRole, JournalCategory, SelectOption } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Alert from '../../components/common/Alert';
import { PencilIcon, TrashIcon, BookOpenIcon, MagnifyingGlassIcon, QueueListIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import apiService, { createFormData } from '../../services/apiService';
import { LocalizationKeys } from '../../constants';

const JournalManagementPage: React.FC = () => {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [journals, setJournals] = useState<Journal[]>([]);
  const [editors, setEditors] = useState<User[]>([]);
  const [journalCategories, setJournalCategories] = useState<JournalCategory[]>([]);
  const [journalTypes, setJournalTypes] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);
  const [formData, setFormData] = useState<Partial<Journal> & { manager_id?: number; category_id?: number }>({});
  const [rulesFile, setRulesFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState<{type:'success'|'error', text:string}|null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
        const requests = [
            apiService.get<Journal[]>('/journals/'),
            apiService.get<JournalCategory[]>('/journal-categories/'),
            apiService.get<SelectOption[]>('/journal-types/')
        ];

        if (user?.role === UserRole.ADMIN) {
            requests.push(apiService.get<User[]>('/users/'));
        }

        const [journalsRes, categoriesRes, typesRes, usersRes] = await Promise.all(requests);
        
        setJournals(journalsRes.data);
        setJournalCategories(categoriesRes.data);
        setJournalTypes(typesRes.data);

        if (usersRes) {
            setEditors(usersRes.data.filter(u => u.role === UserRole.JOURNAL_MANAGER));
        }

    } catch (error: any) {
        setActionMessage({type: 'error', text: 'Maʼlumotlarni yuklashda xatolik yuz berdi.'});
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleOpenModal = (journal: Journal | null = null) => {
    setEditingJournal(journal);
    setFormData(journal 
        ? { ...journal, manager_id: journal.manager?.id, category_id: journal.category?.id } 
        : { manager_id: editors[0]?.id, journal_type: journalTypes[0]?.value as 'local', category_id: journalCategories[0]?.id });
    setRulesFile(null);
    setTemplateFile(null);
    setFormError(null);
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
    if (!formData.name || !formData.description || !formData.manager_id || !formData.journal_type || !formData.category_id) {
      setFormError('Barcha maydonlar, jumladan tur va kategoriya ham toʻldirilishi shart.');
      return;
    }
    
    setIsLoading(true);
    const dataToSubmit: Record<string, any> = { ...formData };
    if (rulesFile) dataToSubmit.rulesFilePath = rulesFile;
    if (templateFile) dataToSubmit.templateFilePath = templateFile;
    
    delete dataToSubmit.manager;
    delete dataToSubmit.category;

    const preparedFormData = createFormData(dataToSubmit);

    try {
        const config = { headers: { 'Content-Type': 'multipart/form-data' } };
        if (editingJournal) {
            await apiService.patch(`/journals/${editingJournal.id}/`, preparedFormData, config);
            setActionMessage({ type: 'success', text: translate('journal_updated_successfully') });
        } else {
            await apiService.post('/journals/', preparedFormData, config);
            setActionMessage({ type: 'success', text: translate('journal_created_successfully') });
        }
        await fetchData();
        handleCloseModal();
    } catch (err: any) {
        const errors = err.response?.data;
        const errorMessage = errors ? Object.values(errors).flat().join(' ') : 'Amalni bajarishda xatolik.';
        setFormError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  const handleDelete = async (journalId: number) => {
    if (window.confirm(translate('confirm_delete_journal_prompt'))) {
      setIsLoading(true);
      try {
        await apiService.delete(`/journals/${journalId}/`);
        setActionMessage({ type: 'success', text: translate('journal_deleted_successfully') });
        await fetchData();
      } catch (error) {
        setActionMessage({type: 'error', text: 'Jurnalni oʻchirishda xatolik.'});
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const filteredJournals = useMemo(() => {
    let jrnls = journals;
    if (user?.role === UserRole.JOURNAL_MANAGER) {
        jrnls = journals.filter(j => j.manager?.id === user.id);
    }
    return jrnls.filter(journal =>
      (journal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (journal.description && journal.description.toLowerCase().includes(searchTerm.toLowerCase()))) 
    );
  }, [journals, searchTerm, user]);
  
  const getEditorName = (editor?: User) => {
    return editor ? `${editor.name} ${editor.surname}` : translate('unassigned');
  };

  const pageTitle = user?.role === UserRole.ADMIN 
    ? translate(LocalizationKeys.JURNALLARNI_BOSHQARISH_ADMIN) 
    : translate(LocalizationKeys.MENING_JURNALIM);


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-accent-sky">{pageTitle}</h1>
        {user?.role === UserRole.ADMIN && (
            <Button onClick={() => handleOpenModal()} leftIcon={<BookOpenIcon className="h-5 w-5"/>}>
                {translate('add_new_journal_button')}
            </Button>
        )}
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
        {isLoading ? (<div className="col-span-full"><LoadingSpinner message={translate('loading_journals')} /></div>) 
        : filteredJournals.length === 0 && !actionMessage?.text ? (
            <p className="text-center text-medium-text py-8 col-span-full">{translate('no_journals_found_criteria')}</p>
        ) : (
            filteredJournals.map(journal => (
            <Card key={journal.id} title={journal.name} gradient className="flex flex-col justify-between">
                <div>
                    <p className="text-sm text-medium-text mb-2 line-clamp-3">{journal.description}</p>
                    <p className="text-xs text-slate-400 mb-1">{translate('manager_label')} {getEditorName(journal.manager)}</p>
                    {journal.category && <p className="text-xs text-slate-400 mb-1">Kategoriya: {journal.category.name}</p>}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700 flex flex-wrap gap-2">
                    {user?.role === UserRole.ADMIN && (
                        <>
                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(journal)} title={translate('edit_journal_button')}><PencilIcon className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(journal.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10" title={translate('delete_journal_button')}><TrashIcon className="h-4 w-4"/></Button>
                        </>
                    )}
                    {(user?.role === UserRole.JOURNAL_MANAGER && journal.manager?.id === user.id) && (
                         <Button variant="ghost" size="sm" onClick={() => navigate(`/journal-issue-management/${journal.id}`)} title={translate(LocalizationKeys.MANAGE_JOURNAL_ISSUES_BUTTON)} leftIcon={<QueueListIcon className="h-4 w-4"/>}>
                            {translate(LocalizationKeys.MANAGE_JOURNAL_ISSUES_BUTTON)}
                        </Button>
                    )}
                </div>
            </Card>
            ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingJournal ? translate('edit_journal_modal_title') : translate('add_new_journal_modal_title')} size="lg">
        {formError && <Alert type="error" message={formError} onClose={() => setFormError(null)} className="mb-4" />}
        <Input label={translate('journal_name_label')} name="name" value={formData.name || ''} onChange={handleChange} required />
        <Textarea label={translate('journal_description_label')} name="description" value={formData.description || ''} onChange={handleChange} rows={3} required />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div>
                <label htmlFor="journal_type" className="block text-sm font-medium text-light-text mb-1">Jurnal Turi</label>
                <select id="journal_type" name="journal_type" value={formData.journal_type || ''} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-light-text focus:ring-2 focus:ring-accent-sky">
                    <option value="" disabled>Turini tanlang</option>
                    {journalTypes.map(type => <option key={String(type.value)} value={String(type.value)}>{type.label}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-light-text mb-1">Kategoriya</label>
                <select id="category_id" name="category_id" value={formData.category_id || ''} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-light-text focus:ring-2 focus:ring-accent-sky">
                    <option value="" disabled>Kategoriyani tanlang</option>
                    {journalCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
            </div>
        </div>

        <Input label={translate('publisher_label')} name="publisher" value={formData.publisher || ''} onChange={handleChange} placeholder={translate('publisher_name_placeholder')}/>

        <div className="my-4">
            <label htmlFor="manager_id" className="block text-sm font-medium text-light-text mb-1">{translate('assign_manager_label')}</label>
            <select id="manager_id" name="manager_id" value={formData.manager_id || ''} onChange={handleChange} required disabled={user?.role !== UserRole.ADMIN} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-light-text focus:ring-2 focus:ring-accent-sky">
              <option value="">{translate('select_editor_option')}</option>
              {editors.map(editor => <option key={editor.id} value={editor.id}>{editor.name} {editor.surname}</option>)}
            </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="rulesFile" className="block text-sm font-medium text-light-text mb-1">{translate('rules_file_pdf_doc_label')}</label>
                <input type="file" id="rulesFile" name="rulesFile" onChange={(e) => handleFileChange(e, 'rules')} accept=".pdf,.doc,.docx" className="w-full text-sm text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-600 file:text-accent-sky hover:file:bg-slate-500"/>
                {editingJournal && formData.rulesFilePath && !rulesFile && <p className="text-xs text-medium-text mt-1">{translate('current_file_label')} {formData.rulesFilePath}</p>}
            </div>
            <div>
                <label htmlFor="templateFile" className="block text-sm font-medium text-light-text mb-1">{translate('template_file_doc_label')}</label>
                <input type="file" id="templateFile" name="templateFile" onChange={(e) => handleFileChange(e, 'template')} accept=".doc,.docx" className="w-full text-sm text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-600 file:text-accent-sky hover:file:bg-slate-500"/>
                {editingJournal && formData.templateFilePath && !templateFile && <p className="text-xs text-medium-text mt-1">{translate('current_file_label')} {formData.templateFilePath}</p>}
            </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <Button variant="secondary" onClick={handleCloseModal} disabled={isLoading}>{translate('cancel_button')}</Button>
          <Button onClick={handleSubmit} isLoading={isLoading} disabled={isLoading}>{editingJournal ? translate('save_changes_button') : translate('create_journal_button')}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default JournalManagementPage;