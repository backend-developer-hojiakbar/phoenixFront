import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import { DocumentArrowUpIcon, BuildingLibraryIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { Journal, JournalCategory, JournalType as IJournalType } from '../../types';
import apiService, { createFormData } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Textarea from '../../components/common/Textarea';
import { useNavigate } from 'react-router-dom';

const SubmitArticlePage: React.FC = () => {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState('');
  const [abstract_en, setAbstract] = useState('');
  const [keywords_en, setKeywords] = useState('');
  const [articleFile, setArticleFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  
  // Data from backend
  const [journals, setJournals] = useState<Journal[]>([]);
  const [categories, setCategories] = useState<JournalCategory[]>([]);
  const [journalTypes, setJournalTypes] = useState<IJournalType[]>([]);
  
  // UI State
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Journal Selection State
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedJournalId, setSelectedJournalId] = useState<number | null>(null);
  
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

    if (!title || !abstract_en || !keywords_en || !articleFile || !selectedJournalId || !receiptFile) {
      setError("Iltimos, barcha maydonlarni to'ldiring va fayllarni yuklang.");
      return;
    }

    setIsSubmitting(true);
    const dataToSubmit = {
      title, abstract_en, keywords_en, journal: selectedJournalId, 
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
  
  const availableCategories = useMemo(() => {
    if (!selectedTypeId) return [];
    const categoryIdsInType = new Set(journals.filter(j => j.journal_type.id === selectedTypeId).map(j => j.category?.id));
    return categories.filter(c => categoryIdsInType.has(c.id));
  }, [selectedTypeId, journals, categories]);

  const filteredJournals = useMemo(() => {
      if(!selectedTypeId || !selectedCategoryId) return [];
      return journals.filter(j => j.journal_type.id === selectedTypeId && j.category?.id === selectedCategoryId);
  }, [selectedTypeId, selectedCategoryId, journals]);
  
  const resetSelection = (level: 'type' | 'category' | 'journal') => {
      if (level === 'type') {
        setSelectedTypeId(null);
      }
      if (level === 'type' || level === 'category') {
        setSelectedCategoryId(null);
      }
      setSelectedJournalId(null);
  };

  const renderJournalSelection = () => {
      // 1-qadam: Tur tanlash
      if (!selectedTypeId) {
          return (
            <div>
                <h3 className="text-lg font-semibold text-light-text mb-3">1. Nashr turini tanlang</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {journalTypes.map(type => (
                        <button key={type.id} type="button" onClick={() => setSelectedTypeId(type.id)} className="p-6 bg-slate-700 rounded-lg hover:bg-accent-purple/30 text-center transition">
                            {type.name.toLowerCase().includes('xalqaro') ? <GlobeAltIcon className="h-12 w-12 mx-auto text-accent-sky mb-2"/> : <BuildingLibraryIcon className="h-12 w-12 mx-auto text-accent-emerald mb-2"/>}
                            <span className="text-lg font-semibold text-light-text">{type.name}</span>
                        </button>
                    ))}
                </div>
            </div>
          );
      }
      // 2-qadam: Kategoriya tanlash
      if (!selectedCategoryId) {
          return (
            <div>
                <div className="flex items-center gap-4 mb-4">
                    <Button variant="secondary" size="sm" onClick={() => resetSelection('type')}>Orqaga</Button>
                    <h3 className="text-lg font-semibold text-light-text">2. Kategoriyani tanlang</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableCategories.length > 0 ? availableCategories.map(cat => (
                        <button key={cat.id} type="button" onClick={() => setSelectedCategoryId(cat.id)} className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 text-center transition">
                            <span className="font-medium text-light-text">{cat.name}</span>
                        </button>
                    )) : <p className="text-medium-text col-span-full">Ushbu turda kategoriya topilmadi.</p>}
                </div>
            </div>
          );
      }
      // 3-qadam: Jurnal tanlash
      return (
        <div>
            <div className="flex items-center gap-4 mb-4">
                <Button variant="secondary" size="sm" onClick={() => resetSelection('category')}>Orqaga</Button>
                <h3 className="text-lg font-semibold text-light-text">3. Jurnalni tanlang</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2">
                {filteredJournals.length > 0 ? filteredJournals.map(journal => (
                    <div key={journal.id} onClick={() => setSelectedJournalId(journal.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition ${selectedJournalId === journal.id ? 'border-accent-purple bg-accent-purple/10' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}>
                        <img src={journal.image_url || 'https://via.placeholder.com/400x200'} alt={journal.name} className="w-full h-32 object-cover rounded-md mb-3" />
                        <h4 className="font-bold text-light-text">{journal.name}</h4>
                        <p className="text-sm text-medium-text line-clamp-2">{journal.description}</p>
                        <p className="text-lg font-bold mt-2 text-accent-sky">
                            {new Intl.NumberFormat('uz-UZ').format(Number(isPartner ? journal.partner_price : journal.regular_price))} UZS
                        </p>
                    </div>
                )) : <p className="text-medium-text col-span-full text-center">Jurnal topilmadi.</p>}
            </div>
        </div>
      );
  };
  
  if (isLoadingData) {
    return <LoadingSpinner message="Ma'lumotlar yuklanmoqda..." />;
  }
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-accent-sky">Yangi Maqola Yuborish</h1>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    {renderJournalSelection()}
                </Card>

                <Card>
                    <h3 className="text-lg font-semibold text-light-text mb-3">Maqola ma'lumotlari</h3>
                    <Input label="Maqola sarlavhasi" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    <Textarea label="Annotatsiya (ingliz tilida)" name="abstract_en" value={abstract_en} onChange={(e) => setAbstract(e.target.value)} required />
                    <Input label="Kalit so'zlar (vergul bilan ajrating)" name="keywords_en" value={keywords_en} onChange={(e) => setKeywords(e.target.value)} required />
                </Card>
            </div>
            
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <h3 className="text-lg font-semibold text-light-text mb-3">Fayllarni yuklash</h3>
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
                <Button type="submit" fullWidth isLoading={isSubmitting} disabled={isSubmitting || !selectedJournalId} leftIcon={<DocumentArrowUpIcon className="h-5 w-5"/>}>
                    Maqolani Yuborish
                </Button>
            </div>
        </div>
      </form>
    </div>
  );
};

export default SubmitArticlePage;