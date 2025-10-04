import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { AcademicCapIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const GoogleScholarIndexingPage: React.FC = () => {
    const { translate } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [articleTitle, setArticleTitle] = useState('');
    const [articleDOI, setArticleDOI] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        // Validation
        if (!articleTitle || !contactPhone) {
            setError("Maqola nomi va telefon raqami maydonlarini to'ldirish shart.");
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
        
        // Validate DOI format if provided (simple validation)
        if (articleDOI && !articleDOI.startsWith('10.')) {
            setError("Iltimos, to'g'ri DOI formatini kiriting (10.xxxx/xxxxx).");
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
            setArticleDOI('');
            setContactPhone('');
            setAdditionalNotes('');
            
            setSuccessMessage("Google Scholar indekslash so'rovingiz muvaffaqiyatli yuborildi! Siz bilan tez orada bog'lanamiz.");
        } catch (err) {
            setError("So'rovni yuborishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-light-text">Google Scholar Indeksatsiya</h1>
                <Button 
                    variant="secondary" 
                    onClick={() => navigate(-1)}
                    leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
                >
                    Orqaga
                </Button>
            </div>
            
            <Card title="Google Scholar Indeksatsiya So'rovi" icon={<AcademicCapIcon className="h-6 w-6 text-accent-sky" />}>
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
                            Maqola DOI (ixtiyoriy)
                        </label>
                        <Input
                            type="text"
                            value={articleDOI}
                            onChange={(e) => setArticleDOI(e.target.value)}
                            placeholder="10.xxxx/xxxxx"
                        />
                        <p className="mt-1 text-xs text-medium-text">
                            DOI formati: 10.xxxx/xxxxx
                        </p>
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
                            Qo'shimcha eslatmalar (ixtiyoriy)
                        </label>
                        <Textarea
                            value={additionalNotes}
                            onChange={(e) => setAdditionalNotes(e.target.value)}
                            placeholder="Indeksatsiya bo'yicha maxsus talablaringizni kiriting"
                            rows={3}
                        />
                    </div>
                    
                    <div className="flex justify-end">
                        <Button 
                            type="submit" 
                            isLoading={isSubmitting}
                            className="px-6"
                        >
                            Indeksatsiya So'rash
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default GoogleScholarIndexingPage;