import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { Journal } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Input from '../../components/common/Input';
import { BookOpenIcon, MagnifyingGlassIcon, DocumentPlusIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/apiService';
import { useNavigate } from 'react-router-dom';

const JournalsPage: React.FC = () => {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJournals = async () => {
      setIsLoading(true);
      try {
        const { data } = await apiService.get<Journal[]>('/journals/');
        setJournals(data);
      } catch (err) {
        setError("Jurnallarni yuklashda xatolik yuz berdi.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchJournals();
  }, []);

  const filteredJournals = useMemo(() => {
    return journals.filter((journal: Journal) =>
      journal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journal.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [journals, searchTerm]);

  const handleJournalClick = (journalId: number) => {
    navigate(`/journals/${journalId}`);
  };

  if (isLoading) {
    return <LoadingSpinner message="Jurnallar yuklanmoqda..." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-accent-sky flex items-center">
          <BookOpenIcon className="h-8 w-8 mr-3 text-accent-purple" />
          Jurnallar
        </h1>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      <Card title={null} icon={null}>
        <Input 
          placeholder="Jurnallarni qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400"/>}
          wrapperClassName="mb-0"
        />
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJournals.length > 0 ? filteredJournals.map((journal: Journal) => (
          <div 
            key={journal.id} 
            onClick={() => handleJournalClick(journal.id)}
            className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden cursor-pointer transition-all duration-300 hover:border-accent-purple hover:shadow-lg hover:shadow-accent-purple/10 transform hover:-translate-y-1 flex flex-col"
          >
            <img 
              src={journal.image_url || 'https://via.placeholder.com/400x200?text=Jurnal+Rasmi'} 
              alt={journal.name} 
              className="w-full h-40 object-cover" 
            />
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="bg-sky-500/20 text-sky-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {journal.journal_type.name}
                </span>
                {journal.category && (
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {journal.category.name}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-light-text text-lg flex-grow">{journal.name}</h4>
              <p className="text-sm text-medium-text mt-2 line-clamp-2">{journal.description}</p>
              
              <div className="mt-auto pt-3 border-t border-slate-700">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-slate-400">
                    {journal.manager ? (
                      <span>Muallif: {journal.manager.name} {journal.manager.surname}</span>
                    ) : (
                      <span>Muallif: Tayinlanmagan</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <p className="text-medium-text col-span-full text-center py-10">
            {searchTerm ? 'Qidiruvga mos keladigan jurnallar topilmadi.' : 'Hozirda jurnallar mavjud emas.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default JournalsPage;