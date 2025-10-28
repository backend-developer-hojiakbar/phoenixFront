import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import { DocumentArrowUpIcon, MagnifyingGlassIcon, ArrowLeftIcon, UserCircleIcon, BookOpenIcon, DocumentTextIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
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
  const [udk, setUdk] = useState('');
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
    const fullName = `${user.name} ${user.surname}`.toLowerCase();
    return fullName.includes('hamkor');
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
      title, 
      abstract_en, 
      keywords_en, 
      udk,
      journal: selectedJournal.id, 
      category: "Default",
      submissionReceiptFile: receiptFile, 
      finalVersionFile: articleFile,
    };
    const formData = createFormData(dataToSubmit);

    try {
        const response = await apiService.post('/articles/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (response.data && response.data.payment_url) {
            setSuccessMessage("Ma'lumotlar qabul qilindi. To'lov sahifasiga yo'naltirilmoqda...");
            window.location.href = response.data.payment_url;
        } else {
            setError("To'lov manzilini olishda xatolik yuz berdi. Iltimos, administrator bilan bog'laning.");
            setIsSubmitting(false);
        }
    } catch (err: any) {
        const errorMessage = err.response?.data ? JSON.stringify(err.response.data) : "Server bilan bog'lanishda xatolik yuz berdi.";
        setError(errorMessage);
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-light-text flex items-center">
          <BookOpenIcon className="h-6 w-6 mr-2 text-accent-sky" />
          {translate('select_journal_title', 'Jurnalni tanlang')}
        </h2>
        <div className="text-sm text-medium-text">
          {translate('step_1_of_3', '1/3 qadam')}
        </div>
      </div>
      
      <Card title={undefined} icon={undefined}>
        <h3 className="modern-card-title">
          <MagnifyingGlassIcon className="h-6 w-6 text-accent-sky mr-2" />
          {translate('filter_journals', 'Jurnallarni filtrlash')}
        </h3>
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder={translate('search_placeholder', 'Qidiruv...')} 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="modern-input pl-10"
              />
            </div>
            <select 
              value={filterTypeId} 
              onChange={e => setFilterTypeId(e.target.value)} 
              className="modern-select"
            >
              <option value="">{translate('all_types', 'Barcha turlar')}</option>
              {journalTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <select 
              value={filterCategoryId} 
              onChange={e => setFilterCategoryId(e.target.value)} 
              className="modern-select"
            >
              <option value="">{translate('all_categories', 'Barcha kategoriyalar')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJournals.length > 0 ? filteredJournals.map(journal => (
            <div 
              key={journal.id} 
              onClick={() => setSelectedJournal(journal)}
              className="modern-card cursor-pointer transition-all duration-300 hover:border-accent-purple hover:shadow-lg hover:shadow-accent-purple/10 transform hover:-translate-y-1 flex flex-col"
            >
              <div className="relative">
                <img 
                  src={journal.image_url || 'https://via.placeholder.com/400x200?text=Jurnal+Rasmi'} 
                  alt={journal.name} 
                  className="w-full h-40 object-cover rounded-t-lg" 
                />
                <div className="absolute top-2 right-2 bg-accent-purple/80 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  {isPartner ? journal.partner_price : journal.regular_price} UZS
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="modern-badge modern-badge-secondary">
                    {journal.journal_type.name}
                  </span>
                  {journal.category && (
                    <span className="modern-badge modern-badge-success">
                      {journal.category.name}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-light-text text-lg flex-grow mb-3">{journal.name}</h4>
                
                <div className="mt-auto pt-3 border-t border-slate-700">
                  <div className="flex items-center text-xs text-slate-400 mb-2">
                    <UserCircleIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <span>{translate('editor_label', 'Redaktor')}: {journal.manager ? `${journal.manager.name} ${journal.manager.surname}` : translate('not_assigned', 'Tayinlanmagan')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-medium-text">{translate('submission_price', 'Yuborish narxi')}:</span>
                    <span className="text-lg font-bold text-accent-sky">
                      {new Intl.NumberFormat('uz-UZ').format(Number(isPartner ? journal.partner_price : journal.regular_price))} UZS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-12">
              <BookOpenIcon className="h-12 w-12 mx-auto text-slate-500 mb-4" />
              <h3 className="text-lg font-medium text-light-text mb-2">{translate('no_journals_found', 'Jurnallar topilmadi')}</h3>
              <p className="text-medium-text">{translate('try_adjusting_filters', 'Filtrlarni sozlab ko\'ring')}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
  
  const renderArticleSubmissionView = () => (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-light-text flex items-center">
            <DocumentTextIcon className="h-6 w-6 mr-2 text-accent-sky" />
            {translate('submit_article_title', 'Maqola yuborish')}
          </h2>
          <div className="text-sm text-medium-text">
            {translate('step_2_of_3', '2/3 qadam')}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card title={undefined} icon={undefined}>
              <h3 className="modern-card-title">
                <BookOpenIcon className="h-6 w-6 text-accent-sky mr-2" />
                {translate('selected_journal', 'Tanlangan jurnal')}
              </h3>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start p-4 bg-slate-800 rounded-lg gap-4 border border-slate-700 w-full">
                  <img 
                    src={selectedJournal?.image_url || 'https://via.placeholder.com/150x80'} 
                    alt={selectedJournal?.name} 
                    className="w-24 h-16 object-cover rounded-md flex-shrink-0" 
                  />
                  <div>
                    <h4 className="font-bold text-light-text text-xl">{selectedJournal?.name}</h4>
                    <div className="flex items-center mt-2">
                      <CurrencyDollarIcon className="h-5 w-5 text-accent-sky mr-1" />
                      <span className="text-lg font-bold text-accent-sky">
                        {new Intl.NumberFormat('uz-UZ').format(Number(isPartner ? selectedJournal?.partner_price : selectedJournal?.regular_price))} UZS
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setSelectedJournal(null)} 
                  leftIcon={<ArrowLeftIcon className="h-4 w-4"/>}
                  className="ml-4"
                >
                  {translate('change_journal', 'O\'zgartirish')}
                </Button>
              </div>
            </Card>

            <Card title={undefined} icon={undefined}>
              <h3 className="modern-card-title">
                <DocumentTextIcon className="h-6 w-6 text-accent-sky mr-2" />
                {translate('article_information', 'Maqola ma\'lumotlari')}
              </h3>
              <div className="space-y-6">
                <Input 
                  label={translate('article_title_label', 'Maqola sarlavhasi')} 
                  name="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
                <Textarea 
                  label={translate('abstract_label', 'Annotatsiya (ingliz tilida)')} 
                  name="abstract_en" 
                  value={abstract_en} 
                  onChange={(e) => setAbstract(e.target.value)} 
                  required 
                  rows={5} 
                />
                <Input 
                  label={translate('keywords_label', 'Kalit so\'zlar (vergul bilan ajrating)')} 
                  name="keywords_en" 
                  value={keywords_en} 
                  onChange={(e) => setKeywords(e.target.value)} 
                  required 
                />
                <Input 
                  label="UDK (Universal o'nlik klassifikatsiya)" 
                  name="udk" 
                  value={udk} 
                  onChange={(e) => setUdk(e.target.value)} 
                  placeholder="Masalan: 530.145"
                />
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <Card title={undefined} icon={undefined}>
              <h3 className="modern-card-title">
                <DocumentArrowUpIcon className="h-6 w-6 text-accent-sky mr-2" />
                {translate('upload_files', 'Fayllarni yuklash')}
              </h3>
              <div className='space-y-6'>
                <div>
                  <label className="block text-sm font-medium text-light-text mb-2">
                    {translate('article_file_label', 'Maqola fayli (.doc, .pdf)')}
                  </label>
                  <div className="modern-file-upload">
                    <Input 
                      type="file" 
                      onChange={(e) => setArticleFile(e.target.files?.[0] || null)} 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-text mb-2">
                    {translate('receipt_file_label', 'To\'lov kvitansiyasi')}
                  </label>
                  <div className="modern-file-upload">
                    <Input 
                      type="file" 
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} 
                      required 
                    />
                  </div>
                </div>
              </div>
            </Card>
            
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="font-medium text-light-text mb-2 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-accent-sky" />
                {translate('payment_summary', 'To\'lov ma\'lumotlari')}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-medium-text">{translate('journal_name', 'Jurnal')}:</span>
                  <span className="text-light-text">{selectedJournal?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-medium-text">{translate('submission_fee', 'Yuborish uchun to\'lov')}:</span>
                  <span className="text-light-text font-medium">
                    {new Intl.NumberFormat('uz-UZ').format(Number(isPartner ? selectedJournal?.partner_price : selectedJournal?.regular_price))} UZS
                  </span>
                </div>
                <div className="border-t border-slate-700 pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-light-text">{translate('total_amount', 'Umumiy summa')}:</span>
                    <span className="text-accent-sky">
                      {new Intl.NumberFormat('uz-UZ').format(Number(isPartner ? selectedJournal?.partner_price : selectedJournal?.regular_price))} UZS
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              fullWidth 
              isLoading={isSubmitting} 
              disabled={isSubmitting} 
              leftIcon={<DocumentArrowUpIcon className="h-5 w-5"/>}
              size="lg"
            >
              {translate('proceed_to_payment', 'To\'lovga o\'tish')}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-accent-sky flex items-center">
          <DocumentTextIcon className="h-8 w-8 mr-2" />
          {translate('submit_new_article', 'Yangi Maqola Yuborish')}
        </h1>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/my-articles')}
          leftIcon={<ArrowLeftIcon className="h-4 w-4"/>}
        >
          {translate('back_to_my_articles', 'Mening maqolalarimga qaytish')}
        </Button>
      </div>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      {!selectedJournal ? renderJournalSelectionView() : renderArticleSubmissionView()}
    </div>
  );
};

export default SubmitArticlePage;