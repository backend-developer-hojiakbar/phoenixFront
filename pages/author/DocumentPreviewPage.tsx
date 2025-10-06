import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { EyeIcon, ArrowLeftIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import { useServices } from '../../contexts/ServicesContext';

const SERVICE_SLUG = 'document-preview';

const DocumentPreviewPage: React.FC = () => {
    const { translate } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { getServiceBySlug, isLoading: isLoadingServices } = useServices();
    const service = getServiceBySlug(SERVICE_SLUG);

    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [contactPhone, setContactPhone] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!documentFile || !contactPhone) {
            setError("Hujjat fayli va telefon raqami maydonlarini to'ldirish shart.");
            return;
        }
        
        // Validate phone number format (simple validation)
        const phoneRegex = /^\+?[0-9\s\-\(\)]+$/;
        if (!phoneRegex.test(contactPhone)) {
            setError("Iltimos, to'g'ri telefon raqamini kiriting.");
            return;
        }
        
        if (!service) {
            setError("Xizmat topilmadi. Iltimos, keyinroq qayta urinib ko'ring.");
            return;
        }
        
        handlePaymentRequest();
    };
    
    const handlePaymentRequest = async () => {
        if (!service || !documentFile) return;
        
        setIsSubmitting(true);
        setError(null);
        
        const formData = new FormData();
        formData.append('service_id', String(service.id));
        formData.append('attached_file', documentFile);
        formData.append('form_data_str', JSON.stringify({ 
            contactPhone,
            fileName: documentFile.name
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
        } catch (err: any) {
            setError(err.response?.data?.detail || "Buyurtmani yuborishda xatolik.");
            setIsSubmitting(false);
        }
    };

    if (isLoadingServices) {
        return <LoadingSpinner message="Xizmat ma'lumotlari yuklanmoqda..." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-light-text">Hujjat Oldindan Ko'rish</h1>
                <Button 
                    variant="secondary" 
                    onClick={() => navigate(-1)}
                    leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
                >
                    Orqaga
                </Button>
            </div>
            
            <Card title="Hujjat Oldindan Ko'rish So'rovi" icon={<EyeIcon className="h-6 w-6 text-accent-sky" />}>
                {service && (
                    <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-light-text">Xizmat narxi</h3>
                        <p className="text-2xl font-bold text-accent-sky mt-1">
                            {new Intl.NumberFormat('uz-UZ').format(Number(service.price))} UZS
                        </p>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {successMessage && (
                        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
                    )}
                    
                    {error && (
                        <Alert type="error" message={error} onClose={() => setError(null)} />
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">
                            Hujjat fayli (docx, pdf formatda)
                        </label>
                        <Input
                            type="file"
                            accept=".doc,.docx,.pdf"
                            onChange={(e) => setDocumentFile(e.target.files ? e.target.files[0] : null)}
                            required
                        />
                        <p className="mt-1 text-xs text-medium-text">
                            .doc, .docx yoki .pdf fayllarini yuklang
                        </p>
                        {documentFile && <p className="text-xs text-slate-400 mt-1">Tanlangan fayl: {documentFile.name}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">
                            Bog'lanish uchun telefon raqami
                        </label>
                        <Input
                            type="tel"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="+998 XX XXX XX XX"
                            required
                        />
                    </div>
                    
                    <div className="flex justify-end">
                        <Button 
                            type="submit" 
                            isLoading={isSubmitting}
                            disabled={isSubmitting || !service || !documentFile}
                            leftIcon={<ArrowUpOnSquareIcon className="h-5 w-5" />}
                            className="px-6"
                        >
                            To'lovga o'tish
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default DocumentPreviewPage;