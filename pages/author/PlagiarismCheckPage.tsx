// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Textarea from '../../components/common/Textarea';
import { DocumentCheckIcon, ArrowUpOnSquareIcon, ClockIcon, ArrowDownTrayIcon, InformationCircleIcon, DocumentTextIcon, DocumentIcon, PlusIcon, ChartBarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { LocalizationKeys } from '../../constants';
import { UserRole } from '../../types'; // Import UserRole directly from types.ts
import apiService from '../../services/apiService';
import { Service } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PlagiarismCertificate from '../../components/common/PlagiarismCertificate';
import { PlagiarismReport } from '../../components/common/PlagiarismReport';
import { useServices } from '../../contexts/ServicesContext';

const SERVICE_SLUG = 'plagiarism-check';

// Initial document types - in a real app, this would come from an API
const INITIAL_DOCUMENT_TYPES = [
  { id: 'article', name: 'Ilmiy maqola' },
  { id: 'dissertation', name: 'Dissertatsiya' },
  { id: 'abstract', name: 'Avtoreferat' },
  { id: 'monograph', name: 'Monografiya' },
  { id: 'report', name: 'Hisobot' },
  { id: 'other', name: 'Boshqa' }
];

const PlagiarismCheckPage = () => {
    const { translate } = useLanguage();
    const { user } = useAuth();
    const { getServiceBySlug, isLoading: isLoadingServices } = useServices();
    const service = getServiceBySlug(SERVICE_SLUG);
    
    const [articleFile, setArticleFile] = useState(null);
    const [documentName, setDocumentName] = useState(''); // New field for document name
    const [documentType, setDocumentType] = useState(''); // New field for document type
    const [customDocumentType, setCustomDocumentType] = useState(''); // For adding new document types
    const [showAddType, setShowAddType] = useState(false); // Toggle for adding new document type
    const [documentDescription, setDocumentDescription] = useState(''); // New field for document description
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    
    // Document types state
    const [documentTypes, setDocumentTypes] = useState(INITIAL_DOCUMENT_TYPES);
    
    const [checkHistory, setCheckHistory] = useState([]);
    const [dataForGeneration, setDataForGeneration] = useState(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    // Check if user is admin
    const isAdmin = user?.role === UserRole.ADMIN;

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

    const handleAddDocumentType = () => {
        if (customDocumentType.trim() !== '') {
            const newId = customDocumentType.toLowerCase().replace(/\s+/g, '_');
            const newType = { id: newId, name: customDocumentType.trim() };
            
            // Check if type already exists
            if (!documentTypes.some(type => type.id === newId || type.name === customDocumentType.trim())) {
                setDocumentTypes([...documentTypes, newType]);
                setDocumentType(newId); // Automatically select the new type
                setCustomDocumentType('');
                setShowAddType(false);
            } else {
                setError("Bu hujjat turi allaqachon mavjud.");
            }
        }
    };

    const handlePaymentRequest = async () => {
        if (!articleFile || !service) {
            setError(translate(LocalizationKeys.ERROR_NO_FILE_FOR_PLAGIARISM_CHECK));
            return;
        }
        
        // Validate required fields
        if (!documentName.trim()) {
            setError("Hujjat nomini kiriting.");
            return;
        }
        
        if (!documentType) {
            setError("Hujjat turini tanlang.");
            return;
        }
        
        setIsSubmitting(true);
        setError(null);
        
        const merchantTransId = `service_plagiarism_${Date.now()}`;
        const newHistoryItem = {
            id: `check-${Date.now()}`,
            merchant_trans_id: merchantTransId,
            fileName: articleFile.name,
            documentName, // Include document name
            documentType, // Include document type
            documentDescription, // Include document description
            date: new Date().toISOString(),
            status: 'pending_payment',
            result: null
        };
        saveHistory([newHistoryItem, ...checkHistory]);

        const formData = new FormData();
        formData.append('service_id', String(service.id));
        formData.append('attached_file', articleFile);
        formData.append('form_data_str', JSON.stringify({ 
            fileName: articleFile.name, 
            checkId: newHistoryItem.id,
            documentName,
            documentType,
            documentDescription
        }));
        formData.append('merchant_trans_id_override', merchantTransId);

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

    // Check if all required fields are filled
    const isFormValid = () => {
        return articleFile && service && documentName.trim() && documentType;
    };

    if (isLoadingServices) {
        return <LoadingSpinner message="Xizmat ma'lumotlari yuklanmoqda..." />;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-accent-sky flex items-center">
                    <DocumentCheckIcon className="h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-3 text-accent-purple" />
                    {service?.name || translate(LocalizationKeys.PLAGIARISM_CHECKER_PAGE_TITLE)}
                </h1>
                {service && (
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-accent-purple/10 to-accent-sky/10 rounded-lg p-3 border border-accent-purple/30">
                        <ChartBarIcon className="h-5 w-5 text-accent-sky" />
                        <span className="text-xl font-bold text-light-text">
                            {new Intl.NumberFormat('uz-UZ').format(Number(service.price))} UZS
                        </span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card title={translate(LocalizationKeys.UPLOAD_DOCUMENT_FOR_PLAGIARISM_CHECK_LABEL)} icon={<DocumentCheckIcon className="h-6 w-6 text-purple-400" />}>
                        <div className="space-y-6">
                            {/* Document Name Field */}
                            <div>
                                <label htmlFor="documentName" className="block text-sm font-medium text-light-text mb-2">
                                    Hujjat nomi <span className="text-red-500">*</span>
                                </label>
                                <Input 
                                    id="documentName"
                                    name="documentName"
                                    placeholder="Hujjat nomini kiriting"
                                    value={documentName}
                                    onChange={(e) => setDocumentName(e.target.value)}
                                    wrapperClassName="mb-0"
                                />
                            </div>
                            
                            {/* Document Type Selection */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label htmlFor="documentType" className="block text-sm font-medium text-light-text">
                                        Hujjat turi <span className="text-red-500">*</span>
                                    </label>
                                    {/* Show add type button only for admin users */}
                                    {isAdmin && (
                                        <Button 
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowAddType(!showAddType)}
                                            leftIcon={<PlusIcon className="h-4 w-4" />}
                                        >
                                            Yangi tur qo'shish
                                        </Button>
                                    )}
                                </div>
                                
                                {showAddType ? (
                                    <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <Input
                                            type="text"
                                            value={customDocumentType}
                                            onChange={(e) => setCustomDocumentType(e.target.value)}
                                            placeholder="Yangi hujjat turi nomini kiriting"
                                        />
                                        <div className="flex space-x-2">
                                            <Button 
                                                type="button"
                                                size="sm"
                                                onClick={handleAddDocumentType}
                                            >
                                                Qo'shish
                                            </Button>
                                            <Button 
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setShowAddType(false)}
                                            >
                                                Bekor qilish
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <select
                                        id="documentType"
                                        name="documentType"
                                        value={documentType}
                                        onChange={(e) => setDocumentType(e.target.value)}
                                        className="modern-select w-full"
                                    >
                                        <option value="">Hujjat turini tanlang</option>
                                        {documentTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            
                            {/* Document Description */}
                            <div>
                                <label htmlFor="documentDescription" className="block text-sm font-medium text-light-text mb-2">
                                    Hujjat tavsifi
                                </label>
                                <Textarea
                                    id="documentDescription"
                                    name="documentDescription"
                                    placeholder="Hujjat tavsifini kiriting (ixtiyoriy)"
                                    value={documentDescription}
                                    onChange={(e) => setDocumentDescription(e.target.value)}
                                    rows={3}
                                    wrapperClassName="mb-0"
                                />
                            </div>
                            
                            {/* File Upload */}
                            <div>
                                <label htmlFor="articleFile" className="block text-sm font-medium text-light-text mb-2">.doc, .docx, .pdf</label>
                                <div className="modern-file-upload">
                                    <Input 
                                        type="file" 
                                        id="articleFile" 
                                        name="articleFile" 
                                        accept=".doc,.docx,.pdf" 
                                        onChange={(e) => setArticleFile(e.target.files?.[0])} 
                                        wrapperClassName="mb-0" 
                                    />
                                </div>
                                {articleFile && <p className="text-xs text-slate-400 mt-2">Tanlangan fayl: {articleFile.name}</p>}
                            </div>
                            
                            <Button 
                                onClick={handlePaymentRequest} 
                                isLoading={isSubmitting} 
                                disabled={isSubmitting || !isFormValid()}
                                leftIcon={<ArrowUpOnSquareIcon className="h-5 w-5" />}
                                size="lg"
                                className="w-full"
                            >
                                To'lovga o'tish
                            </Button>
                        </div>
                    </Card>
                    
                    {checkHistory.length > 0 && (
                        <Card title="Tekshiruvlar Tarixi" icon={<ClockIcon className="h-6 w-6 text-sky-400" />}>
                            <div className="overflow-x-auto">
                                <table className="modern-table">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">Hujjat nomi</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">Fayl Nomi</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">Hujjat turi</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">Sana</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">Holat</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">Natija</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">Amallar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {checkHistory.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-700/50 transition-colors">
                                                <td className="px-4 py-4 max-w-xs truncate text-sm">{item.documentName || 'Noma\'lum'}</td>
                                                <td className="px-4 py-4 max-w-xs truncate text-sm">{item.fileName}</td>
                                                <td className="px-4 py-4 text-sm">
                                                    {item.documentType ? 
                                                        documentTypes.find(t => t.id === item.documentType)?.name || item.documentType : 
                                                        'Noma\'lum'}
                                                </td>
                                                <td className="px-4 py-4 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-4">
                                                    {item.status === 'pending_payment' ? (
                                                        <span className="modern-badge modern-badge-warning">
                                                            To'lov kutilmoqda
                                                        </span>
                                                    ) : (
                                                        <span className="modern-badge modern-badge-success">
                                                            Bajarildi
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-sm">
                                                    {item.result ? (
                                                        <div className="flex items-center">
                                                            <span className={`font-medium ${item.result.originality >= 80 ? 'text-emerald-400' : item.result.originality >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                                                                {item.result.originality.toFixed(2)}% Original
                                                            </span>
                                                            {item.result.originality >= 80 && (
                                                                <span className="ml-2 modern-badge modern-badge-success">
                                                                    Tavsiya etiladi
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-500">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {item.status === 'completed' && item.result && (
                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            <Button 
                                                                size="sm" 
                                                                variant="secondary" 
                                                                onClick={() => handleDownloadCertificate(item)} 
                                                                leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />} 
                                                                isLoading={isGeneratingPdf && dataForGeneration?.data.id === item.id}
                                                                className="w-full sm:w-auto"
                                                            >
                                                                Sertifikat
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="secondary" 
                                                                onClick={() => handleDownloadReport(item)} 
                                                                leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />} 
                                                                isLoading={isGeneratingPdf && dataForGeneration?.data.id === item.id}
                                                                className="w-full sm:w-auto"
                                                            >
                                                                Hisobot
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </div>
                
                <div className="space-y-6">
                    <Card title="Ma'lumot" icon={<InformationCircleIcon className="h-6 w-6 text-sky-400" />}>
                        <div className="space-y-5">
                            <div className="flex items-start p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div className="flex-shrink-0 mt-0.5">
                                    <DocumentCheckIcon className="h-5 w-5 text-purple-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="font-semibold text-light-text">Plagiat tekshiruvi</h3>
                                    <p className="text-sm text-medium-text mt-1">
                                        Hujjatingizni plagiat tekshiruvi orqali originalligini tekshiring. 
                                        Natijada plagiat foizi va manbalar ko'rsatiladi.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div className="flex-shrink-0 mt-0.5">
                                    <ShieldCheckIcon className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="font-semibold text-light-text">Sertifikat</h3>
                                    <p className="text-sm text-medium-text mt-1">
                                        Muvaffaqiyatli tekshiruvdan so'ng plagiat sertifikati oling. 
                                        Sertifikat hujjatingizning original ekanligini tasdiqlaydi.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                <div className="flex-shrink-0 mt-0.5">
                                    <DocumentTextIcon className="h-5 w-5 text-amber-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="font-semibold text-light-text">Hujjat ma'lumotlari</h3>
                                    <p className="text-sm text-medium-text mt-1">
                                        Hujjat nomi, turi va tavsifi to'liq kiritilishi talab qilinadi. 
                                        Bu ma'lumotlar hisobot va sertifikatda ko'rsatiladi.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                    
                    <div className="bg-gradient-to-r from-purple-500/10 to-sky-500/10 rounded-xl p-5 border border-purple-500/30">
                        <h3 className="font-semibold text-light-text mb-3 flex items-center">
                            <ChartBarIcon className="h-5 w-5 mr-2 text-purple-400" />
                            Tekshiruv statistikasi
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-medium-text">Jami tekshiruvlar</span>
                                    <span className="text-light-text font-medium">{checkHistory.length}</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div 
                                        className="bg-gradient-to-r from-purple-500 to-sky-500 h-2 rounded-full" 
                                        style={{ width: '100%' }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-medium-text">Muvaffaqiyatli</span>
                                    <span className="text-light-text font-medium">
                                        {checkHistory.filter(item => item.status === 'completed').length}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div 
                                        className="bg-emerald-500 h-2 rounded-full" 
                                        style={{ 
                                            width: checkHistory.length ? 
                                                `${(checkHistory.filter(item => item.status === 'completed').length / checkHistory.length) * 100}%` : 
                                                '0%' 
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-medium-text">To'lov kutilmoqda</span>
                                    <span className="text-light-text font-medium">
                                        {checkHistory.filter(item => item.status === 'pending_payment').length}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div 
                                        className="bg-amber-500 h-2 rounded-full" 
                                        style={{ 
                                            width: checkHistory.length ? 
                                                `${(checkHistory.filter(item => item.status === 'pending_payment').length / checkHistory.length) * 100}%` : 
                                                '0%' 
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mt-4" />}
            {successMessage && <Alert type="success" message={successMessage} className="mt-4" />}

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