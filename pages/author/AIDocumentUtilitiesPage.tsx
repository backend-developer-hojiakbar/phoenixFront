// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Textarea from '../../components/common/Textarea';
import { SparklesIcon, ArrowUpOnSquareIcon, ArrowsRightLeftIcon, LanguageIcon, BookOpenIcon } from '@heroicons/react/24/outline';
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
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-accent-sky flex items-center">
                <SparklesIcon className="h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-3 text-accent-purple" />
                {service?.name || translate(LocalizationKeys.AI_DOCUMENT_UTILITIES_PAGE_TITLE)}
            </h1>

            <Card title={service?.name || translate('ai_document_utilities_title', "SI Hujjat Yordamchisi")} icon={<SparklesIcon className="h-6 w-6 text-sky-400" />}>
                 {service && (
                    <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-light-text">{translate('service_price', 'Xizmat narxi')}</h3>
                        {selectedUtility === 'isbn' ? (
                            <p className="text-2xl font-bold text-accent-sky mt-1">
                                {new Intl.NumberFormat('uz-UZ').format(calculatedPrice)} UZS
                            </p>
                        ) : (
                            <p className="text-2xl font-bold text-accent-sky mt-1">
                                {new Intl.NumberFormat('uz-UZ').format(Number(service.price))} UZS
                            </p>
                        )}
                    </div>
                )}
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-light-text mb-1">{translate('select_utility_type', 'Yordamchi turini tanlang')}</label>
                    <select
                        value={selectedUtility}
                        onChange={(e) => {
                            setSelectedUtility(e.target.value);
                            // Reset values when switching categories
                            if (e.target.value === 'isbn') {
                                setPageCount('');
                                setBookQuantity('1');
                                setCoverType('soft');
                                setIsbn('');
                            }
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-light-text focus:outline-none focus:ring-2 focus:ring-accent-sky"
                    >
                        <option value="literacy">{translate(LocalizationKeys.LITERACY_CHECK_SECTION_TITLE)}</option>
                        <option value="transliteration">{translate(LocalizationKeys.TRANSLITERATION_SECTION_TITLE)}</option>
                        <option value="isbn">ISBN</option>
                    </select>
                </div>

                {/* ISBN Input Fields */}
                {selectedUtility === 'isbn' && (
                    <div className="space-y-4 mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-light-text mb-3">{translate('isbn_service_title', 'ISBN Xizmati')}</h3>
                        
                        <Input
                            label={translate('isbn_number_label', 'ISBN Raqami')}
                            value={isbn}
                            onChange={(e) => setIsbn(e.target.value)}
                            placeholder={translate('enter_isbn_placeholder', '978-0-123456-78-9')}
                            required
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1">
                                {translate('cover_type_label', 'Muqova Turi')}
                            </label>
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="coverType"
                                        value="soft"
                                        checked={coverType === 'soft'}
                                        onChange={(e) => setCoverType(e.target.value)}
                                        className="mr-2"
                                    />
                                    <span className="text-medium-text">
                                        {translate('soft_cover_option', 'Yumshoq muqova')} (+{new Intl.NumberFormat('uz-UZ').format(SOFT_COVER_PRICE)} UZS)
                                    </span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="coverType"
                                        value="hard"
                                        checked={coverType === 'hard'}
                                        onChange={(e) => setCoverType(e.target.value)}
                                        className="mr-2"
                                    />
                                    <span className="text-medium-text">
                                        {translate('hard_cover_option', 'Qattiq muqova')} (+{new Intl.NumberFormat('uz-UZ').format(HARD_COVER_PRICE)} UZS)
                                    </span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                            <h4 className="font-medium text-light-text mb-2">{translate('price_calculation_details', 'Hisob-kitob tafsilotlari')}:</h4>
                            <ul className="text-sm text-medium-text space-y-1">
                                <li>{translate('pages_cost_formula', 'Betlar uchun:')} {pageCount ? Math.floor(parseInt(pageCount) / 4) : 0} × {new Intl.NumberFormat('uz-UZ').format(PRICE_PER_PAGE)} UZS = {new Intl.NumberFormat('uz-UZ').format(pageCount ? Math.floor(parseInt(pageCount) / 4) * PRICE_PER_PAGE : 0)} UZS</li>
                                <li>{translate('cover_cost', 'Muqova narxi:')} {coverType === 'hard' ? 
                                    `${new Intl.NumberFormat('uz-UZ').format(HARD_COVER_PRICE)} UZS (${translate('hard_cover_option', 'Qattiq muqova')})` : 
                                    `${new Intl.NumberFormat('uz-UZ').format(SOFT_COVER_PRICE)} UZS (${translate('soft_cover_option', 'Yumshoq muqova')})`}</li>
                                <li className="font-medium pt-1 border-t border-slate-600">
                                    {translate('total_per_book', '1 dona kitob uchun:')} {new Intl.NumberFormat('uz-UZ').format(pricePerBook)} UZS
                                </li>
                                <li className="font-bold text-accent-sky">
                                    {translate('total_for_all_books', 'Jami narx:')} {new Intl.NumberFormat('uz-UZ').format(calculatedPrice)} UZS
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Transliteration Section */}
                {selectedUtility === 'transliteration' && (
                    <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-light-text mb-3">
                            {translate(LocalizationKeys.TRANSLITERATION_SECTION_TITLE)}
                        </h3>
                        <p className="text-medium-text mb-4">
                            {translate(LocalizationKeys.TRANSLITERATION_DESCRIPTION)}
                        </p>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-light-text mb-1">
                                {translate(LocalizationKeys.SELECT_TRANSLITERATION_DIRECTION_LABEL)}
                            </label>
                            <select
                                value={transliterationDirection}
                                onChange={(e) => setTransliterationDirection(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-light-text focus:outline-none focus:ring-2 focus:ring-accent-sky"
                            >
                                <option value="latin-to-cyrillic">
                                    {translate(LocalizationKeys.LATIN_TO_CYRILLIC)}
                                </option>
                                <option value="cyrillic-to-latin">
                                    {translate(LocalizationKeys.CYRILLIC_TO_LATIN)}
                                </option>
                            </select>
                        </div>
                        
                        <div className="mb-4">
                            <Textarea
                                label={translate('enter_text_for_transliteration', 'Transliteratsiya uchun matn kiriting')}
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder={translate('transliteration_text_placeholder', 'Transliteratsiya qilish uchun matnni shu yerga kiriting...')}
                                rows={6}
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-light-text mb-1">
                                {translate(LocalizationKeys.UPLOAD_PDF_FOR_TRANSLITERATION_LABEL)}
                            </label>
                            <input
                                type="file"
                                accept=".doc,.docx"
                                onChange={handleFileChange}
                                className="w-full text-medium-text file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-light-text hover:file:bg-slate-600"
                            />
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
                    <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-light-text mb-3">
                            {translate(LocalizationKeys.LITERACY_CHECK_SECTION_TITLE)}
                        </h3>
                        <p className="text-medium-text mb-4">
                            {translate(LocalizationKeys.PDF_ANALYSIS_DESCRIPTION)}
                        </p>
                        
                        <div className="mb-4">
                            <Textarea
                                label={translate('enter_text_for_analysis', 'Tahlil uchun matn kiriting')}
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder={translate('literacy_analysis_text_placeholder', 'Savodxonlik tahlili uchun matnni shu yerga kiriting...')}
                                rows={6}
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-light-text mb-1">
                                {translate(LocalizationKeys.UPLOAD_PDF_FOR_ANALYSIS_LABEL)}
                            </label>
                            <input
                                type="file"
                                accept=".doc,.docx"
                                onChange={handleFileChange}
                                className="w-full text-medium-text file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-light-text hover:file:bg-slate-600"
                            />
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

                <div className="flex justify-end">
                    <Button
                        onClick={handlePaymentRequest}
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        leftIcon={<ArrowUpOnSquareIcon className="h-5 w-5" />}
                    >
                        {translate('proceed_to_payment_button', 'To\'lovga o\'tish')}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default AIDocumentUtilitiesPage;