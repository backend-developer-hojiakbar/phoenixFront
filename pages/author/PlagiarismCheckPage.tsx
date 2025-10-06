// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { DocumentCheckIcon, ArrowUpOnSquareIcon, ClockIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { LocalizationKeys } from '../../constants';
import apiService from '../../services/apiService';
import { Service } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PlagiarismCertificate from '../../components/common/PlagiarismCertificate';
import { PlagiarismReport } from '../../components/common/PlagiarismReport';
import { useServices } from '../../contexts/ServicesContext';

const SERVICE_SLUG = 'plagiarism-check';

const PlagiarismCheckPage = () => {
    const { translate } = useLanguage();
    const { user } = useAuth();
    const { getServiceBySlug, isLoading: isLoadingServices } = useServices();
    const service = getServiceBySlug(SERVICE_SLUG);
    
    const [articleFile, setArticleFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    
    const [checkHistory, setCheckHistory] = useState([]);
    const [dataForGeneration, setDataForGeneration] = useState(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const loadHistory = () => {
        if (user) {
            const storedHistory = localStorage.getItem(`plagiarismHistory_${user.id}`);
            setCheckHistory(storedHistory ? JSON.parse(storedHistory) : []);
        }
    };

    useEffect(() => {
        loadHistory();
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const completedPayments = JSON.parse(localStorage.getItem('completedPayments') || '[]');
        const newCompletedChecks = [];

        checkHistory.forEach(item => {
            if (item.status === 'pending_payment' && completedPayments.includes(item.merchant_trans_id)) {
                handleSimulateCheck(item.id);
                newCompletedChecks.push(item.merchant_trans_id);
            }
        });

        if (newCompletedChecks.length > 0) {
            const updatedPayments = completedPayments.filter(id => !newCompletedChecks.includes(id));
            localStorage.setItem('completedPayments', JSON.stringify(updatedPayments));
        }
    }, [checkHistory, user]);

    const saveHistory = (newHistory) => {
        if(user) {
            localStorage.setItem(`plagiarismHistory_${user.id}`, JSON.stringify(newHistory));
            setCheckHistory(newHistory);
        }
    };

    const handlePaymentRequest = async () => {
        if (!articleFile || !service) {
            setError(translate(LocalizationKeys.ERROR_NO_FILE_FOR_PLAGIARISM_CHECK));
            return;
        }
        
        setIsSubmitting(true);
        setError(null);
        
        const merchantTransId = `service_plagiarism_${Date.now()}`;
        const newHistoryItem = {
            id: `check-${Date.now()}`,
            merchant_trans_id: merchantTransId,
            fileName: articleFile.name,
            date: new Date().toISOString(),
            status: 'pending_payment',
            result: null
        };
        saveHistory([newHistoryItem, ...checkHistory]);

        const formData = new FormData();
        formData.append('service_id', String(service.id));
        formData.append('attached_file', articleFile);
        formData.append('form_data_str', JSON.stringify({ fileName: articleFile.name, checkId: newHistoryItem.id }));
        formData.append('merchant_trans_id_override', merchantTransId); // Agar backend qo'llab-quvvatlasa

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
    
    const handleSimulateCheck = (checkId) => {
        const originality = Math.random() * (99.8 - 60) + 60;
        const mockResult = {
            originality: originality,
            plagiarism: 100 - originality,
            sources: [
                { similarity: (100 - originality) * 0.4, link: 'https://namdu.uz/media/Books/tarbiya.pdf', type: 'INTERNET PLUS' },
                { similarity: (100 - originality) * 0.3, link: 'http://elibrary.ru/item.asp?id=54934905', type: 'eLIBRARY.RU' },
                { similarity: (100 - originality) * 0.2, link: 'https://fayllar.org/asosiy-qism-tarbiyaviy.html', type: 'INTERNET PLUS' },
                { similarity: (100 - originality) * 0.1, link: 'WVFmrn3LkFEMEpWnFr00_file.pdf', type: 'INTERNET PLUS' },
            ]
        };
        const updatedHistory = checkHistory.map(item => 
            item.id === checkId ? { ...item, status: 'completed', result: mockResult } : item
        );
        saveHistory(updatedHistory);
    };

    const generatePdf = async (elementId, options, fileName) => {
        setIsGeneratingPdf(true);
        const input = document.getElementById(elementId);
        if (!input) {
            setError('PDF yaratish uchun element topilmadi.');
            setIsGeneratingPdf(false);
            return;
        }

        try {
            const canvas = await html2canvas(input, { scale: 3, useCORS: true });
            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            const pdf = new jsPDF(options);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(fileName);
        } catch (e) {
            setError('PDF yaratishda xatolik: ' + e.message);
        } finally {
            setIsGeneratingPdf(false);
            setDataForGeneration(null);
        }
    };

    const handleDownloadCertificate = (checkItem) => {
        setDataForGeneration({ type: 'certificate', data: checkItem });
        setTimeout(() => {
            generatePdf(
                'certificate-to-download',
                { orientation: 'landscape', unit: 'px', format: [1024, 724] },
                `sertifikat-${checkItem.id}.pdf`
            );
        }, 100);
    };

    const handleDownloadReport = (checkItem) => {
        setDataForGeneration({ type: 'report', data: checkItem });
        setTimeout(() => {
            generatePdf(
                'report-to-download',
                { orientation: 'portrait', unit: 'pt', format: 'a4' },
                `xulosa-${checkItem.id}.pdf`
            );
        }, 100);
    };

    if (isLoadingServices) {
        return <LoadingSpinner message="Xizmat ma'lumotlari yuklanmoqda..." />;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-accent-sky flex items-center">
                <DocumentCheckIcon className="h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-3 text-accent-purple" />
                {service?.name || translate(LocalizationKeys.PLAGIARISM_CHECKER_PAGE_TITLE)}
            </h1>

            <Card title={translate(LocalizationKeys.UPLOAD_DOCUMENT_FOR_PLAGIARISM_CHECK_LABEL)} icon={<DocumentCheckIcon className="h-6 w-6 text-purple-400" />}>
                 {service && (
                    <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-light-text">Xizmat narxi</h3>
                        <p className="text-2xl font-bold text-accent-sky mt-1">{new Intl.NumberFormat('uz-UZ').format(Number(service.price))} UZS</p>
                    </div>
                )}
                
                <div className="mb-4">
                    <label htmlFor="articleFile" className="block text-sm font-medium text-light-text mb-1">.doc, .docx, .pdf</label>
                    <Input type="file" id="articleFile" name="articleFile" accept=".doc,.docx,.pdf" onChange={(e) => setArticleFile(e.target.files?.[0])} wrapperClassName="mb-0" />
                    {articleFile && <p className="text-xs text-slate-400 mt-1">Tanlangan fayl: {articleFile.name}</p>}
                </div>
                
                <Button onClick={handlePaymentRequest} isLoading={isSubmitting} disabled={isSubmitting || !service || !articleFile} leftIcon={<ArrowUpOnSquareIcon className="h-5 w-5" />}>
                    To'lovga o'tish
                </Button>
                
                {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mt-4" />}
                {successMessage && <Alert type="success" message={successMessage} className="mt-4" />}
            </Card>

            {checkHistory.length > 0 && (
                <Card title="Tekshiruvlar Tarixi" icon={<ClockIcon className="h-6 w-6 text-sky-400" />}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-800"><tr><th className="px-4 py-3 text-left">Fayl Nomi</th><th className="px-4 py-3 text-left">Sana</th><th className="px-4 py-3 text-left">Holat</th><th className="px-4 py-3 text-left">Natija</th><th className="px-4 py-3 text-left">Amallar</th></tr></thead>
                            <tbody className="bg-secondary-dark divide-y divide-slate-700">
                                {checkHistory.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-4 max-w-xs truncate">{item.fileName}</td>
                                        <td className="px-4 py-4">{new Date(item.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-4">{item.status === 'pending_payment' ? <span className="text-amber-400">To'lov kutilmoqda</span> : <span className="text-emerald-400">Bajarildi</span>}</td>
                                        <td className="px-4 py-4">{item.result ? `${item.result.originality.toFixed(2)}% Original` : 'N/A'}</td>
                                        <td className="px-4 py-4 space-x-2">
                                            {item.status === 'completed' && item.result && (
                                                <>
                                                    <Button size="sm" variant="secondary" onClick={() => handleDownloadCertificate(item)} leftIcon={<ArrowDownTrayIcon className="h-4"/>} isLoading={isGeneratingPdf && dataForGeneration?.data.id === item.id}>Sertifikat</Button>
                                                    <Button size="sm" variant="secondary" onClick={() => handleDownloadReport(item)} leftIcon={<ArrowDownTrayIcon className="h-4"/>} isLoading={isGeneratingPdf && dataForGeneration?.data.id === item.id}>Hisobot</Button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {isGeneratingPdf && <LoadingSpinner message="PDF yaratilmoqda..." />}
            {dataForGeneration && dataForGeneration.type === 'certificate' && (
                <PlagiarismCertificate 
                    userName={user?.get_full_name || `${user.name} ${user.surname}`} 
                    fileName={dataForGeneration.data.fileName} 
                    originality={dataForGeneration.data.result.originality} 
                    date={new Date(dataForGeneration.data.date).toLocaleDateString()} 
                    checkId={dataForGeneration.data.id.split('-')[1]} 
                />
            )}
            {dataForGeneration && dataForGeneration.type === 'report' && (
                 <PlagiarismReport 
                    userName={user?.get_full_name || `${user.name} ${user.surname}`} 
                    fileName={dataForGeneration.data.fileName} 
                    date={new Date(dataForGeneration.data.date).toLocaleDateString()} 
                    originality={dataForGeneration.data.result.originality}
                    plagiarism={dataForGeneration.data.result.plagiarism}
                    sources={dataForGeneration.data.result.sources}
                />
            )}
        </div>
    );
};

export default PlagiarismCheckPage;