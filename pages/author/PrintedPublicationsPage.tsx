import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BookOpenIcon, ArrowLeftIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import { Service } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const SERVICE_SLUG = 'printed-publications';
const ISBN_PRICE = 650000; // 650,000 UZS for ISBN service

const PrintedPublicationsPage: React.FC = () => {
    const { translate } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [service, setService] = useState<Service | null>(null);
    const [isLoadingService, setIsLoadingService] = useState(true);

    const [bookTitle, setBookTitle] = useState('');
    const [bookPages, setBookPages] = useState('');
    const [coverType, setCoverType] = useState<'hard' | 'soft'>('soft');
    const [contactPhone, setContactPhone] = useState(user?.phone || '');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [bookFile, setBookFile] = useState<File | null>(null);
    const [includeISBN, setIncludeISBN] = useState(false); // New state for ISBN option
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchService = async () => {
            setIsLoadingService(true);
            try {
                const { data } = await apiService.get<Service>(`/services/${SERVICE_SLUG}/`);
                setService(data);
            } catch (err) {
                setError("Xizmat ma'lumotlarini yuklashda xatolik yuz berdi.");
            } finally {
                setIsLoadingService(false);
            }
        };
        fetchService();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        if (!bookTitle || !bookPages || !contactPhone || !deliveryAddress || !bookFile || !service) {
            setError("Barcha maydonlarni to'ldirish shart.");
            setIsSubmitting(false);
            return;
        }
        
        const formData = new FormData();
        formData.append('service_id', String(service.id));
        formData.append('attached_file', bookFile);
        
        const formDetails = {
            bookTitle,
            bookPages,
            coverType,
            contactPhone,
            deliveryAddress,
            includeISBN, // Include ISBN option in form data
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
    
    // Calculate total price based on service and ISBN option
    const calculateTotalPrice = () => {
        if (!service) return 0;
        const basePrice = Number(service.price);
        const isbnPrice = includeISBN ? ISBN_PRICE : 0;
        return basePrice + isbnPrice;
    };
    
    if (isLoadingService) {
        return <LoadingSpinner message="Xizmat ma'lumotlari yuklanmoqda..." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-light-text">Bosma Nashrlar</h1>
                <Button 
                    variant="secondary" 
                    onClick={() => navigate(-1)}
                    leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
                >
                    Orqaga
                </Button>
            </div>
            
            <Card title="Kitob Nashr Arizasi" icon={<BookOpenIcon className="h-6 w-6 text-accent-sky" />}>
                {service && (
                    <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-light-text">Xizmat narxi</h3>
                        <p className="text-2xl font-bold text-accent-sky mt-1">
                            {new Intl.NumberFormat('uz-UZ').format(calculateTotalPrice())} UZS
                        </p>
                        {includeISBN && (
                            <div className="mt-2 text-sm text-medium-text">
                                <p>Jami: {new Intl.NumberFormat('uz-UZ').format(Number(service.price))} UZS (Asosiy xizmat)</p>
                                <p>+ {new Intl.NumberFormat('uz-UZ').format(ISBN_PRICE)} UZS (ISBN raqami)</p>
                            </div>
                        )}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}
                    {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">
                            Kitob fayli (docx, word formatda)
                        </label>
                        <Input
                            type="file"
                            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={(e) => setBookFile(e.target.files ? e.target.files[0] : null)}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">Kitob mavzusi</label>
                        <Input type="text" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} required />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">Kitob betlari soni</label>
                        <Input type="number" value={bookPages} onChange={(e) => setBookPages(e.target.value)} min="1" required />
                    </div>
                    
                    {/* ISBN Option Section */}
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="include-isbn"
                                    name="include-isbn"
                                    type="checkbox"
                                    checked={includeISBN}
                                    onChange={(e) => setIncludeISBN(e.target.checked)}
                                    className="focus:ring-accent-sky h-4 w-4 text-accent-sky border-slate-600 rounded"
                                />
                            </div>
                            <div className="ml-3 flex-1">
                                <label htmlFor="include-isbn" className="block text-sm font-medium text-light-text">
                                    Xalqaro standard ISBN raqami olish
                                </label>
                                <p className="mt-1 text-sm text-medium-text">
                                    Kitobingiz uchun xalqaro tanilgan ISBN raqamini oling. 
                                    Bu xizmat {new Intl.NumberFormat('uz-UZ').format(ISBN_PRICE)} UZS qo'shimcha to'lovni talab qiladi.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">Kitob muqova turi</label>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <input type="radio" id="hard-cover" name="cover-type" checked={coverType === 'hard'} onChange={() => setCoverType('hard')} className="h-4 w-4 text-accent-sky focus:ring-accent-sky" />
                                <label htmlFor="hard-cover" className="ml-2 text-medium-text">Qattiq muqova</label>
                            </div>
                            <div className="flex items-center">
                                <input type="radio" id="soft-cover" name="cover-type" checked={coverType === 'soft'} onChange={() => setCoverType('soft')} className="h-4 w-4 text-accent-sky focus:ring-accent-sky" />
                                <label htmlFor="soft-cover" className="ml-2 text-medium-text">Yumshoq muqova</label>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">Bog'lanish uchun telefon raqami</label>
                        <Input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">Yetkazib berish manzili</label>
                        <Textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} rows={3} required />
                    </div>
                    
                    <div className="flex justify-end">
                        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting || isLoadingService || !service} className="px-6">
                            To'lovga o'tish
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default PrintedPublicationsPage;