import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { TagIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const UDCClassificationPage: React.FC = () => {
    const { translate } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [articleTitle, setArticleTitle] = useState('');
    const [articleAbstract, setArticleAbstract] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        // Validation
        if (!articleTitle || !articleAbstract || !contactPhone) {
            setError("Maqola nomi, annotatsiya va telefon raqami maydonlarini to'ldirish shart.");
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
            setArticleTitle('');
            setArticleAbstract('');
            setContactPhone('');
            setDocumentFile(null);
            
            setSuccessMessage("UDC klassifikatsiya buyurtmangiz muvaffaqiyatli yuborildi! Siz bilan tez orada bog'lanamiz.");
        } catch (err) {
            setError("Buyurtmani yuborishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-light-text">UDC Klassifikatsiya</h1>
                <Button 
                    variant="secondary" 
                    onClick={() => navigate(-1)}
                    leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
                >
                    Orqaga
                </Button>
            </div>
            
            <Card title="UDC Klassifikatsiya Buyurtmasi" icon={<TagIcon className="h-6 w-6 text-accent-sky" />}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {successMessage && (
                        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
                    )}
                    
                    {error && (
                        <Alert type="error" message={error} onClose={() => setError(null)} />
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">
                            Maqola nomi
                        </label>
                        <Input
                            type="text"
                            value={articleTitle}
                            onChange={(e) => setArticleTitle(e.target.value)}
                            placeholder="Maqola nomini kiriting"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">
                            Maqola annotatsiyasi
                        </label>
                        <Textarea
                            value={articleAbstract}
                            onChange={(e) => setArticleAbstract(e.target.value)}
                            placeholder="Maqola annotatsiyasini kiriting"
                            rows={4}
                            required
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
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">
                            Qo'shimcha hujjatlar (ixtiyoriy)
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
                    
                    <div className="flex justify-end">
                        <Button 
                            type="submit" 
                            isLoading={isSubmitting}
                            className="px-6"
                        >
                            Klassifikatsiya Buyurtma Qilish
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default UDCClassificationPage;