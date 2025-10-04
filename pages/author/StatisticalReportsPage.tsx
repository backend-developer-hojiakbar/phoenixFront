import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ChartBarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const StatisticalReportsPage: React.FC = () => {
    const { translate } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();

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
        setIsSubmitting(true);
        setError(null);
        
        // Validation
        if (!contactPhone) {
            setError("Telefon raqami maydonini to'ldirish shart.");
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
        
        // Validate custom date range if selected
        if (dateRange === 'custom' && (!customStartDate || !customEndDate)) {
            setError("Maxsus sana oralig'ini kiriting.");
            setIsSubmitting(false);
            return;
        }
        
        // In a real application, you would submit this data to your backend API
        // For now, we'll just simulate a successful submission
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Reset form
            setReportType('article-statistics');
            setDateRange('last-month');
            setCustomStartDate('');
            setCustomEndDate('');
            setContactPhone('');
            setAdditionalNotes('');
            
            setSuccessMessage("Statistik hisobot so'rovingiz muvaffaqiyatli yuborildi! Siz bilan tez orada bog'lanamiz.");
        } catch (err) {
            setError("So'rovni yuborishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            className="px-6"
                        >
                            Hisobotni So'rash
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default StatisticalReportsPage;