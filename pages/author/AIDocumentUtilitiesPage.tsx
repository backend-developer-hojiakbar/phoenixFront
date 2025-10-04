// @ts-nocheck
import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { SparklesIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import { LocalizationKeys } from '../../constants';
import apiService from '../../services/apiService';
import { useServices } from '../../contexts/ServicesContext';

const SERVICE_SLUG = 'ai-document-utilities';

const AIDocumentUtilitiesPage = () => {
    const { translate } = useLanguage();
    const { getServiceBySlug, isLoading: isLoadingService } = useServices();
    const service = getServiceBySlug(SERVICE_SLUG);

    const [documentFile, setDocumentFile] = useState(null);
    const [selectedUtility, setSelectedUtility] = useState('literacy');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type === "application/pdf") {
            setDocumentFile(file);
            setError(null);
        } else {
            setError(translate('file_type_error_pdf_only', 'Iltimos, faqat PDF fayl yuklang.'));
            setDocumentFile(null);
        }
    };

    const handlePaymentRequest = async () => {
        if (!documentFile || !service) {
            setError(translate(LocalizationKeys.ERROR_NO_FILE_SELECTED));
            return;
        }
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append('service_id', String(service.id));
        formData.append('attached_file', documentFile);
        formData.append('form_data_str', JSON.stringify({ 
            fileName: documentFile.name,
            utility: selectedUtility
        }));

        try {
            const response = await apiService.post('/service-orders/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data && response.data.payment_url) {
                setSuccessMessage("Buyurtma qabul qilindi. To'lov sahifasiga yo'naltirilmoqda...");
                window.location.href = response.data.payment_url;
            } else {
                setError("To'lov manzilini olishda xatolik.");
                setIsSubmitting(false);
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Buyurtmani yuborishda xatolik.");
            setIsSubmitting(false);
        }
    };

    if (isLoadingService) {
        return <LoadingSpinner message="Xizmat ma'lumotlari yuklanmoqda..." />;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-accent-sky flex items-center">
                <SparklesIcon className="h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-3 text-accent-purple" />
                {service?.name || translate(LocalizationKeys.AI_DOCUMENT_UTILITIES_PAGE_TITLE)}
            </h1>

            <Card title={service?.name || "SI Hujjat Yordamchisi"} icon={<SparklesIcon className="h-6 w-6 text-sky-400" />}>
                 {service && (
                    <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-light-text">Xizmat narxi</h3>
                        <p className="text-2xl font-bold text-accent-sky mt-1">
                            {new Intl.NumberFormat('uz-UZ').format(Number(service.price))} UZS
                        </p>
                    </div>
                )}
                <p className="text-sm text-medium-text mb-4">{translate(LocalizationKeys.PDF_ANALYSIS_DESCRIPTION)}</p>
                
                <div className="mb-4">
                    <label htmlFor="utilityFile" className="block text-sm font-medium text-light-text mb-1">
                        {translate(LocalizationKeys.UPLOAD_PDF_FOR_ANALYSIS_LABEL)} (.pdf)
                    </label>
                    <Input
                        type="file"
                        id="utilityFile"
                        name="utilityFile"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="w-full text-sm text-slate-400 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-purple file:text-white hover:file:bg-accent-purple/80 cursor-pointer"
                        wrapperClassName="mb-0"
                    />
                    {documentFile && <p className="text-xs text-slate-400 mt-1">Tanlangan fayl: {documentFile.name}</p>}
                </div>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-light-text mb-1">Yordamchi turini tanlang</label>
                    <select
                        value={selectedUtility}
                        onChange={(e) => setSelectedUtility(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-light-text focus:outline-none focus:ring-2 focus:ring-accent-sky"
                    >
                        <option value="literacy">{translate(LocalizationKeys.LITERACY_CHECK_SECTION_TITLE)}</option>
                        <option value="transliteration">{translate(LocalizationKeys.TRANSLITERATION_SECTION_TITLE)}</option>
                    </select>
                </div>

                <Button
                    onClick={handlePaymentRequest}
                    isLoading={isSubmitting}
                    disabled={isSubmitting || isLoadingService || !service || !documentFile}
                    leftIcon={<ArrowUpOnSquareIcon className="h-5 w-5" />}
                >
                    To'lovga o'tish
                </Button>

                {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mt-4" />}
                {successMessage && <Alert type="success" message={successMessage} className="mt-4" />}
            </Card>
        </div>
    );
};

export default AIDocumentUtilitiesPage;