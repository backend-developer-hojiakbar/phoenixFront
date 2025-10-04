import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { GlobeAltIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../../services/apiService';
import { Service } from '../../types';

const TranslationServicePage: React.FC = () => {
    const { translate } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    const service: Service | undefined = location.state?.service;

    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [sourceLanguage, setSourceLanguage] = useState('uz');
    const [targetLanguage, setTargetLanguage] = useState('en');
    const [documentTitle, setDocumentTitle] = useState('');
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [contactPhone, setContactPhone] = useState(user?.phone || '');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        if (!documentFile || !documentTitle || !contactPhone || !service) {
            setError("Barcha majburiy maydonlarni to'ldirish shart.");
            setIsSubmitting(false);
            return;
        }
        
        const formData = new FormData();
        formData.append('service_id', String(service.id));
        formData.append('attached_file', documentFile);
        
        const formDetails = {
            documentTitle,
            sourceLanguage,
            targetLanguage,
            specialInstructions,
            contactPhone,
        };
        formData.append('form_data_str', JSON.stringify(formDetails));
        
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

    if (!service) {
        return <LoadingSpinner message="Xizmat ma'lumotlari yuklanmoqda..." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-light-text">{service.name}</h1>
                <Button 
                    variant="secondary" 
                    onClick={() => navigate(-1)}
                    leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
                >
                    Orqaga
                </Button>
            </div>
            
            <Card title="Hujjat Tarjima Buyurtmasi" icon={<GlobeAltIcon className="h-6 w-6 text-accent-sky" />}>
                <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <h3 className="text-lg font-semibold text-light-text">Xizmat narxi</h3>
                    <p className="text-2xl font-bold text-accent-sky mt-1">
                        {new Intl.NumberFormat('uz-UZ').format(Number(service.price))} UZS
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}
                    {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">Hujjat fayli (docx, pdf formatda)</label>
                        <Input type="file" accept=".doc,.docx,.pdf" onChange={(e) => setDocumentFile(e.target.files ? e.target.files[0] : null)} required />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">Hujjat nomi</label>
                        <Input type="text" value={documentTitle} onChange={(e) => setDocumentTitle(e.target.value)} required />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-medium-text mb-1">Manba til</label>
                            <select value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-light-text focus:outline-none focus:ring-2 focus:ring-accent-sky">
                                <option value="uz">O'zbekcha</option>
                                <option value="ru">Ruscha</option>
                                <option value="en">Inglizcha</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-medium-text mb-1">Maqsad til</label>
                            <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-light-text focus:outline-none focus:ring-2 focus:ring-accent-sky">
                                <option value="en">Inglizcha</option>
                                <option value="ru">Ruscha</option>
                                <option value="uz">O'zbekcha</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">Maxsus ko'rsatmalar</label>
                        <Textarea value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} rows={3} />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">Bog'lanish uchun telefon raqami</label>
                        <Input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
                    </div>
                    
                    <div className="flex justify-end">
                        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting || !service} className="px-6">To'lovga o'tish</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default TranslationServicePage;