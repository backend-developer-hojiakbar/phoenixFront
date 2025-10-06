import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ChartBarIcon, ArrowLeftIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import { useServices } from '../../contexts/ServicesContext';

const SERVICE_SLUG = 'statistical-reports';

const StatisticalReportsPage: React.FC = () => {
    const { translate } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { getServiceBySlug, isLoading: isLoadingServices } = useServices();
    const service = getServiceBySlug(SERVICE_SLUG);

    const [reportType, setReportType] = useState('article-statistics');
    const [dateRange, setDateRange] = useState('last-month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!contactPhone) {
            setError("Telefon raqami maydonini to'ldirish shart.");
            return;
        }
        
        // Validate phone number format (simple validation)
        const phoneRegex = /^\+?[0-9\s\-\(\)]+$/;
        if (!phoneRegex.test(contactPhone)) {
            setError("Iltimos, to'g'ri telefon raqamini kiriting.");
            return;
        }
        
        // Validate custom date range if selected
        if (dateRange === 'custom' && (!customStartDate || !customEndDate)) {
            setError("Maxsus sana oralig'ini kiriting.");
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
        formData.append('form_data_str', JSON.stringify({ 
            reportType,
            dateRange,
            customStartDate,
            customEndDate,
            contactPhone,
            additionalNotes
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
                <h1 className="text-2xl font-bold text-light-text">Statistik Hisobotlar</h1>
                <Button 
                    variant="secondary" 
                    onClick={() => navigate(-1)}
                    leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
                >
                    Orqaga
                </Button>
            </div>
            
            <Card title="Statistik Hisobot So'rovi" icon={<ChartBarIcon className="h-6 w-6 text-accent-sky" />}>
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
                            Hisobot turi
                        </label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-light-text focus:outline-none focus:ring-2 focus:ring-accent-sky"
                        >
                            <option value="article-statistics">Maqola statistikasi</option>
                            <option value="journal-statistics">Jurnal statistikasi</option>
                            <option value="publication-statistics">Nashr statistikasi</option>
                            <option value="user-statistics">Foydalanuvchi statistikasi</option>
                            <option value="financial-statistics">Moliyaviy statistika</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-medium-text mb-1">
                            Sana oralig'i
                        </label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-light-text focus:outline-none focus:ring-2 focus:ring-accent-sky"
                        >
                            <option value="last-week">O'tgan hafta</option>
                            <option value="last-month">O'tgan oy</option>
                            <option value="last-quarter">O'tgan kvartal</option>
                            <option value="last-year">O'tgan yil</option>
                            <option value="custom">Maxsus sana oralig'i</option>
                        </select>
                    </div>
                    
                    {dateRange === 'custom' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-medium-text mb-1">
                                    Boshlanish sanasi
                                </label>
                                <Input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-medium-text mb-1">
                                    Tugash sanasi
                                </label>
                                <Input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                    
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
                            placeholder="Hisobot bo'yicha maxsus talablaringizni kiriting"
                            rows={3}
                        />
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

export default StatisticalReportsPage;