
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal'; 
import { DocumentCheckIcon, ArrowUpOnSquareIcon, CheckCircleIcon, ArrowDownTrayIcon, ShieldCheckIcon, SparklesIcon, InformationCircleIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { LocalizationKeys, API_KEY_ERROR_MESSAGE, PLAGIARISM_CERTIFICATE_THRESHOLD, AI_CONTENT_CERTIFICATE_THRESHOLD, MOCK_PLAGIARISM_CHECK_PRICE } from '../../constants';
import * as geminiService from '../../services/geminiService';
import { PlagiarismCheckResult, AIContentAnalysisReportItem, CheckHistoryItem, PaymentStatus } from '../../types';


const PlagiarismCheckPage: React.FC = () => {
    const { translate } = useLanguage();
    const { user } = useAuth();
    const apiKey = process.env.API_KEY;

    const [articleFile, setArticleFile] = useState<File | null>(null);
    const [filePreviewName, setFilePreviewName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    // Payment Flow State
    const [isPaymentConfirmModalOpen, setIsPaymentConfirmModalOpen] = useState(false);
    const [isPaymentDetailsModalOpen, setIsPaymentDetailsModalOpen] = useState(false);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [currentCheckIdForPayment, setCurrentCheckIdForPayment] = useState<string | null>(null);

    // Results & Certificate State (now part of checkHistory)
    const [isPlagiarismReportModalOpen, setIsPlagiarismReportModalOpen] = useState(false);
    const [isAiAnalysisReportModalOpen, setIsAiAnalysisReportModalOpen] = useState(false);
    const [mockAiReportData, setMockAiReportData] = useState<AIContentAnalysisReportItem[]>([]);
    const [selectedCheckResultForModal, setSelectedCheckResultForModal] = useState<PlagiarismCheckResult | null>(null);

    // Check History State
    const [checkHistory, setCheckHistory] = useState<CheckHistoryItem[]>([]);

    useEffect(() => {
        if (user) {
            const storedHistory = localStorage.getItem(`plagiarismChecks_${user.id}`);
            if (storedHistory) {
                setCheckHistory(JSON.parse(storedHistory));
            }
        }
    }, [user]);

    const saveHistory = (updatedHistory: CheckHistoryItem[]) => {
        if (user) {
            setCheckHistory(updatedHistory);
            localStorage.setItem(`plagiarismChecks_${user.id}`, JSON.stringify(updatedHistory));
        }
    };

    const updateCheckHistoryItem = (checkId: string, updates: Partial<CheckHistoryItem>) => {
        saveHistory(checkHistory.map(item => item.id === checkId ? { ...item, ...updates, lastUpdated: new Date().toISOString() } : item));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "application/msword" || file.type === "application/pdf") {
                setArticleFile(file);
                setFilePreviewName(file.name);
                setError(null);
                setSuccessMessage(null);
            } else {
                setError(translate('file_type_error_docx_pdf', 'Please upload a .doc, .docx or .pdf file.'));
                setArticleFile(null);
                setFilePreviewName(null);
            }
        }
    };

    const initiatePlagiarismCheckProcess = async () => {
        if (!user) {
            setError("User not found. Please log in.");
            return;
        }
        if (!articleFile) {
            setError(translate(LocalizationKeys.ERROR_NO_FILE_FOR_PLAGIARISM_CHECK));
            return;
        }
        
        setError(null);
        setSuccessMessage(null);

        const newCheckId = `check-${Date.now()}`;
        setCurrentCheckIdForPayment(newCheckId);

        const newHistoryItem: CheckHistoryItem = {
            id: newCheckId,
            userId: user.id,
            fileName: articleFile.name,
            initiatedDate: new Date().toISOString(),
            paymentStatus: 'payment_confirmation_pending',
            lastUpdated: new Date().toISOString(),
        };
        saveHistory([newHistoryItem, ...checkHistory]);
        setIsPaymentConfirmModalOpen(true);
    };

    const handlePaymentConfirmation = () => {
        setIsPaymentConfirmModalOpen(false);
        if (currentCheckIdForPayment) {
            updateCheckHistoryItem(currentCheckIdForPayment, { paymentStatus: 'payment_details_pending' });
        }
        setIsPaymentDetailsModalOpen(true);
    };

    const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReceiptFile(e.target.files?.[0] || null);
    };

    const handleReceiptSubmit = async () => {
        if (!receiptFile) {
            setError(translate(LocalizationKeys.RECEIPT_REQUIRED_ERROR)); // Show error inside modal or as alert
            return;
        }
        if (!currentCheckIdForPayment || !user || !articleFile) {
            setError("Critical information missing for payment submission.");
            setIsPaymentDetailsModalOpen(false);
            return;
        }

        updateCheckHistoryItem(currentCheckIdForPayment, { 
            paymentStatus: 'payment_pending_admin_approval',
            // In a real app, upload receiptFile and store URL
            receiptFileUrl: `mock_receipt_${receiptFile.name}` 
        });

        setIsPaymentDetailsModalOpen(false);
        setReceiptFile(null);
        setSuccessMessage(translate(LocalizationKeys.PAYMENT_SUBMITTED_MESSAGE));
        
        // Simulate Admin Approval & Run Actual Check
        setIsLoading(true);
        setError(null);
        
        // Simulate a delay for admin approval
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        updateCheckHistoryItem(currentCheckIdForPayment, { paymentStatus: 'payment_approved_processing' });

        try {
            const result = await geminiService.runPreliminaryPlagiarismCheckMock(`Content of file: ${articleFile.name}`);
            
            const meetsPlagiarismThreshold = result.similarityPercentage < PLAGIARISM_CERTIFICATE_THRESHOLD;
            const meetsAIContentThreshold = result.aiContentProbability === undefined || result.aiContentProbability < AI_CONTENT_CERTIFICATE_THRESHOLD;
            const certificateEligible = meetsPlagiarismThreshold && meetsAIContentThreshold;

            updateCheckHistoryItem(currentCheckIdForPayment, { 
                checkResult: result, 
                paymentStatus: 'results_ready',
                certificateEligible 
            });
            
            // Trigger notification
            const notificationEvent = new CustomEvent('addPspcNotification', { 
                detail: { 
                    messageKey: LocalizationKeys.NOTIFICATION_PLAGIARISM_RESULTS_READY, 
                    type: 'success',
                    link: '/plagiarism-check' // Optional: link back to this page
                } 
            });
            window.dispatchEvent(notificationEvent);

            if (certificateEligible) {
                setSuccessMessage(translate(LocalizationKeys.CERTIFICATE_ELIGIBLE_MESSAGE));
            } else {
                let eligibilityError = '';
                 if (!meetsPlagiarismThreshold) {
                    eligibilityError += translate(LocalizationKeys.CERTIFICATE_NOT_ELIGIBLE_MESSAGE, `The document's similarity score (${result.similarityPercentage}%) is too high.`).replace('{percentage}', result.similarityPercentage.toString());
                }
                if (!meetsAIContentThreshold && result.aiContentProbability !== undefined) {
                    if (eligibilityError) eligibilityError += ' ';
                    eligibilityError += translate(LocalizationKeys.CERTIFICATE_NOT_ELIGIBLE_AI_CONTENT, `AI content probability (${result.aiContentProbability}%) is too high.`).replace('{ai_percentage}', result.aiContentProbability.toString());
                }
                setError(eligibilityError || translate(LocalizationKeys.CERTIFICATE_NOT_ELIGIBLE_MESSAGE, 'Certificate not eligible.'));
            }
            
        } catch (e: any) {
            setError(translate(LocalizationKeys.ERROR_DURING_PLAGIARISM_CHECK) + `: ${e.message || String(e)}`);
            updateCheckHistoryItem(currentCheckIdForPayment, { paymentStatus: 'results_ready' }); // Still results ready, but with error
        } finally {
            setIsLoading(false);
            setCurrentCheckIdForPayment(null); 
            setArticleFile(null); 
            setFilePreviewName(null);
        }
    };


    const handleDownloadCertificate = (checkItem: CheckHistoryItem) => {
        if (!checkItem.checkResult || !checkItem.fileName || !user || !checkItem.certificateEligible) {
            setError(translate(LocalizationKeys.ERROR_DURING_PLAGIARISM_CHECK, 'Cannot download certificate. Data missing.'));
            return;
        }
        const { checkResult, fileName } = checkItem;
        const certificateText = `
****************************************
   SERTIFIKAT (NAMUNA)
****************************************
Hujjat nomi: "${fileName}"
Foydalanuvchi: ${user.name} ${user.surname} (${user.phone})
Tekshiruv sanasi: ${new Date(checkResult.checkedDate).toLocaleDateString()}

Plagiat o'xshashligi: ${checkResult.similarityPercentage}%
SI kontent ehtimoli: ${checkResult.aiContentProbability !== undefined ? checkResult.aiContentProbability + '%' : 'N/A'}

Holat: SERTIFIKATGA LOYIQ

Ushbu sertifikat ${translate(LocalizationKeys.APP_TITLE_FULL)} uchun namuna.
Sertifikat ID: mock-${checkItem.id}
****************************************
            `;
        const blob = new Blob([certificateText.trim()], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Sertifikat-${fileName.split('.')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setSuccessMessage(translate(LocalizationKeys.TEXT_DOWNLOAD_STARTED));
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const openPlagiarismReportModal = (result: PlagiarismCheckResult) => {
        setSelectedCheckResultForModal(result);
        setIsPlagiarismReportModalOpen(true);
    };
    const openAiAnalysisReportModal = (result: PlagiarismCheckResult) => {
        setSelectedCheckResultForModal(result);
        // Generate mock AI report data based on the selected result
        setMockAiReportData([
            { section: "Introduction", assessment: result.aiContentProbability && result.aiContentProbability > 50 ? "High probability of AI assistance" : "Likely human-written", evidence: result.aiContentProbability && result.aiContentProbability > 50 ? "Repetitive phrasing, lacks nuanced argumentation." : "Natural language flow." },
            { section: "Methodology", assessment: "Likely human-written", evidence: "Specific technical details provided." },
            { section: "Conclusion", assessment: result.aiContentProbability && result.aiContentProbability > 60 ? "Moderate AI assistance detected" : "Appears original", evidence: result.aiContentProbability && result.aiContentProbability > 60 ? "Generic concluding statements." : "" },
        ]);
        setIsAiAnalysisReportModalOpen(true);
    };
    
    const getPaymentStatusText = (status: PaymentStatus) => {
        switch (status) {
            case 'payment_confirmation_pending': return translate(LocalizationKeys.HISTORY_STATUS_PAYMENT_CONFIRMATION_PENDING, "Awaiting Payment Confirmation");
            case 'payment_details_pending': return translate(LocalizationKeys.HISTORY_STATUS_PAYMENT_DETAILS_PENDING, "Awaiting Payment Details");
            case 'payment_pending_admin_approval': return translate(LocalizationKeys.HISTORY_STATUS_PAYMENT_PENDING_ADMIN_APPROVAL, "Awaiting Admin Approval");
            case 'payment_approved_processing': return translate(LocalizationKeys.HISTORY_STATUS_PAYMENT_APPROVED_PROCESSING, "Processing Check");
            case 'results_ready': return translate(LocalizationKeys.HISTORY_STATUS_RESULTS_READY, "Results Ready");
            default: return status;
        }
    };


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-accent-sky flex items-center">
                <ShieldCheckIcon className="h-8 w-8 mr-3 text-accent-emerald" />
                {translate(LocalizationKeys.PLAGIARISM_AND_AI_CHECKER_PAGE_TITLE)}
            </h1>

            {!apiKey && !process.env.NODE_ENV?.includes('test') && <Alert type="warning" message={translate(API_KEY_ERROR_MESSAGE)} className="mb-4" />}
            {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-4" />}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} className="mb-4" />}
            
            <Card title={translate(LocalizationKeys.UPLOAD_DOCUMENT_FOR_PLAGIARISM_CHECK_LABEL)} icon={<ArrowUpOnSquareIcon className="h-6 w-6 text-sky-400" />}>
                <div className="mb-4">
                    <label htmlFor="plagiarismFile" className="block text-sm font-medium text-light-text mb-1">
                        {translate('article_file_label_docx_pdf', 'Article File (.doc, .docx, .pdf)')}
                    </label>
                    <Input
                        type="file"
                        id="plagiarismFile"
                        name="plagiarismFile"
                        accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
                        onChange={handleFileChange}
                        className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-purple file:text-white hover:file:bg-accent-purple/80 cursor-pointer"
                        wrapperClassName="mb-0"
                        aria-describedby="plagiarismThresholdNote"
                    />
                    {filePreviewName && <p className="text-xs text-slate-400 mt-1">{translate('selected_file_label', 'Selected file:')} {filePreviewName}</p>}
                </div>
                <Button onClick={initiatePlagiarismCheckProcess} isLoading={isLoading} disabled={isLoading || !articleFile} leftIcon={<DocumentCheckIcon className="h-5 w-5"/>}>
                    {translate(LocalizationKeys.RUN_PLAGIARISM_CHECK_BUTTON_GENERIC)}
                </Button>
                <p id="plagiarismThresholdNote" className="text-xs text-slate-500 mt-3">
                    {translate(LocalizationKeys.PLAGIARISM_CHECK_THRESHOLD_NOTE, `Note: A similarity score below ${PLAGIARISM_CERTIFICATE_THRESHOLD}% and AI content probability below ${AI_CONTENT_CERTIFICATE_THRESHOLD}% is generally considered acceptable for a clearance certificate in this mock system.`)}
                </p>
            </Card>

            {isLoading && <LoadingSpinner message={translate(LocalizationKeys.CHECKING_PLAGIARISM_MESSAGE)} className="mt-6" />}
            
            {/* Payment Modals */}
            <Modal isOpen={isPaymentConfirmModalOpen} onClose={() => {setIsPaymentConfirmModalOpen(false); setCurrentCheckIdForPayment(null);}} title={translate(LocalizationKeys.PAYMENT_CONFIRMATION_TITLE)}>
                <p className="text-light-text mb-6">{translate(LocalizationKeys.PAYMENT_CONFIRMATION_MESSAGE).replace('{price}', MOCK_PLAGIARISM_CHECK_PRICE)}</p>
                <div className="flex justify-end space-x-3">
                    <Button variant="secondary" onClick={() => {setIsPaymentConfirmModalOpen(false); setCurrentCheckIdForPayment(null);}}>{translate(LocalizationKeys.CANCEL_BUTTON)}</Button>
                    <Button onClick={handlePaymentConfirmation}>{translate(LocalizationKeys.PAYMENT_AGREE_BUTTON)}</Button>
                </div>
            </Modal>

            <Modal isOpen={isPaymentDetailsModalOpen} onClose={() => {setIsPaymentDetailsModalOpen(false); setCurrentCheckIdForPayment(null);}} title={translate(LocalizationKeys.PAYMENT_DETAILS_TITLE)}>
                <p className="text-light-text mb-3">{translate(LocalizationKeys.PLASTIC_CARD_NUMBER_LABEL)}: <span className="font-mono text-accent-sky">{translate(LocalizationKeys.MOCK_PLASTIC_CARD_NUMBER)}</span></p>
                <div className="mb-4">
                    <label htmlFor="receiptFile" className="block text-sm font-medium text-light-text mb-1">{translate(LocalizationKeys.UPLOAD_RECEIPT_LABEL)} (.jpg, .png, .pdf)</label>
                    <Input type="file" id="receiptFile" name="receiptFile" accept=".jpg,.jpeg,.png,.pdf" onChange={handleReceiptFileChange} wrapperClassName="mb-0" />
                </div>
                {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-3"/>}
                <div className="flex justify-end space-x-3">
                    <Button variant="secondary" onClick={() => {setIsPaymentDetailsModalOpen(false); setCurrentCheckIdForPayment(null);}}>{translate(LocalizationKeys.CANCEL_BUTTON)}</Button>
                    <Button onClick={handleReceiptSubmit} disabled={!receiptFile}>{translate(LocalizationKeys.SEND_BUTTON)}</Button>
                </div>
            </Modal>

            {/* Check History Section */}
            <Card title={translate(LocalizationKeys.CHECK_HISTORY_TITLE)} icon={<ClockIcon className="h-6 w-6 text-slate-400" />}>
                {checkHistory.length === 0 && !isLoading ? (
                    <p className="text-medium-text">{translate(LocalizationKeys.HISTORY_NO_CHECKS_YET)}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-800">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-300 uppercase">{translate(LocalizationKeys.HISTORY_DATE_COLUMN)}</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-300 uppercase">{translate(LocalizationKeys.HISTORY_FILENAME_COLUMN)}</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-300 uppercase">{translate(LocalizationKeys.HISTORY_STATUS_COLUMN)}</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-300 uppercase">{translate(LocalizationKeys.HISTORY_SIMILARITY_COLUMN)}</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-300 uppercase">{translate(LocalizationKeys.HISTORY_AI_CONTENT_COLUMN)}</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-300 uppercase">{translate('actions_label')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-secondary-dark divide-y divide-slate-700">
                                {checkHistory.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-medium-text">{new Date(item.initiatedDate).toLocaleDateString()}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-light-text">{item.fileName}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-medium-text">{getPaymentStatusText(item.paymentStatus)}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-medium-text">{item.checkResult ? `${item.checkResult.similarityPercentage}%` : '-'}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-medium-text">{item.checkResult && item.checkResult.aiContentProbability !== undefined ? `${item.checkResult.aiContentProbability}%` : '-'}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                                            {item.paymentStatus === 'results_ready' && item.checkResult && (
                                                <div className="flex space-x-1">
                                                    <Button variant="ghost" size="sm" onClick={() => openPlagiarismReportModal(item.checkResult!)} title={translate(LocalizationKeys.VIEW_PLAGIARISM_REPORT)}>
                                                        <InformationCircleIcon className="h-4 w-4"/>
                                                    </Button>
                                                    {item.checkResult.aiContentProbability !== undefined &&
                                                      <Button variant="ghost" size="sm" onClick={() => openAiAnalysisReportModal(item.checkResult!)} title={translate(LocalizationKeys.VIEW_AI_ANALYSIS_REPORT_BUTTON)}>
                                                        <SparklesIcon className="h-4 w-4"/>
                                                      </Button>
                                                    }
                                                    {item.certificateEligible && (
                                                        <Button variant="ghost" size="sm" className="text-emerald-400" onClick={() => handleDownloadCertificate(item)} title={translate(LocalizationKeys.DOWNLOAD_PLAGIARISM_CERTIFICATE_BUTTON)}>
                                                            <CheckCircleIcon className="h-4 w-4"/>
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>


            {/* Modals for reports */}
            <Modal isOpen={isPlagiarismReportModalOpen} onClose={() => setIsPlagiarismReportModalOpen(false)} title={translate(LocalizationKeys.VIEW_PLAGIARISM_REPORT, 'Plagiarism Report Details (Mock)')} size="lg">
                <p className="text-sm text-medium-text mb-3">{translate('plagiarism_report_intro_label', 'This is a mock detailed report.')}</p>
                {selectedCheckResultForModal?.plagiarismSources && selectedCheckResultForModal.plagiarismSources.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                        {selectedCheckResultForModal.plagiarismSources.map((source, index) => (
                            <li key={index} className="p-2 bg-slate-700 rounded-md">
                                <p className="font-semibold text-light-text">Source: <span className="font-normal text-accent-sky">{source.source}</span></p>
                                <p className="text-medium-text">Similarity: {source.similarity}%</p>
                                {source.details && <p className="text-xs text-slate-400 mt-1">Details: {source.details}</p>}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-medium-text">{translate('no_plagiarism_sources_found', 'No specific plagiarism sources identified.')}</p>
                )}
                <div className="mt-6 flex justify-end">
                    <Button onClick={() => setIsPlagiarismReportModalOpen(false)}>{translate('close_button','Close')}</Button>
                </div>
            </Modal>

            <Modal isOpen={isAiAnalysisReportModalOpen} onClose={() => setIsAiAnalysisReportModalOpen(false)} title={translate(LocalizationKeys.AI_ANALYSIS_REPORT_MODAL_TITLE, 'AI Content Analysis Report (Mock)')} size="lg">
                <p className="text-sm text-medium-text mb-3">{translate(LocalizationKeys.AI_ANALYSIS_REPORT_INTRO_LABEL, 'This is a mock AI content analysis report.')}</p>
                {mockAiReportData.length > 0 ? (
                    <ul className="space-y-3 text-sm">
                        {mockAiReportData.map((item, index) => (
                            <li key={index} className="p-3 bg-slate-700 rounded-md">
                                <p className="font-semibold text-light-text">{translate(LocalizationKeys.AI_ANALYSIS_SECTION_LABEL)}: <span className="font-normal text-accent-purple">{item.section}</span></p>
                                <p className="text-medium-text">{translate(LocalizationKeys.AI_ANALYSIS_ASSESSMENT_LABEL)}: {item.assessment}</p>
                                {item.evidence && <p className="text-xs text-slate-400 mt-1">{translate(LocalizationKeys.AI_ANALYSIS_EVIDENCE_LABEL)}: {item.evidence}</p>}
                            </li>
                        ))}
                    </ul>
                ) : (
                     <p className="text-medium-text">{translate('no_ai_analysis_details', 'No specific AI analysis details available.')}</p>
                )}
                 <div className="mt-6 flex justify-end">
                    <Button onClick={() => setIsAiAnalysisReportModalOpen(false)}>{translate('close_button','Close')}</Button>
                </div>
            </Modal>

        </div>
    );
};

export default PlagiarismCheckPage;
