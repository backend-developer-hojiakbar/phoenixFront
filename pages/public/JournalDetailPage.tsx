import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { Journal } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BookOpenIcon, DocumentPlusIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/apiService';

const JournalDetailPage: React.FC = () => {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { journalId } = useParams<{ journalId: string }>();

  const [journal, setJournal] = useState<Journal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJournal = async () => {
      if (!journalId) return;
      
      setIsLoading(true);
      try {
        const { data } = await apiService.get<Journal>(`/journals/${journalId}/`);
        setJournal(data);
      } catch (err) {
        setError("Jurnal ma'lumotlarini yuklashda xatolik yuz berdi.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchJournal();
  }, [journalId]);

  const handleArticleSubmission = () => {
    if (journal) {
      navigate(`/journals/${journal.id}/submit-article`);
    }
  };

  const handleEditorialApplication = () => {
    if (journal) {
      navigate(`/journals/${journal.id}/apply-for-editorship`);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Jurnal ma'lumotlari yuklanmoqda..." />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!journal) {
    return <div>Jurnal topilmadi</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-accent-sky flex items-center">
          <BookOpenIcon className="h-8 w-8 mr-3 text-accent-purple" />
          {journal.name}
        </h1>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <img 
              src={journal.image_url || 'https://via.placeholder.com/400x200?text=Jurnal+Rasmi'} 
              alt={journal.name} 
              className="w-full h-64 object-cover rounded-lg" 
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-light-text mb-4">Jurnal haqida</h3>
            <p className="text-medium-text mb-4">{journal.description}</p>
            
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold text-light-text">Turi:</span> {journal.journal_type.name}
              </p>
              {journal.category && (
                <p className="text-sm">
                  <span className="font-semibold text-light-text">Kategoriya:</span> {journal.category.name}
                </p>
              )}
              {journal.manager && (
                <p className="text-sm">
                  <span className="font-semibold text-light-text">Menejer:</span> {journal.manager.name} {journal.manager.surname}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Maqola yuborish" icon={<DocumentPlusIcon className="h-6 w-6 text-accent-sky" />}>
          <p className="text-medium-text mb-4">
            Ushbu jurnalga ilmiy maqolalaringizni yuboring. Maqolani ko'rib chiqish jarayonidan o'tkaziladi.
          </p>
          <Button 
            onClick={handleArticleSubmission} 
            fullWidth 
            leftIcon={<DocumentPlusIcon className="h-5 w-5" />}
          >
            Maqola yuborish
          </Button>
        </Card>

        <Card title="Tahririyatga a'zo bo'lish" icon={<UserGroupIcon className="h-6 w-6 text-accent-purple" />}>
          <p className="text-medium-text mb-4">
            Ushbu jurnal tahririyatiga a'zo bo'lishni xohlasangiz, ariza topshiring.
          </p>
          <Button 
            onClick={handleEditorialApplication} 
            fullWidth 
            variant="secondary"
            leftIcon={<UserGroupIcon className="h-5 w-5" />}
          >
            Ariza topshirish
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default JournalDetailPage;