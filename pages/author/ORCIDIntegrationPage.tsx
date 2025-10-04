import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { IdentificationIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const ORCIDIntegrationPage: React.FC = () => {
    const { translate } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [orcidId, setOrcidId] = useState('');
    const [fullName, setFullName] = useState('');
    const [institution, setInstitution] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        // Validation
        if (!orcidId || !fullName || !contactPhone) {
            setError("ORCID ID, to'liq ism va telefon raqami maydonlarini to'ldirish shart.");
            setIsSubmitting(false);
            return;
        }
        
        // Validate ORCID ID format (simple validation)
        const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
        if (!orcidRegex.test(orcidId)) {
            setError("Iltimos, to'g'ri ORCID ID formatini kiriting (xxxx-xxxx-xxxx-xxxx).");
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
            setOrcidId('');
            setFullName('');
            setInstitution('');
            setContactPhone('');
            
            setSuccessMessage("ORCID integratsiya so'rovingiz muvaffaqiyatli yuborildi! Siz bilan tez orada bog'lanamiz.");
        } catch (err) {
            setError("So'rovni yuborishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-light-text">ORCID Integratsiya</h1>
                <Button 
                    variant="secondary" 
                    onClick={() => navigate(-1)}
                    leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
                >
                    Orqaga
                </Button>
            </div>
            
            <Card title="ORCID Integratsiya So'rovi" icon={<IdentificationIcon className="h-6 w-6 text-accent-sky" />}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {successMessage && (
                        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
                    )}
                    
                    {error && (
                        <Alert type="error" message={error} onClose={() => setError(null)} />
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">
                            ORCID ID
                        </label>
                        <Input
                            type="text"
                            value={orcidId}
                            onChange={(e) => setOrcidId(e.target.value)}
                            placeholder="xxxx-xxxx-xxxx-xxxx"
                            required
                        />
                        <p className="mt-1 text-xs text-medium-text">
                            ORCID ID formati: xxxx-xxxx-xxxx-xxxx
                        </p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">
                            To'liq ism sharif
                        </label>
                        <Input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Ism sharifingizni kiriting"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">
                            Tashkilot/institut
                        </label>
                        <Input
                            type="text"
                            value={institution}
                            onChange={(e) => setInstitution(e.target.value)}
                            placeholder="Tashkotingiz nomini kiriting"
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
                            Integratsiya So'rovini Yuborish
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ORCIDIntegrationPage;