import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { UserGroupIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const CoAuthorManagementPage: React.FC = () => {
    const { translate } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [coAuthorName, setCoAuthorName] = useState('');
    const [coAuthorEmail, setCoAuthorEmail] = useState('');
    const [coAuthorInstitution, setCoAuthorInstitution] = useState('');
    const [coAuthorORCID, setCoAuthorORCID] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        // Validation
        if (!coAuthorName || !coAuthorEmail || !contactPhone) {
            setError("Ham muallif ismi, emaili va telefon raqami maydonlarini to'ldirish shart.");
            setIsSubmitting(false);
            return;
        }
        
        // Validate email format (simple validation)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(coAuthorEmail)) {
            setError("Iltimos, to'g'ri email manzilini kiriting.");
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
            setCoAuthorName('');
            setCoAuthorEmail('');
            setCoAuthorInstitution('');
            setCoAuthorORCID('');
            setContactPhone('');
            
            setSuccessMessage("Ham muallif qo'shish so'rovingiz muvaffaqiyatli yuborildi! Siz bilan tez orada bog'lanamiz.");
        } catch (err) {
            setError("So'rovni yuborishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-light-text">Ham Mualliflarni Boshqarish</h1>
                <Button 
                    variant="secondary" 
                    onClick={() => navigate(-1)}
                    leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
                >
                    Orqaga
                </Button>
            </div>
            
            <Card title="Ham Muallif Qo'shish" icon={<UserGroupIcon className="h-6 w-6 text-accent-sky" />}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {successMessage && (
                        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
                    )}
                    
                    {error && (
                        <Alert type="error" message={error} onClose={() => setError(null)} />
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">
                            Ham muallif ismi
                        </label>
                        <Input
                            type="text"
                            value={coAuthorName}
                            onChange={(e) => setCoAuthorName(e.target.value)}
                            placeholder="Ham muallif ismini kiriting"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">
                            Ham muallif emaili
                        </label>
                        <Input
                            type="email"
                            value={coAuthorEmail}
                            onChange={(e) => setCoAuthorEmail(e.target.value)}
                            placeholder="Ham muallif email manzilini kiriting"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">
                            Ham muallif tashkiloti (ixtiyoriy)
                        </label>
                        <Input
                            type="text"
                            value={coAuthorInstitution}
                            onChange={(e) => setCoAuthorInstitution(e.target.value)}
                            placeholder="Tashkotingiz nomini kiriting"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">
                            Ham muallif ORCID ID (ixtiyoriy)
                        </label>
                        <Input
                            type="text"
                            value={coAuthorORCID}
                            onChange={(e) => setCoAuthorORCID(e.target.value)}
                            placeholder="xxxx-xxxx-xxxx-xxxx"
                        />
                        <p className="mt-1 text-xs text-medium-text">
                            ORCID ID formati: xxxx-xxxx-xxxx-xxxx
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
                    
                    <div className="flex justify-end">
                        <Button 
                            type="submit" 
                            isLoading={isSubmitting}
                            className="px-6"
                        >
                            Ham Muallifni Qo'shish
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CoAuthorManagementPage;