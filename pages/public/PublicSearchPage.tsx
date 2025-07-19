import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';
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
                   art.abstract_en?.toLowerCase().includes(lowercasedTerm) ||
                   art.journalName?.toLowerCase().includes(lowercasedTerm) ||
                   art.author.name?.toLowerCase().includes(lowercasedTerm) ||
                   art.author.surname?.toLowerCase().includes(lowercasedTerm)
        );
        setResults(filtered);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-dark via-slate-900 to-secondary-dark text-light-text p-4 md:p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl mt-8">
                <div className="text-center mb-10">
                    <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-sky">
                        {translate(LocalizationKeys.APP_TITLE_SHORT)}
                    </span>
                    <h1 className="text-3xl font-semibold text-light-text mt-2">
                        {translate(LocalizationKeys.PUBLIC_SEARCH_PAGE_TITLE)}
                    </h1>
                </div>

                <form onSubmit={handleSearch} className="mb-8">
                    <Card gradient={false} className="shadow-none border-0 p-0">
                        <div className="flex flex-col sm:flex-row gap-3 bg-secondary-dark p-4 rounded-xl shadow-lg">
                            <Input
                                name="publicSearch"
                                placeholder={translate(LocalizationKeys.SEARCH_ARTICLES_PLACEHOLDER)}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                wrapperClassName="flex-grow mb-0"
                                className="py-3 text-base"
                                leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />}
                            />
                            <Button type="submit" isLoading={isLoading} disabled={isLoading || !searchTerm.trim()} className="sm:w-auto text-base" size="lg">
                                {translate(LocalizationKeys.SEARCH_BUTTON)}
                            </Button>
                        </div>
                         <p className='text-xs text-slate-500 text-center mt-2'>Izoh: Bu qidiruv tizimga kirgan foydalanuvchilar uchun ishlaydi.</p>
                    </Card>
                </form>

                {isLoading && (
                    <div className="flex justify-center mt-8">
                        <LoadingSpinner message={translate('searching_articles')} size="lg"/>
                    </div>
                )}

                {!isLoading && hasSearched && results.length === 0 && (
                    <Card className="mt-8 bg-secondary-dark">
                        <p className="text-center text-medium-text py-6 text-lg">
                            {translate(LocalizationKeys.NO_SEARCH_RESULTS)}
                        </p>
                    </Card>
                )}

                {!isLoading && results.length > 0 && (
                    <div className="space-y-6 mt-8">
                        <h2 className="text-2xl font-semibold text-accent-sky">
                            {translate(LocalizationKeys.SEARCH_RESULTS_FOR_LABEL)} <span className="text-light-text">"{searchTerm}"</span>
                        </h2>
                        {results.map(article => (
                            <Card key={article.id} className="hover:shadow-accent-purple/30 bg-secondary-dark border border-slate-700">
                                <h3 className="text-xl font-semibold text-accent-sky mb-1">{article.title}</h3>
                                <p className="text-sm text-medium-text">Muallif: {article.author.name} {article.author.surname}</p>
                                <p className="text-sm text-medium-text">Jurnal: {article.journalName}</p>
                                <p className="text-sm text-light-text mt-3 line-clamp-3 mb-4">{article.abstract_en}</p>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicSearchPage;