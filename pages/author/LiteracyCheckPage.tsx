import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BookOpenIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const LiteracyCheckPage: React.FC = () => {
    const { translate } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [documentContent, setDocumentContent] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        // Validation
        if ((!documentFile && !documentContent) || !contactPhone) {
            setError("Hujjat fayli yoki matn mazmunini kiriting va telefon raqamini kiriting.");
            setIsSubmitting(false);
            return;
        }
        
        // Validate phone number format (simple validation)
        const phoneRegex = /^\+?[0-9\s\-\(\)]+$/;
        if (!phoneRegex.test(contactPhone)) {
            setError("Iltimos, to'g'ri telefon raqamini kiriting.");
            setIsSubmitting(false);
            return;
        }
        
        // In a real application, you would submit this data to your backend API
        // For now, we'll just simulate a successful submission
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Reset form
            setDocumentFile(null);
            setDocumentContent('');
            setContactPhone('');
            
            setSuccessMessage("Savodxonlik tekshiruvi buyurtmangiz muvaffaqiyatli yuborildi! Siz bilan tez orada bog'lanamiz.");
        } catch (err) {
            setError("Buyurtmani yuborishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-light-text">Savodxonlik Tekshiruvi</h1>
                <Button 
                    variant="secondary" 
                    onClick={() => navigate(-1)}
                    leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
                >
                    Orqaga
                </Button>
            </div>
            
            <Card title="Savodxonlik Tekshiruvi Buyurtmasi" icon={<CheckCircleIcon className="h-6 w-6 text-accent-sky" />}>
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
                        />
                        <p className="mt-1 text-xs text-medium-text">
                            .doc, .docx yoki .pdf fayllarini yuklang
                        </p>
                    </div>
                    
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-slate-900 text-medium-text">YOKI</span>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">
                            Hujjat matni
                        </label>
                        <Textarea
                            value={documentContent}
                            onChange={(e) => setDocumentContent(e.target.value)}
                            placeholder="Tekshirish uchun hujjat matnini kiriting"
                            rows={6}
                        />
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
                            className="px-6"
                        >
                            Tekshiruvni Buyurtma Qilish
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default LiteracyCheckPage;