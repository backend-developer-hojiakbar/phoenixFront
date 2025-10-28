import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { MagnifyingGlassIcon, EyeIcon, BookOpenIcon, UserGroupIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { LocalizationKeys } from '../../constants';
import { Article } from '../../types'; 
import LoadingSpinner from '../../components/common/LoadingSpinner';
import apiService from '../../services/apiService';

const PublicSearchPage: React.FC = () => {
    const { translate } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [allArticles, setAllArticles] = useState<Article[]>([]);
    const [results, setResults] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        setIsLoading(true);
        setHasSearched(true);
        setResults([]); 

        try {
            // If we haven't fetched articles yet, fetch them.
            if (allArticles.length === 0) {
                const response = await apiService.get<Article[]>('/articles/'); 
                setAllArticles(response.data);
                filterArticles(searchTerm, response.data);
            } else {
                filterArticles(searchTerm, allArticles);
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const filterArticles = (term: string, articles: Article[]) => {
        const lowercasedTerm = term.toLowerCase();
        const filtered = articles.filter(
            art => art.title?.toLowerCase().includes(lowercasedTerm) || 
                   (art as any).abstract_en?.toLowerCase().includes(lowercasedTerm) ||
                   art.journalName?.toLowerCase().includes(lowercasedTerm) ||
                   art.author.name?.toLowerCase().includes(lowercasedTerm) ||
                   art.author.surname?.toLowerCase().includes(lowercasedTerm)
        );
        setResults(filtered);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-dark via-slate-900 to-secondary-dark text-light-text p-4 md:p-8">
            <div className="w-full max-w-6xl mx-auto mt-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-accent-purple to-accent-sky mb-6">
                        <MagnifyingGlassIcon className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-sky mb-4">
                        {translate(LocalizationKeys.PUBLIC_SEARCH_PAGE_TITLE)}
                    </h1>
                    <p className="text-lg text-medium-text max-w-2xl mx-auto">
                        Ilmiy maqolalar, jurnallar va mualliflarni qidiring. Bizning kengaytirilgan qidiruv tizimimiz 
                        yordamida kerakli ma'lumotlarni tezda toping.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto mb-12">
                    <form onSubmit={handleSearch}>
                        <Card title={undefined} icon={undefined} className="shadow-none border-0 p-0 bg-secondary-dark/50 backdrop-blur-sm">
                            <div className="flex flex-col sm:flex-row gap-3 p-1 rounded-xl">
                                <div className="flex-grow relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        name="publicSearch"
                                        placeholder={translate(LocalizationKeys.SEARCH_ARTICLES_PLACEHOLDER)}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-primary-dark border border-slate-700 rounded-lg py-4 pl-12 pr-4 text-light-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-transparent"
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    isLoading={isLoading} 
                                    disabled={isLoading || !searchTerm.trim()} 
                                    className="sm:w-auto px-6 py-4 text-base font-medium"
                                    size="lg"
                                >
                                    {translate(LocalizationKeys.SEARCH_BUTTON)}
                                </Button>
                            </div>
                            <p className='text-xs text-slate-500 text-center mt-3'>Izoh: Bu qidiruv tizimga kirgan foydalanuvchilar uchun ishlaydi.</p>
                        </Card>
                    </form>
                </div>

                {/* Search Stats */}
                {hasSearched && !isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700 shadow-lg">
                            <div className="flex items-center">
                                <div className="p-3 rounded-lg bg-purple-500/10 mr-4">
                                    <DocumentTextIcon className="h-6 w-6 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-medium-text">Jami maqolalar</p>
                                    <p className="text-2xl font-bold text-light-text">{allArticles.length}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700 shadow-lg">
                            <div className="flex items-center">
                                <div className="p-3 rounded-lg bg-sky-500/10 mr-4">
                                    <BookOpenIcon className="h-6 w-6 text-sky-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-medium-text">Topilgan natijalar</p>
                                    <p className="text-2xl font-bold text-light-text">{results.length}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700 shadow-lg">
                            <div className="flex items-center">
                                <div className="p-3 rounded-lg bg-emerald-500/10 mr-4">
                                    <UserGroupIcon className="h-6 w-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-medium-text">Noyob mualliflar</p>
                                    <p className="text-2xl font-bold text-light-text">
                                        {results.length > 0 
                                            ? [...new Set(results.map(r => `${r.author.name} ${r.author.surname}`))].length 
                                            : 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="flex justify-center mt-12">
                        <LoadingSpinner message={translate('searching_articles')} />
                    </div>
                )}

                {!isLoading && hasSearched && results.length === 0 && (
                    <Card title={undefined} icon={undefined} className="mt-8 bg-secondary-dark/50 backdrop-blur-sm border border-slate-700">
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                                <MagnifyingGlassIcon className="h-8 w-8 text-slate-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-light-text mb-2">
                                {translate(LocalizationKeys.NO_SEARCH_RESULTS)}
                            </h3>
                            <p className="text-medium-text max-w-md mx-auto">
                                "{searchTerm}" bo'yicha hech qanday natija topilmadi. Iltimos, boshqa kalit so'zlar bilan qayta urinib ko'ring.
                            </p>
                        </div>
                    </Card>
                )}

                {!isLoading && results.length > 0 && (
                    <div className="space-y-6 mt-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h2 className="text-2xl font-bold text-accent-sky">
                                {translate(LocalizationKeys.SEARCH_RESULTS_FOR_LABEL)} <span className="text-light-text">"{searchTerm}"</span>
                            </h2>
                            <p className="text-medium-text">
                                {results.length} ta natija topildi
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6">
                            {results.map(article => (
                                <Card 
                                    key={article.id} 
                                    title={undefined} 
                                    icon={undefined}
                                    className="hover:shadow-accent-purple/30 bg-secondary-dark/50 backdrop-blur-sm border border-slate-700 transition-all duration-300 hover:border-accent-purple"
                                >
                                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                                        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-accent-purple/20 to-accent-sky/20 flex items-center justify-center">
                                            <DocumentTextIcon className="h-8 w-8 text-accent-purple" />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="text-xl font-bold text-accent-sky mb-2 hover:text-accent-sky/90 transition-colors">
                                                {article.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-medium-text mb-3">
                                                <span className="flex items-center">
                                                    <UserGroupIcon className="h-4 w-4 mr-1.5" />
                                                    {article.author.name} {article.author.surname}
                                                </span>
                                                <span className="flex items-center">
                                                    <BookOpenIcon className="h-4 w-4 mr-1.5" />
                                                    {article.journalName}
                                                </span>
                                                <span>
                                                    Status: <span className="font-medium text-light-text">
                                                        {article.status === 'published' ? 'Nashr etilgan' : 'Ko\'rib chiqilmoqda'}
                                                    </span>
                                                </span>
                                            </div>
                                            <p className="text-medium-text line-clamp-3 mb-4">
                                                {(article as any).abstract_en}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="modern-badge modern-badge-primary">
                                                    {article.journalName}
                                                </span>
                                                <span className="modern-badge modern-badge-secondary">
                                                    {new Date(article.submittedDate).getFullYear()}
                                                </span>
                                                {(article as any).plagiarism_percentage && (
                                                    <span className={`modern-badge ${
                                                        (article as any).plagiarism_percentage < 20 ? 'modern-badge-success' : 
                                                        (article as any).plagiarism_percentage < 50 ? 'modern-badge-warning' : 'modern-badge-danger'
                                                    }`}>
                                                        Plagiat: {(article as any).plagiarism_percentage.toFixed(2)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicSearchPage;