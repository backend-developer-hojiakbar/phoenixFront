import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { Journal } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { DocumentArrowUpIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import apiService, { createFormData } from '../../services/apiService';

const JournalArticleSubmissionPage: React.FC = () => {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { journalId } = useParams<{ journalId: string }>();

  const [journal, setJournal] = useState<Journal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [abstract_en, setAbstract] = useState('');
  const [keywords_en, setKeywords] = useState('');
  const [articleFile, setArticleFile] = useState<File | null>(null);

  const isPartner = useMemo(() => {
    if (!user) return false;
    const fullName = `${user.name} ${user.surname}`.toLowerCase();
    return fullName.includes('hamkor');
  }, [user]);

  useEffect(() => {
    const fetchJournal = async () => {
      if (!journalId) {
        navigate('/journals');
        return;
      }
      
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
  }, [journalId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!title || !abstract_en || !keywords_en || !articleFile || !journal) {
      setError("Iltimos, barcha maydonlarni to'ldiring va maqola faylini yuklang.");
      return;
    }

    setIsSubmitting(true);
    const dataToSubmit = {
      title, 
      abstract_en, 
      keywords_en, 
      journal: journal.id, 
      finalVersionFile: articleFile,
    };
    const formData = createFormData(dataToSubmit);

    try {
        const response = await apiService.post('/articles/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data && response.data.payment_url) {
            setSuccessMessage("Ma'lumotlar qabul qilindi. To'lov sahifasiga yo'naltirilmoqda...");
            window.location.href = response.data.payment_url;
        } else {
            setError("To'lov manzilini olishda xatolik yuz berdi.");
            setIsSubmitting(false);
        }
    } catch (err: any) {
        const errorMessage = err.response?.data ? JSON.stringify(err.response.data) : "Server bilan bog'lanishda xatolik yuz berdi.";
        setError(errorMessage);
        setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (journalId) {
      navigate(`/journals/${journalId}`);
    } else {
      navigate('/journals');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Jurnal ma'lumotlari yuklanmoqda..." />;
  }

  if (error && !journal) {
    return <Alert type="error" message={error} />;
  }

  if (!journal) {
    return <Alert type="error" message="Jurnal topilmadi" />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-accent-sky">Maqola Yuborish</h1>
        <Button variant="secondary" onClick={handleBack} leftIcon={<ArrowLeftIcon className="h-5 w-5"/>}>
          Orqaga
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      <Card>
        <div className="flex items-start p-4 bg-slate-800 rounded-lg gap-4 border border-slate-700 mb-6">
          <img 
            src={journal.image_url || 'https://via.placeholder.com/150x80'} 
            alt={journal.name} 
            className="w-32 h-20 object-cover rounded-md flex-shrink-0" 
          />
          <div>
            <h4 className="font-bold text-light-text text-xl">{journal.name}</h4>
            <p className="text-sm text-medium-text mt-1 line-clamp-2">{journal.description}</p>
            <p className="text-lg font-bold mt-2 text-accent-sky">
              {new Intl.NumberFormat('uz-UZ').format(Number(isPartner ? journal.partner_price : journal.regular_price))} UZS
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Maqola sarlavhasi" 
            name="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
          <Textarea 
            label="Annotatsiya (ingliz tilida)" 
            name="abstract_en" 
            value={abstract_en} 
            onChange={(e) => setAbstract(e.target.value)} 
            required 
            rows={5} 
          />
          <Input 
            label="Kalit so'zlar (vergul bilan ajrating)" 
            name="keywords_en" 
            value={keywords_en} 
            onChange={(e) => setKeywords(e.target.value)} 
            required 
          />
          
          <div>
            <label className="block text-sm font-medium text-light-text mb-1">Maqola fayli (.doc, .pdf)</label>
            <Input 
              type="file" 
              onChange={(e) => setArticleFile(e.target.files?.[0] || null)} 
              required 
            />
          </div>

          <Button 
            type="submit" 
            fullWidth 
            isLoading={isSubmitting} 
            disabled={isSubmitting} 
            leftIcon={<DocumentArrowUpIcon className="h-5 w-5"/>}
          >
            To'lovga o'tish
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default JournalArticleSubmissionPage;