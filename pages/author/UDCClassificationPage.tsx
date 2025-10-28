import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { TagIcon, ArrowLeftIcon, ArrowUpOnSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import { useServices } from '../../contexts/ServicesContext';
import { UserRole } from '../../types';

const SERVICE_SLUG = 'udc-classification';

const UDCClassificationPage: React.FC = () => {
    const { translate } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { getServiceBySlug, isLoading: isLoadingServices } = useServices();
    const service = getServiceBySlug(SERVICE_SLUG);

    const [articleTitle, setArticleTitle] = useState('');
    const [articleAbstract, setArticleAbstract] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [field, setField] = useState(''); // Selected field
    const [customField, setCustomField] = useState(''); // For adding new fields
    const [showAddField, setShowAddField] = useState(false); // Toggle for adding new field
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingFields, setIsLoadingFields] = useState(true);

    // Fetch SOHA fields from backend
    const [fieldOptions, setFieldOptions] = useState<{ id: number; name: string }[]>([]);

    // Check if user is admin
    const isAdmin = user?.role === UserRole.ADMIN;

    useEffect(() => {
        const fetchSohaFields = async () => {
            setIsLoadingFields(true);
            try {
                const { data } = await apiService.get('/soha-fields/');
                setFieldOptions(data);
                // Set default field to first option if available
                if (data.length > 0 && !field) {
                    setField(data[0].id.toString());
                }
            } catch (err) {
                setError("SOHA maydonlarini yuklashda xatolik yuz berdi.");
                // Fallback to default options if API fails
                const defaultOptions = [
                    { id: 1, name: 'Fizika' },
                    { id: 2, name: 'Kimyo' },
                    { id: 3, name: 'Biologiya' },
                    { id: 4, name: 'Matematika' },
                    { id: 5, name: 'Kompyuter fanlari' },
                    { id: 6, name: 'Tibbiyot' },
                    { id: 7, name: 'Muhandislik' },
                    { id: 8, name: 'Iqtisodiyot' },
                    { id: 9, name: 'Adabiyot' },
                    { id: 10, name: 'Tarix' }
                ];
                setFieldOptions(defaultOptions);
                if (defaultOptions.length > 0 && !field) {
                    setField(defaultOptions[0].id.toString());
                }
            } finally {
                setIsLoadingFields(false);
            }
        };
        
        fetchSohaFields();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!articleTitle || !articleAbstract || !contactPhone || !field) {
            setError("Maqola nomi, annotatsiya, telefon raqami va soha maydonlarini to'ldirish shart.");
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
        if (!service) return;
        
        setIsSubmitting(true);
        setError(null);
        
        const formData = new FormData();
        formData.append('service_id', String(service.id));
        if (documentFile) {
            formData.append('attached_file', documentFile);
        }
        
        // Find the selected field name
        const selectedField = fieldOptions.find(option => option.id.toString() === field);
        
        formData.append('form_data_str', JSON.stringify({ 
            articleTitle,
            articleAbstract,
            contactPhone,
            field: selectedField ? selectedField.name : field,
            fieldId: field,
            fileName: documentFile?.name || ''
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

    const handleAddField = async () => {
        if (customField.trim() !== '') {
            // Check if field already exists
            if (fieldOptions.some(option => option.name.toLowerCase() === customField.trim().toLowerCase())) {
                setError("Bu soha allaqachon mavjud.");
                return;
            }
            
            try {
                const response = await apiService.post('/soha-fields/', { name: customField.trim() });
                setFieldOptions([...fieldOptions, response.data]);
                setField(response.data.id.toString()); // Automatically select the new field
                setCustomField('');
                setShowAddField(false);
            } catch (err: any) {
                setError("Yangi soha qo'shishda xatolik yuz berdi.");
            }
        }
    };
 
    if (isLoadingServices || isLoadingFields) {
        return <LoadingSpinner message="Xizmat ma'lumotlari yuklanmoqda..." />;
    }

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
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-medium-text">
                                Soha
                            </label>
                            {/* Show add field button only for admin users */}
                            {isAdmin && (
                                <Button 
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowAddField(!showAddField)}
                                    leftIcon={<PlusIcon className="h-4 w-4" />}
                                >
                                    Yangi soha qo'shish
                                </Button>
                            )}
                        </div>
                        
                        {showAddField ? (
                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    value={customField}
                                    onChange={(e) => setCustomField(e.target.value)}
                                    placeholder="Yangi soha nomini kiriting"
                                />
                                <div className="flex space-x-2">
                                    <Button 
                                        type="button"
                                        size="sm"
                                        onClick={handleAddField}
                                    >
                                        Qo'shish
                                    </Button>
                                    <Button 
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setShowAddField(false)}
                                    >
                                        Bekor qilish
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <select
                                value={field}
                                onChange={(e) => setField(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-light-text focus:outline-none focus:ring-2 focus:ring-accent-sky"
                                required
                            >
                                <option value="">Soha tanlang</option>
                                {fieldOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        )}
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
                        {documentFile && <p className="text-xs text-slate-400 mt-1">Tanlangan fayl: {documentFile.name}</p>}
                    </div>
                    
                    <div className="flex justify-end">
                        <Button 
                            type="submit" 
                            isLoading={isSubmitting}
                            disabled={isSubmitting || !service}
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

export default UDCClassificationPage;