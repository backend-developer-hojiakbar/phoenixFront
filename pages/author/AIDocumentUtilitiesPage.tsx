// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Textarea from '../../components/common/Textarea';
import { SparklesIcon, ArrowUpOnSquareIcon, ArrowsRightLeftIcon, LanguageIcon, BookOpenIcon, DocumentTextIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { LocalizationKeys } from '../../constants';
import apiService from '../../services/apiService';
import { useServices } from '../../contexts/ServicesContext';

const SERVICE_SLUG = 'ai-document-utilities';

const AIDocumentUtilitiesPage = () => {
    const { translate } = useLanguage();
    const { getServiceBySlug, isLoading: isLoadingService } = useServices();
    const service = getServiceBySlug(SERVICE_SLUG);

    const [documentFile, setDocumentFile] = useState(null);
    const [textInput, setTextInput] = useState('');
    const [isbn, setIsbn] = useState('');
    const [pageCount, setPageCount] = useState('');
    const [bookQuantity, setBookQuantity] = useState('1');
    const [coverType, setCoverType] = useState('soft'); // 'soft' or 'hard'
    const [calculatedPrice, setCalculatedPrice] = useState(0);
    const [pricePerBook, setPricePerBook] = useState(0);
    const [selectedUtility, setSelectedUtility] = useState('literacy');
    const [transliterationDirection, setTransliterationDirection] = useState('latin-to-cyrillic');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Price calculation parameters
    const PRICE_PER_PAGE = 400; // 400 UZS per page
    const SOFT_COVER_PRICE = 10000; // 10,000 UZS for soft cover
    const HARD_COVER_PRICE = 25000; // 25,000 UZS for hard cover

    // Calculate price function with detailed logging
    const calculatePrice = useCallback(() => {
        if (selectedUtility === 'isbn') {
            const pages = parseInt(pageCount) || 0;
            const quantity = parseInt(bookQuantity) || 1;
            
            // Calculate price per book
            const pagesCost = Math.floor(pages / 4) * PRICE_PER_PAGE;
            const coverPrice = coverType === 'hard' ? HARD_COVER_PRICE : SOFT_COVER_PRICE;
            const bookPrice = pagesCost + coverPrice;
            setPricePerBook(bookPrice);
            
            // Calculate total price
            const totalPrice = bookPrice * quantity;
            setCalculatedPrice(totalPrice);
            
            console.log('Calculating price:', { pages, quantity, pagesCost, coverPrice, bookPrice, totalPrice });
        }
    }, [pageCount, bookQuantity, coverType, selectedUtility]);

    // Run calculation when any relevant value changes
    useEffect(() => {
        calculatePrice();
    }, [calculatePrice]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file && (file.name.endsWith('.doc') || file.name.endsWith('.docx'))) {
            setDocumentFile(file);
            setError(null);
        } else {
            setError(translate('file_type_error_docx', 'Iltimos, faqat .doc yoki .docx fayl yuklang.'));
            setDocumentFile(null);
        }
    };

    const handlePaymentRequest = async () => {
        if (!service) {
            setError(translate(LocalizationKeys.ERROR_NO_FILE_SELECTED));
            return;
        }

        // ISBN validation
        if (selectedUtility === 'isbn') {
            if (!isbn) {
                setError(translate('enter_isbn_number', "ISBN raqamini kiriting."));
                return;
            }
            if (!pageCount || isNaN(pageCount) || parseInt(pageCount) <= 0) {
                setError(translate('enter_correct_page_count', "Kitob betlar sonini to'g'ri kiriting."));
                return;
            }
            if (!bookQuantity || isNaN(bookQuantity) || parseInt(bookQuantity) <= 0) {
                setError(translate('enter_correct_book_quantity', "Kitoblar sonini to'g'ri kiriting."));
                return;
            }
        }

        // For transliteration, either text input or file is required
        if (selectedUtility === 'transliteration' && !textInput && !documentFile) {
            setError(translate('enter_text_or_upload_file', "Matn kiriting yoki fayl yuklang."));
            return;
        }

        // For literacy check, either text input or file is required
        if (selectedUtility === 'literacy' && !textInput && !documentFile) {
            setError(translate('enter_text_or_upload_file', "Matn kiriting yoki fayl yuklang."));
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append('service_id', String(service.id));
        
        if (documentFile) {
            formData.append('attached_file', documentFile);
        }
        
        formData.append('form_data_str', JSON.stringify({ 
            fileName: documentFile ? documentFile.name : 'text-input',
            utility: selectedUtility,
            transliterationDirection: selectedUtility === 'transliteration' ? transliterationDirection : undefined,
            textInput: textInput || undefined,
            isbn: selectedUtility === 'isbn' ? isbn : undefined,
            pageCount: selectedUtility === 'isbn' ? pageCount : undefined,
            bookQuantity: selectedUtility === 'isbn' ? bookQuantity : undefined,
            coverType: selectedUtility === 'isbn' ? coverType : undefined,
            calculatedPrice: selectedUtility === 'isbn' ? calculatedPrice : undefined
        }));

        try {
            const response = await apiService.post('/service-orders/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data && response.data.payment_url) {
                setSuccessMessage(translate('order_accepted_redirecting', "Buyurtma qabul qilindi. To'lov sahifasiga yo'naltirilmoqda..."));
                window.location.href = response.data.payment_url;
            } else {
                setError(translate('error_getting_payment_url', "To'lov manzilini olishda xatolik."));
                setIsSubmitting(false);
            }
        } catch (err) {
            setError(err.response?.data?.detail || translate('error_submitting_order', "Buyurtmani yuborishda xatolik."));
            setIsSubmitting(false);
        }
    };

    if (isLoadingService) {
        return <LoadingSpinner message={translate('loading_service_data', "Xizmat ma'lumotlari yuklanmoqda...")} />;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-accent-sky flex items-center">
                    <SparklesIcon className="h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-3 text-accent-purple" />
                    {service?.name || translate(LocalizationKeys.AI_DOCUMENT_UTILITIES_PAGE_TITLE)}
                </h1>
                {service && (
                    <div className="flex items-center space-x-2">
                        <CurrencyDollarIcon className="h-5 w-5 text-accent-sky" />
                        <span className="text-xl font-bold text-light-text">
                            {new Intl.NumberFormat('uz-UZ').format(selectedUtility === 'isbn' ? calculatedPrice : Number(service.price))} UZS
                        </span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card title={service?.name || translate('ai_document_utilities_title', "SI Hujjat Yordamchisi")} icon={<SparklesIcon className="h-6 w-6 text-sky-400" />}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-light-text mb-2">{translate('select_utility_type', 'Yordamchi turini tanlang')}</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedUtility('literacy')}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                        selectedUtility === 'literacy' 
                                            ? 'border-accent-purple bg-accent-purple/10' 
                                            : 'border-slate-700 hover:border-slate-600'
                                    }`}
                                >
                                    <DocumentTextIcon className="h-8 w-8 mx-auto text-accent-purple mb-2" />
                                    <span className="block text-center font-medium">{translate(LocalizationKeys.LITERACY_CHECK_SECTION_TITLE)}</span>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setSelectedUtility('transliteration')}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                        selectedUtility === 'transliteration' 
                                            ? 'border-accent-sky bg-accent-sky/10' 
                                            : 'border-slate-700 hover:border-slate-600'
                                    }`}
                                >
                                    <ArrowsRightLeftIcon className="h-8 w-8 mx-auto text-accent-sky mb-2" />
                                    <span className="block text-center font-medium">{translate(LocalizationKeys.TRANSLITERATION_SECTION_TITLE)}</span>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setSelectedUtility('isbn')}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                        selectedUtility === 'isbn' 
                                            ? 'border-accent-emerald bg-accent-emerald/10' 
                                            : 'border-slate-700 hover:border-slate-600'
                                    }`}
                                >
                                    <BookOpenIcon className="h-8 w-8 mx-auto text-accent-emerald mb-2" />
                                    <span className="block text-center font-medium">ISBN</span>
                                </button>
                            </div>
                        </div>

                        {/* ISBN Input Fields */}
                        {selectedUtility === 'isbn' && (
                            <div className="space-y-6 mb-6 p-5 bg-slate-800/50 rounded-xl border border-slate-700">
                                <h3 className="text-lg font-semibold text-light-text mb-4 flex items-center">
                                    <BookOpenIcon className="h-5 w-5 mr-2 text-accent-emerald" />
                                    {translate('isbn_service_title', 'ISBN Xizmati')}
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Input
                                        label={translate('isbn_number_label', 'ISBN Raqami')}
                                        value={isbn}
                                        onChange={(e) => setIsbn(e.target.value)}
                                        placeholder={translate('enter_isbn_placeholder', '978-0-123456-78-9')}
                                        required
                                    />
                                    
                                    <Input
                                        label={translate('page_count_label', 'Betlar Soni')}
                                        type="number"
                                        value={pageCount}
                                        onChange={(e) => setPageCount(e.target.value)}
                                        placeholder={translate('enter_page_count_placeholder', 'Masalan: 160')}
                                        required
                                    />
                                    
                                    <Input
                                        label={translate('book_quantity_label', 'Kitoblar Soni')}
                                        type="number"
                                        value={bookQuantity}
                                        onChange={(e) => setBookQuantity(e.target.value)}
                                        placeholder={translate('enter_quantity_placeholder', 'Masalan: 10')}
                                        min="1"
                                        required
                                    />
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-light-text mb-2">
                                            {translate('cover_type_label', 'Muqova Turi')}
                                        </label>
                                        <div className="flex flex-wrap gap-4">
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="coverType"
                                                    value="soft"
                                                    checked={coverType === 'soft'}
                                                    onChange={(e) => setCoverType(e.target.value)}
                                                    className="mr-2 h-4 w-4 text-accent-sky focus:ring-accent-sky"
                                                />
                                                <span className="text-medium-text">
                                                    {translate('soft_cover_option', 'Yumshoq muqova')} (+{new Intl.NumberFormat('uz-UZ').format(SOFT_COVER_PRICE)} UZS)
                                                </span>
                                            </label>
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="coverType"
                                                    value="hard"
                                                    checked={coverType === 'hard'}
                                                    onChange={(e) => setCoverType(e.target.value)}
                                                    className="mr-2 h-4 w-4 text-accent-sky focus:ring-accent-sky"
                                                />
                                                <span className="text-medium-text">
                                                    {translate('hard_cover_option', 'Qattiq muqova')} (+{new Intl.NumberFormat('uz-UZ').format(HARD_COVER_PRICE)} UZS)
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                                    <h4 className="font-medium text-light-text mb-3">{translate('price_calculation_details', 'Hisob-kitob tafsilotlari')}:</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-medium-text">{translate('pages_cost_formula', 'Betlar uchun:')}</span>
                                            <span className="text-light-text">
                                                {pageCount ? Math.floor(parseInt(pageCount) / 4) : 0} × {new Intl.NumberFormat('uz-UZ').format(PRICE_PER_PAGE)} UZS = {new Intl.NumberFormat('uz-UZ').format(pageCount ? Math.floor(parseInt(pageCount) / 4) * PRICE_PER_PAGE : 0)} UZS
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-medium-text">{translate('cover_cost', 'Muqova narxi:')}</span>
                                            <span className="text-light-text">
                                                {coverType === 'hard' ? 
                                                    `${new Intl.NumberFormat('uz-UZ').format(HARD_COVER_PRICE)} UZS (${translate('hard_cover_option', 'Qattiq muqova')})` : 
                                                    `${new Intl.NumberFormat('uz-UZ').format(SOFT_COVER_PRICE)} UZS (${translate('soft_cover_option', 'Yumshoq muqova')})`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-slate-600 md:col-span-2">
                                            <span className="font-medium text-light-text">{translate('total_per_book', '1 dona kitob uchun:')}</span>
                                            <span className="font-medium text-accent-sky">
                                                {new Intl.NumberFormat('uz-UZ').format(pricePerBook)} UZS
                                            </span>
                                        </div>
                                        <div className="flex justify-between md:col-span-2">
                                            <span className="font-bold text-light-text">{translate('total_for_all_books', 'Jami narx:')}</span>
                                            <span className="font-bold text-xl text-accent-emerald">
                                                {new Intl.NumberFormat('uz-UZ').format(calculatedPrice)} UZS
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Transliteration Section */}
                        {selectedUtility === 'transliteration' && (
                            <div className="mb-6 p-5 bg-slate-800/50 rounded-xl border border-slate-700">
                                <h3 className="text-lg font-semibold text-light-text mb-4 flex items-center">
                                    <ArrowsRightLeftIcon className="h-5 w-5 mr-2 text-accent-sky" />
                                    {translate(LocalizationKeys.TRANSLITERATION_SECTION_TITLE)}
                                </h3>
                                <p className="text-medium-text mb-5">
                                    {translate(LocalizationKeys.TRANSLITERATION_DESCRIPTION)}
                                </p>
                                
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-light-text mb-2">
                                        {translate(LocalizationKeys.SELECT_TRANSLITERATION_DIRECTION_LABEL)}
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setTransliterationDirection('latin-to-cyrillic')}
                                            className={`p-3 rounded-lg border-2 transition-all ${
                                                transliterationDirection === 'latin-to-cyrillic' 
                                                    ? 'border-accent-sky bg-accent-sky/10' 
                                                    : 'border-slate-700 hover:border-slate-600'
                                            }`}
                                        >
                                            <span className="font-medium">Lotin → Kirill</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTransliterationDirection('cyrillic-to-latin')}
                                            className={`p-3 rounded-lg border-2 transition-all ${
                                                transliterationDirection === 'cyrillic-to-latin' 
                                                    ? 'border-accent-sky bg-accent-sky/10' 
                                                    : 'border-slate-700 hover:border-slate-600'
                                            }`}
                                        >
                                            <span className="font-medium">Kirill → Lotin</span>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="mb-5">
                                    <Textarea
                                        label={translate('enter_text_for_transliteration', 'Transliteratsiya uchun matn kiriting')}
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        placeholder={translate('transliteration_text_placeholder', 'Transliteratsiya qilish uchun matnni shu yerga kiriting...')}
                                        rows={6}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-light-text mb-2">
                                        {translate(LocalizationKeys.UPLOAD_PDF_FOR_TRANSLITERATION_LABEL)}
                                    </label>
                                    <div className="modern-file-upload">
                                        <Input
                                            type="file"
                                            accept=".doc,.docx"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    {documentFile && (
                                        <p className="mt-2 text-sm text-medium-text">
                                            {translate('selected_file_label')} {documentFile.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Literacy Check Section */}
                        {selectedUtility === 'literacy' && (
                            <div className="mb-6 p-5 bg-slate-800/50 rounded-xl border border-slate-700">
                                <h3 className="text-lg font-semibold text-light-text mb-4 flex items-center">
                                    <DocumentTextIcon className="h-5 w-5 mr-2 text-accent-purple" />
                                    {translate(LocalizationKeys.LITERACY_CHECK_SECTION_TITLE)}
                                </h3>
                                <p className="text-medium-text mb-5">
                                    {translate(LocalizationKeys.PDF_ANALYSIS_DESCRIPTION)}
                                </p>
                                
                                <div className="mb-5">
                                    <Textarea
                                        label={translate('enter_text_for_analysis', 'Tahlil uchun matn kiriting')}
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        placeholder={translate('literacy_analysis_text_placeholder', 'Savodxonlik tahlili uchun matnni shu yerga kiriting...')}
                                        rows={6}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-light-text mb-2">
                                        {translate(LocalizationKeys.UPLOAD_PDF_FOR_ANALYSIS_LABEL)}
                                    </label>
                                    <div className="modern-file-upload">
                                        <Input
                                            type="file"
                                            accept=".doc,.docx"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    {documentFile && (
                                        <p className="mt-2 text-sm text-medium-text">
                                            {translate('selected_file_label')} {documentFile.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
                        {successMessage && <Alert type="success" message={successMessage} />}

                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={handlePaymentRequest}
                                isLoading={isSubmitting}
                                disabled={isSubmitting}
                                leftIcon={<ArrowUpOnSquareIcon className="h-5 w-5" />}
                                size="lg"
                            >
                                {translate('proceed_to_payment_button', 'To\'lovga o\'tish')}
                            </Button>
                        </div>
                    </Card>
                </div>
                
                <div className="space-y-6">
                    <Card title="Ma'lumot" icon={<SparklesIcon className="h-6 w-6 text-accent-purple" />}>
                        <div className="space-y-5">
                            <div className="flex items-start p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div className="flex-shrink-0 mt-0.5">
                                    <DocumentTextIcon className="h-5 w-5 text-accent-purple" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="font-semibold text-light-text">{translate(LocalizationKeys.LITERACY_CHECK_SECTION_TITLE)}</h3>
                                    <p className="text-sm text-medium-text mt-1">
                                        Hujjatingizni grammatik xatolar, so'zlar to'g'riligi va stilistik jihatdan tekshiring.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div className="flex-shrink-0 mt-0.5">
                                    <ArrowsRightLeftIcon className="h-5 w-5 text-accent-sky" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="font-semibold text-light-text">{translate(LocalizationKeys.TRANSLITERATION_SECTION_TITLE)}</h3>
                                    <p className="text-sm text-medium-text mt-1">
                                        Matnlarni lotin-kirill yozuv tizimlari o'rtasida konvertatsiya qiling.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div className="flex-shrink-0 mt-0.5">
                                    <BookOpenIcon className="h-5 w-5 text-accent-emerald" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="font-semibold text-light-text">ISBN</h3>
                                    <p className="text-sm text-medium-text mt-1">
                                        Kitoblaringiz uchun xalqaro standart kitob raqami (ISBN) oling.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                    
                    {service && (
                        <div className="bg-gradient-to-r from-accent-purple/10 to-accent-sky/10 rounded-xl p-5 border border-accent-purple/30">
                            <h3 className="font-semibold text-light-text mb-2 flex items-center">
                                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-accent-sky" />
                                Xizmat narxi
                            </h3>
                            <p className="text-2xl font-bold text-accent-sky">
                                {new Intl.NumberFormat('uz-UZ').format(selectedUtility === 'isbn' ? calculatedPrice : Number(service.price))} UZS
                            </p>
                            <p className="text-sm text-medium-text mt-2">
                                {selectedUtility === 'isbn' 
                                    ? "ISBN xizmati tanlangan miqdor va betlar soniga qarab hisoblanadi" 
                                    : "Bir martalik to'lov"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIDocumentUtilitiesPage;