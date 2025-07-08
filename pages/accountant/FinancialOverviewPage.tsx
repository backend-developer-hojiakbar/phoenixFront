import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BanknotesIcon, DocumentCheckIcon, CheckCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { FinancialReport, Article } from '../../types';
import { LocalizationKeys } from '../../constants';
import apiService from '../../services/apiService';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import DocumentViewer from '../../components/common/DocumentViewer';

const FinancialOverviewPage: React.FC = () => {
    const { translate } = useLanguage();
    const [financialData, setFinancialData] = useState<FinancialReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [submissionFee, setSubmissionFee] = useState<string>('');
    const [isApproving, setIsApproving] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await apiService.get<FinancialReport>('/financial-reports/');
            setFinancialData(data);
        } catch (err) {
            setError("Moliyaviy hisobotni yuklashda xatolik yuz berdi.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenApprovalModal = (article: Article) => {
        setSelectedArticle(article);
        setSubmissionFee(article.submission_fee || '0.00');
        setIsModalOpen(true);
    };

    const handleApprovePayment = async () => {
        if (!selectedArticle || !submissionFee) {
            setError("Iltimos, narxni kiriting.");
            return;
        }
        setIsApproving(true);
        setError(null);
        setSuccess(null);
        try {
            await apiService.post(`/admin/approve-payment/${selectedArticle.id}/`, {
                submission_fee: submissionFee
            });
            setSuccess("To'lov muvaffaqiyatli tasdiqlandi!");
            setIsModalOpen(false);
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.error || "To'lovni tasdiqlashda xatolik yuz berdi.");
        } finally {
            setIsApproving(false);
        }
    };
    
    if (isLoading && !financialData) {
        return <LoadingSpinner message="Moliyaviy ma'lumotlar yuklanmoqda..." />;
    }
    
    return (
        <>
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-accent-sky flex items-center">
                    <BanknotesIcon className="h-8 w-8 mr-3" />
                    {translate(LocalizationKeys.FINANCIAL_OVERVIEW_TITLE)}
                </h1>
                
                {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
                {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

                {financialData && (
                    <>
                        <Card title={translate(LocalizationKeys.TOTAL_REVENUE)} icon={<BanknotesIcon className="h-6 w-6 text-accent-emerald"/>}>
                            <p className="text-3xl font-bold text-light-text">{new Intl.NumberFormat('uz-UZ').format(Number(financialData.total_revenue))} UZS</p>
                        </Card>

                        <Card title="Tasdiqlanishi Kutilayotgan To'lovlar">
                            {financialData.payments_pending_approval_list.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-700">
                                        <thead className="bg-slate-800">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Maqola</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Muallif</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Chekni Ko'rish</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Amal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-secondary-dark divide-y divide-slate-700">
                                            {financialData.payments_pending_approval_list.map(article => (
                                                <tr key={article.id} className="hover:bg-slate-700/50">
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-light-text">{article.title}</td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-medium-text">{article.author.name} {article.author.surname}</td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                         <Button 
                                                            size="sm"
                                                            variant='ghost'
                                                            onClick={() => handleOpenApprovalModal(article)}
                                                            leftIcon={<EyeIcon className="h-4 w-4"/>}
                                                        >
                                                            Ko'rish va Tasdiqlash
                                                        </Button>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handleOpenApprovalModal(article)} 
                                                            leftIcon={<CheckCircleIcon className="h-4 w-4"/>}
                                                        >
                                                            Tasdiqlash
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-center text-medium-text py-8">Tasdiqlanishi kutilayotgan to'lovlar mavjud emas.</p>
                            )}
                        </Card>
                    </>
                )}
            </div>

            {selectedArticle && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`To'lovni tasdiqlash: ${selectedArticle.title}`} size="3xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className='text-lg font-semibold text-light-text mb-2'>Foydalanuvchi yuklagan kvitansiya</h4>
                            <DocumentViewer fileUrl={selectedArticle.submissionReceiptFileUrl!} fileName="Kvitansiya" />
                        </div>
                        <div className="flex flex-col">
                             <h4 className='text-lg font-semibold text-light-text mb-2'>Tasdiqlash va Narx belgilash</h4>
                             <Input 
                                label="Topshirish narxi (Submission Fee)"
                                type="number"
                                value={submissionFee}
                                onChange={(e) => setSubmissionFee(e.target.value)}
                                placeholder='Masalan: 50000.00'
                                required
                             />
                             <div className='mt-auto flex justify-end space-x-3'>
                                <Button variant='secondary' onClick={() => setIsModalOpen(false)}>Bekor qilish</Button>
                                <Button onClick={handleApprovePayment} isLoading={isApproving}>
                                    Tasdiqlash va Yuborish
                                </Button>
                             </div>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default FinancialOverviewPage;