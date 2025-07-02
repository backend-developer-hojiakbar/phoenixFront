import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Journal, User, Language } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Input from '../../components/common/Input';
import { MagnifyingGlassIcon, QueueListIcon } from '@heroicons/react/24/outline';
import { LocalizationKeys } from '../../constants';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const JournalManagementPage: React.FC = () => {
  const { translate, language } = useLanguage();
  const navigate = useNavigate();

  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState<{type:'success'|'error', text:string}|null>(null);

  const fetchJournals = () => {
      setIsLoading(true);
      // Backend avtomatik ravishda faqat shu muharrirga tegishli jurnallarni qaytaradi
      api.get('/journals/')
          .then(journalsData => {
              setJournals(journalsData);
          })
          .catch(err => {
              setActionMessage({type: 'error', text: err.message || 'Failed to load journals.'});
          })
          .finally(() => {
              setIsLoading(false);
          });
  }

  useEffect(() => {
    fetchJournals();
  }, []);
  
  const filteredJournals = useMemo(() => {
    return journals.filter(journal =>
      (journal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (journal.description && journal.description.toLowerCase().includes(searchTerm.toLowerCase()))) 
    );
  }, [journals, searchTerm]);
  
  const getEditorName = (editor?: User) => {
    return editor ? `${editor.name} ${editor.surname}` : translate('unassigned');
  };

  const getJournalDisplayName = (journal: Journal) => {
    if (language === Language.UZ && journal.name_uz) return journal.name_uz;
    if (language === Language.RU && journal.name_ru) return journal.name_ru;
    return journal.name;
  };
  
  if (isLoading && journals.length === 0) {
    return <LoadingSpinner message={translate('loading_journals')} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-accent-sky">{translate(LocalizationKeys.MENING_JURNALIM)}</h1>
      </div>
      
      {actionMessage && <Alert type={actionMessage.type} message={actionMessage.text} onClose={() => setActionMessage(null)} className="my-4"/>}

      <Card>
           <Input 
                label={translate('search_journals_label')}
                placeholder={translate('type_to_search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400"/>}
                wrapperClassName="mb-0"
            />
       </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? <LoadingSpinner /> : filteredJournals.length === 0 ? (
            <p className="text-center text-medium-text py-8 col-span-full">{translate('no_journals_found_criteria')}</p>
        ) : (
            filteredJournals.map(journal => (
            <Card key={journal.id} title={getJournalDisplayName(journal)} gradient className="flex flex-col justify-between">
                <div>
                    <p className="text-sm text-medium-text mb-2 line-clamp-3">{journal.description}</p>
                    <p className="text-xs text-slate-400 mb-1">{translate('manager_label')} {getEditorName(journal.manager)}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700 flex flex-wrap gap-2">
                    <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => navigate(`/journal-issue-management/${journal.id}`)} 
                        title={translate(LocalizationKeys.MANAGE_JOURNAL_ISSUES_BUTTON)} 
                        leftIcon={<QueueListIcon className="h-4 w-4"/>}
                    >
                        {translate(LocalizationKeys.MANAGE_JOURNAL_ISSUES_BUTTON)}
                    </Button>
                </div>
            </Card>
            ))
        )}
      </div>
    </div>
  );
};

export default JournalManagementPage;