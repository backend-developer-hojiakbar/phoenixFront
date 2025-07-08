
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button'; // Added import
import { UserRank, JournalRank, UserRole } from '../../types';
import { ChartBarIcon, UserCircleIcon, AcademicCapIcon, BookOpenIcon, StarIcon } from '@heroicons/react/24/outline';
import { LocalizationKeys } from '../../constants';

// Mock Data for Rankings
const mockTopAuthors: UserRank[] = [
    { userId: 'author1', userName: 'Dr. Evelyn Reed', score: 2500, rank: 1, avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg', role: UserRole.CLIENT, detail: "35 Publications, 1200 Citations" },
    { userId: 'author2', userName: 'Prof. Kenji Tanaka', score: 2350, rank: 2, avatarUrl: 'https://randomuser.me/api/portraits/men/2.jpg', role: UserRole.CLIENT, detail: "28 Publications, 950 Citations" },
    { userId: 'author3', userName: 'Aisha Khan', score: 2200, rank: 3, avatarUrl: 'https://randomuser.me/api/portraits/women/3.jpg', role: UserRole.CLIENT, detail: "42 Publications, 800 Citations" },
];

const mockTopEditors: UserRank[] = [
    { userId: 'editor1', userName: 'Dr. Samuel Green', score: 1800, rank: 1, avatarUrl: 'https://randomuser.me/api/portraits/men/4.jpg', role: UserRole.JOURNAL_MANAGER, detail: "Avg. Review Time: 12 days, 150 Articles Reviewed" },
    { userId: 'editor2', userName: 'Maria Garcia', score: 1750, rank: 2, avatarUrl: 'https://randomuser.me/api/portraits/women/5.jpg', role: UserRole.JOURNAL_MANAGER, detail: "Avg. Review Time: 15 days, 130 Articles Reviewed" },
];

const mockTopJournals: JournalRank[] = [
    { journalId: 'journalA', journalName: 'Quantum Innovations Quarterly', rank: 1, score: 9.5, detail: "Impact Factor: 9.5, 500 Submissions/Year", coverImageUrl: 'https://source.unsplash.com/random/400x300?quantum' },
    { journalId: 'journalB', journalName: 'AI Horizons Journal', rank: 2, score: 8.8, detail: "Impact Factor: 8.8, 750 Submissions/Year", coverImageUrl: 'https://source.unsplash.com/random/400x300?technology' },
    { journalId: 'journalC', journalName: 'Biomedical Advances Review', rank: 3, score: 8.2, detail: "Impact Factor: 8.2, 600 Submissions/Year", coverImageUrl: 'https://source.unsplash.com/random/400x300?science' },
];


const RankingsPage: React.FC = () => {
    const { translate } = useLanguage();
    const [isLoading, setIsLoading] = useState(true);
    // In a real app, these would be fetched
    const [topAuthors, setTopAuthors] = useState<UserRank[]>([]);
    const [topEditors, setTopEditors] = useState<UserRank[]>([]);
    const [topJournals, setTopJournals] = useState<JournalRank[]>([]);

    useEffect(() => {
        setIsLoading(true);
        // Simulate fetching data
        setTimeout(() => {
            setTopAuthors(mockTopAuthors);
            setTopEditors(mockTopEditors);
            setTopJournals(mockTopJournals);
            setIsLoading(false);
        }, 1000);
    }, []);

    const renderUserRankItem = (user: UserRank, index: number) => (
        <li key={user.userId} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-150 hover:bg-slate-700/50 ${index < 3 ? 'border-l-4 ' + (index === 0 ? 'border-amber-400' : index === 1 ? 'border-slate-400' : 'border-orange-600') : 'border-transparent'}`}>
            <div className="flex items-center">
                <span className={`text-xl font-bold mr-4 w-8 text-center ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-500' : 'text-medium-text'}`}>#{user.rank}</span>
                <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.userName.replace(' ', '+')}&background=random&color=fff`} alt={user.userName} className="h-10 w-10 rounded-full mr-3 object-cover"/>
                <div>
                    <p className="text-sm font-semibold text-light-text">{user.userName} {user.userSurname || ''}</p>
                    <p className="text-xs text-slate-400">{user.detail || (user.role === UserRole.CLIENT ? 'Author' : 'Editor')}</p>
                </div>
            </div>
            <div className="text-sm font-bold text-accent-sky flex items-center">
                {user.score} <StarIcon className="h-4 w-4 ml-1 text-yellow-400"/>
            </div>
        </li>
    );

    const renderJournalRankItem = (journal: JournalRank, index: number) => (
         <li key={journal.journalId} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-150 hover:bg-slate-700/50 ${index < 3 ? 'border-l-4 ' + (index === 0 ? 'border-amber-400' : index === 1 ? 'border-slate-400' : 'border-orange-600') : 'border-transparent'}`}>
            <div className="flex items-center">
                 <span className={`text-xl font-bold mr-4 w-8 text-center ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-500' : 'text-medium-text'}`}>#{journal.rank}</span>
                {journal.coverImageUrl ? (
                    <img src={journal.coverImageUrl} alt={journal.journalName} className="h-10 w-10 rounded-md mr-3 object-cover"/>
                ) : (
                    <BookOpenIcon className="h-10 w-10 text-slate-500 mr-3"/>
                )}
                <div>
                    <p className="text-sm font-semibold text-light-text">{journal.journalName}</p>
                    <p className="text-xs text-slate-400">{journal.detail}</p>
                </div>
            </div>
            {journal.score && (
                <div className="text-sm font-bold text-accent-sky flex items-center">
                    {journal.score} <StarIcon className="h-4 w-4 ml-1 text-yellow-400"/>
                </div>
            )}
        </li>
    );


    if (isLoading) {
        return <LoadingSpinner message={translate('loading_rankings', 'Loading rankings...')} className="h-screen" />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-dark via-slate-900 to-secondary-dark text-light-text p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                     <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-sky">
                        {translate(LocalizationKeys.APP_TITLE_SHORT, 'PSPC')}
                    </span>
                    <h1 className="text-4xl font-bold text-light-text mt-2 flex items-center justify-center">
                        <ChartBarIcon className="h-10 w-10 mr-3 text-accent-sky" />
                        {translate(LocalizationKeys.PUBLIC_RANKINGS_PAGE_TITLE)}
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
                    <Card title={translate(LocalizationKeys.RANKINGS_TOP_AUTHORS_TITLE)} icon={<UserCircleIcon className="h-6 w-6 text-sky-400"/>}>
                        {topAuthors.length > 0 ? (
                            <ul className="space-y-2">{topAuthors.map(renderUserRankItem)}</ul>
                        ) : (
                            <p className="text-medium-text">{translate(LocalizationKeys.NO_RANKING_DATA)}</p>
                        )}
                    </Card>

                    <Card title={translate(LocalizationKeys.RANKINGS_TOP_EDITORS_TITLE)} icon={<AcademicCapIcon className="h-6 w-6 text-purple-400"/>}>
                         {topEditors.length > 0 ? (
                            <ul className="space-y-2">{topEditors.map(renderUserRankItem)}</ul>
                        ) : (
                            <p className="text-medium-text">{translate(LocalizationKeys.NO_RANKING_DATA)}</p>
                        )}
                    </Card>

                    <Card title={translate(LocalizationKeys.RANKINGS_TOP_JOURNALS_TITLE)} icon={<BookOpenIcon className="h-6 w-6 text-emerald-400"/>}>
                        {topJournals.length > 0 ? (
                             <ul className="space-y-2">{topJournals.map(renderJournalRankItem)}</ul>
                        ) : (
                            <p className="text-medium-text">{translate(LocalizationKeys.NO_RANKING_DATA)}</p>
                        )}
                    </Card>
                </div>
                 <div className="text-center mt-12">
                    <Button onClick={() => window.history.back()} variant="secondary">
                        {translate('go_back_button', 'Go Back')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RankingsPage;