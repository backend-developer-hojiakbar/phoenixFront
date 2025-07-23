import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import { DocumentArrowUpIcon, MagnifyingGlassIcon, ArrowLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Journal, JournalCategory, JournalType as IJournalType } from '../../types';
import apiService, { createFormData } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Textarea from '../../components/common/Textarea';
import { useNavigate } from 'react-router-dom';

const SubmitArticlePage: React.FC = () => {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [abstract_en, setAbstract] = useState('');
  const [keywords_en, setKeywords] = useState('');
  const [articleFile, setArticleFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  
  const [journals, setJournals] = useState<Journal[]>([]);
  const [categories, setCategories] = useState<JournalCategory[]>([]);
  const [journalTypes, setJournalTypes] = useState<IJournalType[]>([]);
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTypeId, setFilterTypeId] = useState<string>('');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('');
  
  const isPartner = useMemo(() => {
    if (!user) return false;
    return user.name.toLowerCase().includes('hamkor') || user.surname.toLowerCase().includes('hamkor');
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoadingData(true);
        try {
            const [journalsRes, categoriesRes, typesRes] = await Promise.all([
                apiService.get<Journal[]>('/journals/'),
                apiService.get<JournalCategory[]>('/journal-categories/'),
                apiService.get<IJournalType[]>('/journal-types/'),
            ]);
            setJournals(journalsRes.data);
            setCategories(categoriesRes.data);
            setJournalTypes(typesRes.data);
        } catch (err) {
            setError("Ma'lumotlarni yuklashda xatolik yuz berdi.");
        } finally {
            setIsLoadingData(false);
        }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!title || !abstract_en || !keywords_en || !articleFile || !selectedJournal || !receiptFile) {
      setError("Iltimos, barcha maydonlarni to'ldiring va fayllarni yuklang.");
      return;
    }

    setIsSubmitting(true);
    const dataToSubmit = {
      title, abstract_en, keywords_en, journal: selectedJournal.id, 
      category: "Default",
      submissionReceiptFile: receiptFile, finalVersionFile: articleFile,
    };
    const formData = createFormData(dataToSubmit);

    try {
        await apiService.post('/articles/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccessMessage("Maqola muvaffaqiyatli yuborildi!");
        setTimeout(() => navigate('/my-articles'), 2000);
    } catch (err: any) {
        const errorMessage = err.response?.data ? Object.values(err.response.data).flat().join(' ') : "Xatolik yuz berdi.";
        setError(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const filteredJournals = useMemo(() => {
      return journals.filter(j => 
          (!filterTypeId || j.journal_type.id === Number(filterTypeId)) &&
          (!filterCategoryId || j.category?.id === Number(filterCategoryId)) &&
          (!searchTerm || j.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [journals, filterTypeId, filterCategoryId, searchTerm]);
  
  if (isLoadingData) {
    return <LoadingSpinner message="Jurnallar yuklanmoqda..." />;
  }
  
  const renderJournalSelectionView = () => (
    <div className="space-y-6">
        <Card>
            <h3 className="text-lg font-semibold text-light-text mb-4">1. Jurnalni tanlang</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Input leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400"/>} placeholder="Qidiruv..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} wrapperClassName="mb-0" />
                <select value={filterTypeId} onChange={e => setFilterTypeId(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-light-text focus:ring-accent-sky focus:border-accent-sky">
                    <option value="">Barcha turlar</option>
                    {journalTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                </select>
                <select value={filterCategoryId} onChange={e => setFilterCategoryId(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-light-text focus:ring-accent-sky focus:border-accent-sky">
                    <option value="">Barcha kategoriyalar</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJournals.length > 0 ? filteredJournals.map(journal => (
                    <div key={journal.id} onClick={() => setSelectedJournal(journal)}
                        className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden cursor-pointer transition-all duration-300 hover:border-accent-purple hover:shadow-lg hover:shadow-accent-purple/10 transform hover:-translate-y-1 flex flex-col">
                        <img src={journal.image_url || 'https://via.placeholder.com/400x200?text=Jurnal+Rasmi'} alt={journal.name} className="w-full h-40 object-cover" />
                        <div className="p-4 flex flex-col flex-grow">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="bg-sky-500/20 text-sky-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                                    {journal.journal_type.name}
                                </span>
                                {journal.category && (
                                    <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                                        {journal.category.name}
                                    </span>
                                )}
                            </div>
                            <h4 className="font-bold text-light-text text-lg flex-grow">{journal.name}</h4>
                            
                            <div className="mt-auto pt-3 border-t border-slate-700">
                                <div className="flex items-center text-xs text-slate-400">
                                    <UserCircleIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                    <span>Redaktor: {journal.manager ? `${journal.manager.name} ${journal.manager.surname}` : 'Tayinlanmagan'}</span>
                                </div>
                                <p className="text-lg font-bold mt-2 text-accent-sky">
                                    {new Intl.NumberFormat('uz-UZ').format(Number(isPartner ? journal.partner_price : journal.regular_price))} UZS
                                </p>
                            </div>
                        </div>
                    </div>
                )) : <p className="text-medium-text col-span-full text-center py-10">Filtrga mos jurnallar topilmadi.</p>}
            </div>
        </Card>
    </div>
  );
  
  const renderArticleSubmissionView = () => (
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-light-text">2. Maqola ma'lumotlari</h3>
                        <Button variant="secondary" size="sm" onClick={() => setSelectedJournal(null)} leftIcon={<ArrowLeftIcon className="h-4 w-4"/>}>
                            Jurnalni o'zgartirish
                        </Button>
                    </div>
                    <div className="flex items-start p-4 bg-slate-800 rounded-lg gap-4 border border-slate-700">
                        <img src={selectedJournal?.image_url || 'https://via.placeholder.com/150x80'} alt={selectedJournal?.name} className="w-32 h-20 object-cover rounded-md flex-shrink-0" />
                        <div>
                             <h4 className="font-bold text-light-text text-xl">{selectedJournal?.name}</h4>
                             <p className="text-lg font-bold mt-1 text-accent-sky">
                                {new Intl.NumberFormat('uz-UZ').format(Number(isPartner ? selectedJournal?.partner_price : selectedJournal?.regular_price))} UZS
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <Input label="Maqola sarlavhasi" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    <Textarea label="Annotatsiya (ingliz tilida)" name="abstract_en" value={abstract_en} onChange={(e) => setAbstract(e.target.value)} required rows={5} />
                    <Input label="Kalit so'zlar (vergul bilan ajrating)" name="keywords_en" value={keywords_en} onChange={(e) => setKeywords(e.target.value)} required />
                </Card>
            </div>
            
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <h3 className="text-lg font-semibold text-light-text mb-3">3. Fayllarni yuklash</h3>
                    <div className='space-y-4'>
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Maqola fayli (.doc, .pdf)</label>
                            <Input type="file" onChange={(e) => setArticleFile(e.target.files?.[0] || null)} required />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-light-text mb-1">To'lov kvitansiyasi</label>
                            <Input type="file" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} required />
                        </div>
                    </div>
                </Card>
                <Button type="submit" fullWidth isLoading={isSubmitting} disabled={isSubmitting} leftIcon={<DocumentArrowUpIcon className="h-5 w-5"/>}>
                    Maqolani Yuborish
                </Button>
            </div>
        </div>
      </form>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-accent-sky">Yangi Maqola Yuborish</h1>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      {!selectedJournal ? renderJournalSelectionView() : renderArticleSubmissionView()}
    </div>
  );
};

export default SubmitArticlePage;