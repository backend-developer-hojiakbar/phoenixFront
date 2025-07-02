
import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { MagnifyingGlassIcon, EyeIcon, ArrowDownTrayIcon, AcademicCapIcon, ShareIcon } from '@heroicons/react/24/outline';
import { LocalizationKeys } from '../../constants';
import { Article } from '../../types'; 
import LoadingSpinner from '../../components/common/LoadingSpinner';
import * as api from '../../services/api';

const PublicSearchPage: React.FC = () => {
    const { translate } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<Partial<Article>[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        setIsLoading(true);
        setHasSearched(true);
        setResults([]); 
        
        api.searchPublicArticles(searchTerm)
            .then(data => {
                setResults(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Search failed:", err);
                setIsLoading(false);
            });
    };

    const handleShare = (articleTitle?: string) => {
        alert(`${translate('sharing_options_for_article', "Sharing options for:")} ${articleTitle || 'this article'} (Not Implemented)`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-dark via-slate-900 to-secondary-dark text-light-text p-4 md:p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl mt-8">
                <div className="text-center mb-10">
                    <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-sky">
                        {translate(LocalizationKeys.APP_TITLE_SHORT, 'PSPC')}
                    </span>
                    <h1 className="text-3xl font-semibold text-light-text mt-2">
                        {translate(LocalizationKeys.PUBLIC_SEARCH_PAGE_TITLE, 'Search Publications')}
                    </h1>
                </div>

                <form onSubmit={handleSearch} className="mb-8">
                    <Card gradient={false} className="shadow-none border-0 p-0">
                        <div className="flex flex-col sm:flex-row gap-3 bg-secondary-dark p-4 rounded-xl shadow-lg">
                            <Input
                                name="publicSearch"
                                placeholder={translate(LocalizationKeys.SEARCH_ARTICLES_PLACEHOLDER, 'Search by title, keywords, author, DOI...')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                wrapperClassName="flex-grow mb-0"
                                className="py-3 text-base"
                                leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />}
                                aria-label={translate(LocalizationKeys.SEARCH_ARTICLES_PLACEHOLDER)}
                            />
                            <Button type="submit" isLoading={isLoading} disabled={isLoading || !searchTerm.trim()} className="sm:w-auto text-base" size="lg">
                                {translate(LocalizationKeys.SEARCH_BUTTON, 'Search')}
                            </Button>
                        </div>
                    </Card>
                </form>

                {isLoading && (
                    <div className="flex justify-center mt-8">
                        <LoadingSpinner message={translate('searching_articles', 'Searching articles...')} size="lg"/>
                    </div>
                )}

                {!isLoading && hasSearched && results.length === 0 && (
                    <Card className="mt-8 bg-secondary-dark">
                        <p className="text-center text-medium-text py-6 text-lg">
                            {translate(LocalizationKeys.NO_SEARCH_RESULTS, 'No results found for your query.')}
                        </p>
                    </Card>
                )}

                {!isLoading && results.length > 0 && (
                    <div className="space-y-6 mt-8">
                        <h2 className="text-2xl font-semibold text-accent-sky">
                            {translate(LocalizationKeys.SEARCH_RESULTS_FOR_LABEL, 'Search Results for:')} <span className="text-light-text">"{searchTerm}"</span>
                        </h2>
                        {results.map(article => (
                            <Card key={article.id} className="hover:shadow-accent-purple/30 bg-secondary-dark border border-slate-700">
                                <h3 className="text-xl font-semibold text-accent-sky mb-1">{article.title}</h3>
                                {article.authorName && <p className="text-sm text-medium-text">By: {article.authorName}</p>}
                                {article.journalName && <p className="text-sm text-medium-text">In: {article.journalName} {article.publicationDate && `(${new Date(article.publicationDate).getFullYear()})`}</p>}
                                {article.doi && <p className="text-xs text-slate-400 mb-2">DOI: <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-accent-sky/80">{article.doi}</a></p>}
                                
                                <p className="text-sm text-light-text mt-3 line-clamp-3 mb-4">{article.abstract}</p>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-medium-text mb-4">
                                    {article.viewCount !== undefined && <span className="flex items-center"><EyeIcon className="h-4 w-4 mr-1 text-sky-400"/> {translate(LocalizationKeys.ARTICLE_VIEW_COUNT_LABEL)} {article.viewCount}</span>}
                                    {article.downloadCount !== undefined && <span className="flex items-center"><ArrowDownTrayIcon className="h-4 w-4 mr-1 text-emerald-400"/> {translate(LocalizationKeys.ARTICLE_DOWNLOAD_COUNT_LABEL)} {article.downloadCount}</span>}
                                    {article.citationCount !== undefined && <span className="flex items-center"><AcademicCapIcon className="h-4 w-4 mr-1 text-amber-400"/> {translate(LocalizationKeys.ARTICLE_CITATION_COUNT_LABEL)} {article.citationCount}</span>}
                                </div>
                                
                                <div className="flex gap-2">
                                    <Button 
                                        variant="primary" 
                                        size="sm" 
                                        onClick={() => alert(translate('view_article_button_action_placeholder', `View full article ${article.id} (not implemented)`))}
                                    >
                                        {translate(LocalizationKeys.VIEW_ARTICLE_BUTTON, 'View Article')}
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleShare(article.title)}
                                        leftIcon={<ShareIcon className="h-4 w-4"/>}
                                    >
                                        {translate(LocalizationKeys.SHARE_ARTICLE_BUTTON, 'Share')}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            <footer className="w-full text-center p-4 mt-auto">
                <p className="text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} {translate(LocalizationKeys.APP_TITLE_FULL)}. {translate('all_rights_reserved')}
                </p>
                 <button onClick={() => window.history.back()} className="text-xs text-accent-sky hover:underline mt-2">
                    {translate('go_back_button', 'Go Back')}
                </button>
            </footer>
        </div>
    );
};

export default PublicSearchPage;
