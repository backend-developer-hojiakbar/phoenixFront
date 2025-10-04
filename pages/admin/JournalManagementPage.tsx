import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Journal, User, UserRole, JournalCategory, JournalType as IJournalType } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Alert from '../../components/common/Alert';
import { PencilIcon, TrashIcon, BookOpenIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import apiService, { createFormData } from '../../services/apiService';

// Define SelectOption interface inline since it's not in the types file
interface SelectOption {
  value: string | number;
  label: string;
}

const JournalManagementPage: React.FC = () => {
  const { translate } = useLanguage();
  const { user } = useAuth();

  const [journals, setJournals] = useState<Journal[]>([]);
  const [editors, setEditors] = useState<User[]>([]);
  const [journalCategories, setJournalCategories] = useState<JournalCategory[]>([]);
  const [journalTypes, setJournalTypes] = useState<IJournalType[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);
  const [formData, setFormData] = useState<Partial<Journal> & { manager_id?: number; category_id?: number, journal_type_id?: number, image?: File | null }>({});
  
  const [formError, setFormError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState<{type:'success'|'error', text:string}|null>(null);

  // State for adding new types/categories
  const [showAddType, setShowAddType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const [journalsRes, categoriesRes, typesRes, usersRes] = await Promise.all([
            apiService.get<Journal[]>('/journals/'),
            apiService.get<JournalCategory[]>('/journal-categories/'),
            apiService.get<IJournalType[]>('/journal-types/'),
            user?.role === UserRole.ADMIN ? apiService.get<User[]>('/users/') : Promise.resolve({ data: [] })
        ]);
        
        setJournals(journalsRes.data);
        setJournalCategories(categoriesRes.data);
        setJournalTypes(typesRes.data);
        setEditors(usersRes.data.filter(u => u.role === UserRole.JOURNAL_MANAGER));
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
        ? { ...journal, manager_id: journal.manager?.id, category_id: journal.category?.id, journal_type_id: journal.journal_type.id } 
        : { journal_type_id: journalTypes[0]?.id, category_id: journalCategories[0]?.id });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowAddType(false);
    setShowAddCategory(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files?.[0]) {
        setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!formData.name || !formData.description || !formData.journal_type_id || !formData.category_id) {
      setFormError('Jurnal nomi, tavsifi, turi va kategoriyasi toʻldirilishi shart.');
      return;
    }
    
    setIsLoading(true);
    const preparedFormData = createFormData(formData as Record<string, any>);
    
    try {
        const config = { headers: { 'Content-Type': 'multipart/form-data' } };
        if (editingJournal) {
            await apiService.patch(`/journals/${editingJournal.id}/`, preparedFormData, config);
            setActionMessage({ type: 'success', text: 'Jurnal muvaffaqiyatli yangilandi' });
        } else {
            await apiService.post('/journals/', preparedFormData, config);
            setActionMessage({ type: 'success', text: 'Jurnal muvaffaqiyatli yaratildi' });
        }
        await fetchData();
        handleCloseModal();
    } catch (err: any) {
        const errors = err.response?.data;
        const errorMessage = errors ? Object.entries(errors).map(([key, value]) => `${key}: ${(value as string[]).join(' ')}`).join('; ') : 'Amalni bajarishda xatolik.';
        setFormError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleAddNewItem = async (type: 'type' | 'category') => {
      const name = type === 'type' ? newTypeName : newCategoryName;
      const url = type === 'type' ? '/journal-types/' : '/journal-categories/';
      
      if (!name.trim()) return;

      try {
          await apiService.post(url, { name });
          if (type === 'type') {
              setNewTypeName('');
              setShowAddType(false);
          } else {
              setNewCategoryName('');
              setShowAddCategory(false);
          }
          await fetchData(); // Refresh all data
      } catch (error) {
          setFormError(`Yangi ${type === 'type' ? 'tur' : 'kategoriya'} qo'shishda xatolik`);
      }
  };

  const filteredJournals = useMemo(() => {
    return journals.filter(journal =>
      journal.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [journals, searchTerm]);
  

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <BookOpenIcon className="h-6 w-6 sm:h-8 sm:w-8 text-accent-sky flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-bold text-accent-sky">Jurnallarni Boshqarish</h1>
        </div>
        {user?.role === UserRole.ADMIN && (
            <Button 
              onClick={() => handleOpenModal()} 
              leftIcon={<BookOpenIcon className="h-4 w-4 sm:h-5 sm:w-5"/>} 
              size="sm" 
              className="sm:size-md admin-button-primary hover:opacity-90 transition-opacity"
            >
                Yangi Jurnal Qo'shish
            </Button>
        )}
      </div>
      
      {/* Action Message */}
      {actionMessage && <Alert type={actionMessage.type} message={actionMessage.text} onClose={() => setActionMessage(null)} className="admin-alert admin-alert-success" />}

      {/* Search Filter Card */}
      <Card className="admin-card-gradient" title={undefined} icon={undefined}>
           <div className="admin-filter-grid">
               <Input 
                    placeholder="Jurnallarni qidirish..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"/>}
                    wrapperClassName="mb-0 admin-form-group"
                    className="admin-input"
                />
           </div>
       </Card>

      {/* Journal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {isLoading ? (
          <div className="col-span-full">
            <LoadingSpinner message={'Jurnallar yuklanmoqda'} />
          </div>
        ) : filteredJournals.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-medium-text mb-4">Hozircha jurnallar mavjud emas.</div>
            {user?.role === UserRole.ADMIN && (
              <Button 
                onClick={() => handleOpenModal()} 
                leftIcon={<BookOpenIcon className="h-4 w-4"/>} 
                className="admin-button-primary"
              >
                Birinchi jurnalni qo'shish
              </Button>
            )}
          </div>
        ) : (
          filteredJournals.map(journal => (
            <Card 
              key={journal.id} 
              title={journal.name} 
              icon={undefined} 
              className="admin-card-gradient flex flex-col justify-between hover:shadow-xl transition-all duration-300"
            >
              <div>
                <img 
                  src={journal.image_url || 'https://via.placeholder.com/400x200'} 
                  alt={journal.name} 
                  className="w-full h-32 object-cover rounded-md mb-3" 
                />
                <p className="text-sm text-medium-text mb-3 line-clamp-3">{journal.description}</p>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Turi: {journal.journal_type.name}</p>
                  {journal.category && <p className="text-xs text-slate-400">Kategoriya: {journal.category.name}</p>}
                </div>
              </div>
              {user?.role === UserRole.ADMIN && (
                <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleOpenModal(journal)} 
                    title={'Tahrirlash'} 
                    className="admin-action-button hover:bg-slate-600"
                  >
                    <PencilIcon className="h-4 w-4"/>
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Journal Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingJournal ? 'Jurnalni Tahrirlash' : 'Yangi Jurnal Qo\'shish'} 
        size="lg"
      >
        {formError && <Alert type="error" message={formError} onClose={() => setFormError(null)} className="mb-4 admin-alert admin-alert-error" />}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="admin-form-group">
            <Input 
              label="Jurnal Nomi" 
              name="name" 
              value={formData.name || ''} 
              onChange={handleChange} 
              required 
              className="admin-input"
            />
          </div>
          <div className="admin-form-group">
            <Input 
              label="Rasm" 
              name="image" 
              type="file" 
              onChange={handleFileChange} 
              accept="image/*" 
              className="admin-input"
            />
          </div>
        </div>
        
        <div className="admin-form-group">
          <Textarea 
            label="Tavsifi" 
            name="description" 
            value={formData.description || ''} 
            onChange={handleChange} 
            rows={3} 
            required 
            className="admin-input"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          <div className="admin-card p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-light-text">Jurnal Turi</label>
              <Button 
                type="button" 
                size="sm" 
                onClick={() => setShowAddType(!showAddType)} 
                className="admin-button-secondary hover:bg-slate-600"
              >
                <PlusIcon className="h-4 w-4"/>
              </Button>
            </div>
            <select 
              name="journal_type_id" 
              value={formData.journal_type_id || ''} 
              onChange={handleChange} 
              required 
              className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-light-text focus:ring-2 focus:ring-accent-sky focus:border-accent-sky focus:outline-none text-sm admin-input"
            >
              <option value="" disabled>Turini tanlang</option>
              {journalTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
            </select>
            {showAddType && (
              <div className="mt-3 flex flex-col sm:flex-row items-center gap-2">
                <Input 
                  placeholder="Yangi tur nomi" 
                  value={newTypeName} 
                  onChange={e => setNewTypeName(e.target.value)} 
                  wrapperClassName="flex-grow admin-form-group" 
                  className="admin-input"
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={() => handleAddNewItem('type')} 
                  className="w-full sm:w-auto admin-button-primary"
                >
                  Qo'shish
                </Button>
              </div>
            )}
          </div>
          
          <div className="admin-card p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-light-text">Kategoriya</label>
              <Button 
                type="button" 
                size="sm" 
                onClick={() => setShowAddCategory(!showAddCategory)} 
                className="admin-button-secondary hover:bg-slate-600"
              >
                <PlusIcon className="h-4 w-4"/>
              </Button>
            </div>
            <select 
              name="category_id" 
              value={formData.category_id || ''} 
              onChange={handleChange} 
              required 
              className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-light-text focus:ring-2 focus:ring-accent-sky focus:border-accent-sky focus:outline-none text-sm admin-input"
            >
              <option value="" disabled>Kategoriyani tanlang</option>
              {journalCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            {showAddCategory && (
              <div className="mt-3 flex flex-col sm:flex-row items-center gap-2">
                <Input 
                  placeholder="Yangi kategoriya nomi" 
                  value={newCategoryName} 
                  onChange={e => setNewCategoryName(e.target.value)} 
                  wrapperClassName="flex-grow admin-form-group" 
                  className="admin-input"
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={() => handleAddNewItem('category')} 
                  className="w-full sm:w-auto admin-button-primary"
                >
                  Qo'shish
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          <div className="admin-form-group">
            <Input 
              label="Oddiy Narx (UZS)" 
              name="regular_price" 
              type="number" 
              value={formData.regular_price || ''} 
              onChange={handleChange} 
              className="admin-input"
            />
          </div>
          <div className="admin-form-group">
            <Input 
              label="Hamkor Narxi (UZS)" 
              name="partner_price" 
              type="number" 
              value={formData.partner_price || ''} 
              onChange={handleChange} 
              className="admin-input"
            />
          </div>
        </div>

        <div className="my-4 admin-form-group">
          <label className="block text-sm font-medium text-light-text mb-1">Menejer Tayinlash</label>
          <select 
            name="manager_id" 
            value={formData.manager_id || ''} 
            onChange={handleChange} 
            disabled={user?.role !== UserRole.ADMIN} 
            className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-light-text focus:ring-2 focus:ring-accent-sky focus:border-accent-sky focus:outline-none text-sm admin-input"
          >
            <option value="">Menejerni tanlang</option>
            {editors.map(editor => <option key={editor.id} value={editor.id}>{editor.name} {editor.surname}</option>)}
          </select>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <Button 
            variant="secondary" 
            onClick={handleCloseModal} 
            disabled={isLoading} 
            className="w-full sm:w-auto admin-button-secondary"
          >
            {translate('cancel_button')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            isLoading={isLoading} 
            className="w-full sm:w-auto admin-button-primary"
          >
            {editingJournal ? 'Saqlash' : 'Yaratish'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default JournalManagementPage;