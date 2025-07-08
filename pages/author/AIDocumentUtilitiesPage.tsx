
import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { DocumentTextIcon, LanguageIcon, ArrowUpOnSquareIcon, ClipboardDocumentIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { LocalizationKeys, API_KEY_ERROR_MESSAGE } from '../../constants';
import * as geminiService from '../../services/geminiService';

const AIDocumentUtilitiesPage: React.FC = () => {
    const { translate } = useLanguage();
    const { user } = useAuth();
    const apiKey = process.env.API_KEY;

    // State for Literacy Check
    const [literacyFile, setLiteracyFile] = useState<File | null>(null);
    const [literacyResult, setLiteracyResult] = useState<{ report: string; suggestions: string[] } | null>(null);
    const [isLoadingLiteracy, setIsLoadingLiteracy] = useState(false);
    const [errorLiteracy, setErrorLiteracy] = useState<string | null>(null);

    // State for Transliteration
    const [transliterationFile, setTransliterationFile] = useState<File | null>(null);
    const [transliterationResult, setTransliterationResult] = useState<string | null>(null);
    const [transliterationDirection, setTransliterationDirection] = useState<'cyrToLat' | 'latToCyr'>('cyrToLat');
    const [isLoadingTransliteration, setIsLoadingTransliteration] = useState(false);
    const [errorTransliteration, setErrorTransliteration] = useState<string | null>(null);
    const [copySuccessMessage, setCopySuccessMessage] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'literacy' | 'transliteration') => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type === "application/pdf") {
                if (type === 'literacy') {
                    setLiteracyFile(file);
                    setErrorLiteracy(null);
                    setLiteracyResult(null);
                } else {
                    setTransliterationFile(file);
                    setErrorTransliteration(null);
                    setTransliterationResult(null);
                }
            } else {
                const errMsg = translate('file_type_error_pdf_only', 'Please upload a PDF file only.');
                if (type === 'literacy') {
                    setErrorLiteracy(errMsg);
                    setLiteracyFile(null);
                } else {
                    setErrorTransliteration(errMsg);
                    setTransliterationFile(null);
                }
            }
        }
    };

    const handleAnalyzeLiteracy = async () => {
        if (!apiKey) {
            setErrorLiteracy(translate(LocalizationKeys.API_KEY_REQUIRED_FOR_AI_FEATURE));
            return;
        }
        if (!literacyFile) {
            setErrorLiteracy(translate(LocalizationKeys.ERROR_NO_FILE_SELECTED));
            return;
        }
        setIsLoadingLiteracy(true);
        setErrorLiteracy(null);
        setLiteracyResult(null);

        // Simulate PDF text extraction
        const simulatedPdfTextContent = `Content from PDF: ${literacyFile.name}. This text simulates the extracted content for literacy analysis. It includes various sentences to check grammar, style, and clarity. For instance, is this sentence clear? Are there any spelling mistaks? What about the overall tone, does it sound academic enough? The AI should provide suggestions based on this simulated input.`;

        try {
            const result = await geminiService.analyzeDocumentLiteracy(simulatedPdfTextContent);
            if (result.error) {
                setErrorLiteracy(result.error);
            } else {
                setLiteracyResult({ report: result.report, suggestions: result.suggestions });
            }
        } catch (e: any) {
            setErrorLiteracy(translate(LocalizationKeys.ERROR_PROCESSING_PDF) + ` ${e.message || String(e)}`);
        } finally {
            setIsLoadingLiteracy(false);
        }
    };

    const handleTransliterate = async () => {
        if (!apiKey) {
            setErrorTransliteration(translate(LocalizationKeys.API_KEY_REQUIRED_FOR_AI_FEATURE));
            return;
        }
        if (!transliterationFile) {
            setErrorTransliteration(translate(LocalizationKeys.ERROR_NO_FILE_SELECTED));
            return;
        }
        setIsLoadingTransliteration(true);
        setErrorTransliteration(null);
        setTransliterationResult(null);
        setCopySuccessMessage(null);

        // Simulate PDF text extraction
        const simulatedPdfTextContent = transliterationDirection === 'cyrToLat'
            ? `Кириллча матн: ${transliterationFile.name}. Бу матн PDF файлидан олинган мазмунни симуляция қилади. Ушбу симуляция қилинган кириллча матн лотинчага ўгирилиши керак.`
            : `Lotincha matn: ${transliterationFile.name}. Bu matn PDF faylidan olingan mazmunni simulyatsiya qiladi. Ushbu simulyatsiya qilingan lotincha matn kirillchaga o'girilishi kerak.`;
        
        const target = transliterationDirection === 'cyrToLat' ? 'latin' : 'cyrillic';

        try {
            const result = await geminiService.transliterateText(simulatedPdfTextContent, target);
            if (result.error) {
                setErrorTransliteration(result.error);
            } else {
                setTransliterationResult(result.transliteratedText);
            }
        } catch (e: any) {
            setErrorTransliteration(translate(LocalizationKeys.ERROR_PROCESSING_PDF) + ` ${e.message || String(e)}`);
        } finally {
            setIsLoadingTransliteration(false);
        }
    };

    const copyToClipboard = (text: string | null) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccessMessage(translate(LocalizationKeys.TEXT_COPIED_SUCCESS));
            setTimeout(() => setCopySuccessMessage(null), 2000);
        }).catch(err => {
            console.error("Failed to copy text: ", err);
        });
    };

    const downloadTextFile = (text: string | null, filenamePrefix: string) => {
        if (!text) return;
        const element = document.createElement("a");
        const file = new Blob([text], {type: 'text/plain;charset=utf-8'});
        element.href = URL.createObjectURL(file);
        element.download = `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(element); // Required for FireFox
        element.click();
        document.body.removeChild(element);
        setCopySuccessMessage(translate(LocalizationKeys.TEXT_DOWNLOAD_STARTED));
         setTimeout(() => setCopySuccessMessage(null), 2000);
    };


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-accent-sky flex items-center">
                <DocumentTextIcon className="h-8 w-8 mr-3 text-accent-purple" />
                {translate(LocalizationKeys.AI_DOCUMENT_UTILITIES_PAGE_TITLE)}
            </h1>

            {!apiKey && (
                 <Alert type="error" message={API_KEY_ERROR_MESSAGE} className="mb-4" />
            )}

            {/* Literacy Check Section */}
            <Card title={translate(LocalizationKeys.LITERACY_CHECK_SECTION_TITLE)} icon={<DocumentTextIcon className="h-6 w-6 text-sky-400" />}>
                <p className="text-sm text-medium-text mb-4">{translate(LocalizationKeys.PDF_ANALYSIS_DESCRIPTION)}</p>
                <div className="mb-4">
                    <label htmlFor="literacyFile" className="block text-sm font-medium text-light-text mb-1">
                        {translate(LocalizationKeys.UPLOAD_PDF_FOR_ANALYSIS_LABEL)} (.pdf)
                    </label>
                    <Input
                        type="file"
                        id="literacyFile"
                        name="literacyFile"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(e, 'literacy')}
                        className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-purple file:text-white hover:file:bg-accent-purple/80 cursor-pointer"
                        wrapperClassName="mb-0"
                    />
                    {literacyFile && <p className="text-xs text-slate-400 mt-1">Tanlangan fayl: {literacyFile.name}</p>}
                </div>
                <Button onClick={handleAnalyzeLiteracy} isLoading={isLoadingLiteracy} disabled={!apiKey || isLoadingLiteracy || !literacyFile} leftIcon={<ArrowUpOnSquareIcon className="h-5 w-5"/>}>
                    {translate(LocalizationKeys.ANALYZE_DOCUMENT_BUTTON)}
                </Button>

                {isLoadingLiteracy && <LoadingSpinner message={translate(LocalizationKeys.PROCESSING_LITERACY_CHECK)} className="mt-4" />}
                {errorLiteracy && <Alert type="error" message={errorLiteracy} onClose={() => setErrorLiteracy(null)} className="mt-4" />}
                
                {literacyResult && (
                    <div className="mt-6 space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-accent-emerald">{translate(LocalizationKeys.LITERACY_REPORT_TITLE)}</h3>
                            <p className="text-sm text-light-text bg-slate-700/50 p-3 rounded-md whitespace-pre-line">{literacyResult.report}</p>
                        </div>
                        {literacyResult.suggestions.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-accent-emerald">{translate(LocalizationKeys.LITERACY_SUGGESTIONS_TITLE)}</h3>
                                <ul className="list-disc list-inside space-y-2 text-sm text-light-text bg-slate-700/50 p-3 rounded-md">
                                    {literacyResult.suggestions.map((suggestion, index) => (
                                        <li key={index} className="leading-relaxed">{suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                         <p className="text-xs text-slate-500 mt-2">{translate(LocalizationKeys.PDF_TEXT_EXTRACTION_SIMULATION_NOTE)}</p>
                    </div>
                )}
            </Card>

            {/* Transliteration Section */}
            <Card title={translate(LocalizationKeys.TRANSLITERATION_SECTION_TITLE)} icon={<LanguageIcon className="h-6 w-6 text-purple-400" />}>
                <p className="text-sm text-medium-text mb-4">{translate(LocalizationKeys.TRANSLITERATION_DESCRIPTION)}</p>
                <div className="mb-4">
                    <label htmlFor="transliterationFile" className="block text-sm font-medium text-light-text mb-1">
                        {translate(LocalizationKeys.UPLOAD_PDF_FOR_TRANSLITERATION_LABEL)} (.pdf)
                    </label>
                    <Input
                        type="file"
                        id="transliterationFile"
                        name="transliterationFile"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(e, 'transliteration')}
                        className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-purple file:text-white hover:file:bg-accent-purple/80 cursor-pointer"
                        wrapperClassName="mb-0"
                    />
                    {transliterationFile && <p className="text-xs text-slate-400 mt-1">Tanlangan fayl: {transliterationFile.name}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="transliterationDirection" className="block text-sm font-medium text-light-text mb-1">
                        {translate(LocalizationKeys.SELECT_TRANSLITERATION_DIRECTION_LABEL)}
                    </label>
                    <select
                        id="transliterationDirection"
                        name="transliterationDirection"
                        value={transliterationDirection}
                        onChange={(e) => setTransliterationDirection(e.target.value as 'cyrToLat' | 'latToCyr')}
                        className="w-full md:w-1/2 px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-light-text focus:ring-2 focus:ring-accent-sky focus:border-accent-sky focus:outline-none"
                    >
                        <option value="cyrToLat">{translate(LocalizationKeys.CYRILLIC_TO_LATIN)}</option>
                        <option value="latToCyr">{translate(LocalizationKeys.LATIN_TO_CYRILLIC)}</option>
                    </select>
                </div>
                <Button onClick={handleTransliterate} isLoading={isLoadingTransliteration} disabled={!apiKey || isLoadingTransliteration || !transliterationFile} leftIcon={<ArrowUpOnSquareIcon className="h-5 w-5"/>}>
                    {translate(LocalizationKeys.TRANSLITERATE_DOCUMENT_BUTTON)}
                </Button>

                {isLoadingTransliteration && <LoadingSpinner message={translate(LocalizationKeys.PROCESSING_TRANSLITERATION)} className="mt-4" />}
                {errorTransliteration && <Alert type="error" message={errorTransliteration} onClose={() => setErrorTransliteration(null)} className="mt-4" />}
                
                {transliterationResult && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-accent-emerald mb-2">{translate(LocalizationKeys.TRANSLITERATED_TEXT_TITLE)}</h3>
                        <Textarea
                            value={transliterationResult}
                            readOnly
                            rows={10}
                            className="bg-slate-700/50 border-slate-600 focus:ring-accent-emerald focus:border-accent-emerald"
                            aria-label={translate(LocalizationKeys.TRANSLITERATED_TEXT_TITLE)}
                        />
                        <div className="flex space-x-2 mt-2">
                            <Button onClick={() => copyToClipboard(transliterationResult)} variant="secondary" size="sm" leftIcon={<ClipboardDocumentIcon className="h-4 w-4"/>}>
                                {translate(LocalizationKeys.COPY_TEXT_BUTTON)}
                            </Button>
                            <Button onClick={() => downloadTextFile(transliterationResult, transliterationDirection === 'cyrToLat' ? 'transliterated_to_latin' : 'transliterated_to_cyrillic')} variant="secondary" size="sm" leftIcon={<ArrowDownTrayIcon className="h-4 w-4"/>}>
                                {translate(LocalizationKeys.DOWNLOAD_TEXT_BUTTON)}
                            </Button>
                        </div>
                        {copySuccessMessage && <Alert type="success" message={copySuccessMessage} onClose={() => setCopySuccessMessage(null)} className="mt-3 text-xs p-2"/>}
                         <p className="text-xs text-slate-500 mt-2">{translate(LocalizationKeys.PDF_TEXT_EXTRACTION_SIMULATION_NOTE)}</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AIDocumentUtilitiesPage;
