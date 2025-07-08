import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import { DocumentArrowUpIcon, BuildingLibraryIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { Journal, JournalCategory } from '../../types';
import { LocalizationKeys } from '../../constants';
import apiService, { createFormData } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Textarea from '../../components/common/Textarea';
import { useNavigate } from 'react-router-dom';

const SubmitArticlePage: React.FC = () => {
  const { translate } = useLanguage();
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
  
  // UI State
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Journal Selection State
  const [publicationType, setPublicationType] = useState<'international' | 'local' | null>(null);
  const [categoryId, setCategoryId] = useState<string>('');
  const [journalId, setJournalId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
        setIsLoadingData(true);
        try {
            const [journalsRes, categoriesRes] = await Promise.all([
                apiService.get<Journal[]>('/journals/'),
                apiService.get<JournalCategory[]>('/journal-categories/')
            ]);
            setJournals(journalsRes.data);
            setCategories(categoriesRes.data);
        } catch (err) {
            setError("Jurnallar yoki kategoriyalarni yuklashda xatolik yuz berdi.");
        } finally {
            setIsLoadingData(false);
        }
    };
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'article' | 'receipt') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'article') {
          setArticleFile(file);
      } else {
          setReceiptFile(file);
      }
      setError(null);
    }
  };

  const resetForm = () => {
      setTitle('');
      setAbstract('');
      setKeywords('');
      setArticleFile(null);
      setReceiptFile(null);
      setPublicationType(null);
      setCategoryId('');
      setJournalId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!title || !abstract_en || !keywords_en || !articleFile || !journalId || !receiptFile) {
      setError("Iltimos, barcha maydonlarni to'ldiring va kerakli fayllarni yuklang.");
      return;
    }

    setIsSubmitting(true);

    const dataToSubmit: Record<string, any> = {
      title,
      abstract_en,
      keywords_en,
      journal: journalId,
      category: "Default Category", // Backend `CharField` kutmoqda, shuning uchun matn yuboramiz.
      submissionReceiptFile: receiptFile,
      // Backend `Article` modeli `finalVersionFile` kutadi. Boshlang'ich yuklashni shu maydonga yuboramiz.
      finalVersionFile: articleFile, 
    };

    const formData = createFormData(dataToSubmit);

    try {
        await apiService.post('/articles/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        setSuccessMessage(translate(LocalizationKeys.ARTICLE_SUBMITTED_SUCCESS_AFTER_PAYMENT));
        resetForm(); // Formani tozalash
        
        // Muallifni 2 soniyadan so'ng o'z maqolalari sahifasiga yuborish
        setTimeout(() => {
            navigate('/my-articles');
        }, 2000);

    } catch (err: any) {
        const errorData = err.response?.data;
        const errorMessage = errorData ? Object.values(errorData).flat().join(' ') : "Maqolani yuborishda xatolik yuz berdi.";
        setError(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  // Filtrlangan kategoriyalar va jurnallar ro'yxatini hisoblash uchun
  const availableCategories = useMemo(() => {
    if (!publicationType) return [];
    const journalIdsInType = journals.filter(j => j.journal_type === publicationType).map(j => j.category?.id);
    return categories.filter(c => journalIdsInType.includes(c.id));
  }, [publicationType, journals, categories]);

  const filteredJournals = useMemo(() => {
      if(!publicationType || !categoryId) return [];
      return journals.filter(j => j.journal_type === publicationType && j.category?.id === Number(categoryId));
  }, [publicationType, categoryId, journals]);
  
  if (isLoadingData) {
    return <LoadingSpinner message="Ma'lumotlar yuklanmoqda..." />;
  }
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-accent-sky">{translate('submit_new_article_title')}</h1>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-4" />}
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} className="mb-4" />}

      <form onSubmit={handleSubmit}>
        <Card title={translate('submit_new_article_title')}>
            <div className="space-y-6">
                 {/* Journal Selection Flow */}
                <div className="border-b border-slate-700 pb-6">
                    <h3 className="text-lg font-semibold text-light-text mb-3">1. Jurnal tanlovi</h3>
                    {!publicationType ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button type="button" onClick={() => setPublicationType('international')} className="p-6 bg-slate-700 rounded-lg hover:bg-accent-purple/30 text-center transition">
                                <GlobeAltIcon className="h-12 w-12 mx-auto text-accent-sky mb-2"/>
                                <span className="text-lg font-semibold text-light-text">Xalqaro</span>
                            </button>
                            <button type="button" onClick={() => setPublicationType('local')} className="p-6 bg-slate-700 rounded-lg hover:bg-accent-sky/30 text-center transition">
                                <BuildingLibraryIcon className="h-12 w-12 mx-auto text-accent-emerald mb-2"/>
                                <span className="text-lg font-semibold text-light-text">Mahalliy</span>
                            </button>
                        </div>
                    ) : !categoryId ? (
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <Button variant="secondary" size="sm" onClick={() => { setPublicationType(null); }}>Orqaga</Button>
                                <h3 className="text-xl font-semibold text-light-text">{publicationType === 'international' ? 'Xalqaro Jurnallar Kategoriyasi' : 'Mahalliy Jurnallar Kategoriyasi'}</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {availableCategories.length > 0 ? availableCategories.map(cat => (
                                    <button key={cat.id} type="button" onClick={() => setCategoryId(String(cat.id))} className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 text-center transition">
                                        <span className="font-medium text-light-text">{cat.name}</span>
                                    </button>
                                )) : <p className="text-medium-text col-span-full">Ushbu turda kategoriya topilmadi.</p>}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <Button variant="secondary" size="sm" onClick={() => { setCategoryId(''); setJournalId(''); }}>Orqaga</Button>
                                <h4 className="text-lg font-semibold text-light-text">{categories.find(c => c.id === Number(categoryId))?.name} Jurnallari</h4>
                            </div>
                            <div className="space-y-2">
                                {filteredJournals.length > 0 ? filteredJournals.map(journal => (
                                    <button
                                        key={journal.id}
                                        type="button"
                                        onClick={() => setJournalId(String(journal.id))}
                                        className={`w-full text-left p-3 rounded-lg border-2 transition ${journalId === String(journal.id) ? 'bg-accent-purple/20 border-accent-purple' : 'bg-slate-700/50 border-transparent hover:border-slate-500'}`}
                                    >
                                        {journal.name}
                                    </button>
                                )) : <p className="text-medium-text">Ushbu kategoriyada jurnallar topilmadi.</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Article Details */}
                <div className="border-b border-slate-700 pb-6">
                    <h3 className="text-lg font-semibold text-light-text mb-3">2. Maqola ma'lumotlari</h3>
                    <Input label={translate('article_title_label')} name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={translate('article_title_placeholder')} required />
                    <Textarea label={translate('article_abstract_label')} name="abstract_en" value={abstract_en} onChange={(e) => setAbstract(e.target.value)} placeholder={translate('article_abstract_placeholder')} required />
                    <Input label={translate('keywords_label')} name="keywords_en" value={keywords_en} onChange={(e) => setKeywords(e.target.value)} placeholder={translate('keywords_placeholder')} required />
                </div>
                
                {/* File Uploads */}
                <div>
                    <h3 className="text-lg font-semibold text-light-text mb-3 flex items-center">
                        <DocumentArrowUpIcon className="h-6 w-6 text-accent-purple inline-block mr-2" />
                        3. Fayllarni yuklash
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <label htmlFor="articleFile" className="block text-sm font-medium text-light-text mb-1"> {translate('article_file_label_docx_pdf')} </label>
                            <input type="file" id="articleFile" name="articleFile" accept=".doc,.docx,.pdf" onChange={(e) => handleFileChange(e, 'article')} required className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-purple file:text-white hover:file:bg-accent-purple/80 cursor-pointer" />
                            {articleFile && ( <div className="mt-2 p-2 bg-slate-700 rounded-lg"> <p className="text-sm text-light-text">{translate('selected_file_label')} {articleFile.name}</p> </div> )}
                        </div>
                        <div>
                             <label htmlFor="receiptFile" className="block text-sm font-medium text-light-text mb-1"> {translate(LocalizationKeys.UPLOAD_RECEIPT_LABEL)} </label>
                            <input type="file" id="receiptFile" name="receiptFile" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, 'receipt')} required className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-sky file:text-white hover:file:bg-accent-sky/80 cursor-pointer" />
                            {receiptFile && ( <div className="mt-2 p-2 bg-slate-700 rounded-lg"> <p className="text-sm text-light-text">{translate('selected_file_label')} {receiptFile.name}</p> </div> )}
                        </div>
                    </div>
                </div>

                 <div className="flex justify-end pt-4 mt-6 border-t border-slate-700">
                    <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting || !journalId} leftIcon={<DocumentArrowUpIcon className="h-5 w-5"/>}>
                        {translate('submit_article_button')}
                    </Button>
                 </div>
            </div>
        </Card>
      </form>
    </div>
  );
};

export default SubmitArticlePage;