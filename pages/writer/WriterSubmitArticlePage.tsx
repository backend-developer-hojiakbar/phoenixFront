import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import { DocumentArrowUpIcon, BookOpenIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import apiService, { createFormData } from '../../services/apiService';

const WriterSubmitArticlePage: React.FC = () => {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState('');
  const [udk, setUdk] = useState('');
  const [articleFile, setArticleFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!title || !abstract || !keywords || !articleFile) {
      setError("Iltimos, barcha maydonlarni to'ldiring va faylni yuklang.");
      return;
    }

    setIsLoading(true);
    
    try {
      const dataToSubmit = {
        title, 
        abstract_en: abstract, 
        keywords_en: keywords, 
        udk: udk,
        finalVersionFile: articleFile,
      };
      const formData = createFormData(dataToSubmit);

      const response = await apiService.post('/writer-articles/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data && response.data.payment_url) {
        setSuccessMessage("Maqola muvaffaqiyatli yuborildi! To'lov sahifasiga yo'naltirilmoqda...");
        window.location.href = response.data.payment_url;
      } else {
        setError("To'lov manzilini olishda xatolik yuz berdi. Iltimos, administrator bilan bog'laning.");
        setIsLoading(false);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data ? JSON.stringify(err.response.data) : "Server bilan bog'lanishda xatolik yuz berdi.";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-accent-sky flex items-center">
          <DocumentArrowUpIcon className="h-8 w-8 mr-2" />
          {translate('submit_new_article', 'Yangi Maqola Yuborish')}
        </h1>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/writer/dashboard')}
          leftIcon={<ArrowLeftIcon className="h-4 w-4"/>}
        >
          {translate('back_to_dashboard', 'Panelga qaytish')}
        </Button>
      </div>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card title={translate('article_information', 'Maqola ma\'lumotlari')} icon={<BookOpenIcon className="h-6 w-6 text-accent-sky"/>}>
            <div className="space-y-6">
              <Input 
                label={translate('article_title_label', 'Maqola sarlavhasi')} 
                name="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  {translate('abstract_label', 'Annotatsiya')}
                </label>
                <textarea
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  required
                  rows={6}
                  className="modern-textarea"
                  placeholder="Maqola annotatsiyasini kiriting..."
                />
              </div>
              <Input 
                label={translate('keywords_label', 'Kalit so\'zlar (vergul bilan ajrating)')} 
                name="keywords" 
                value={keywords} 
                onChange={(e) => setKeywords(e.target.value)} 
                required 
              />
              
              <Input 
                label="UDK (Universal o'nlik klassifikatsiya)" 
                name="udk" 
                value={udk} 
                onChange={(e) => setUdk(e.target.value)} 
                placeholder="Masalan: 530.145"
              />
              
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  {translate('article_file_label', 'Maqola fayli (.doc, .pdf)')}
                </label>
                <div className="modern-file-upload">
                  <Input 
                    type="file" 
                    accept=".doc,.docx,.pdf"
                    onChange={(e) => setArticleFile(e.target.files?.[0] || null)} 
                    required 
                  />
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h3 className="font-medium text-light-text mb-2">
                  {translate('submission_guidelines', 'Yuborish yo\'riqnomasi')}
                </h3>
                <ul className="text-sm text-medium-text space-y-1 list-disc list-inside">
                  <li>Fayl formati .doc, .docx yoki .pdf bo'lishi kerak</li>
                  <li>Maqola hajmi minimal 5 bet, maksimal 20 bet bo'lishi kerak</li>
                  <li>Barcha ma'lumotlar to'liq va aniq bo'lishi kerak</li>
                  <li>Plagiat foizi 20% dan oshmasligi kerak</li>
                </ul>
              </div>
              
              <Button 
                type="submit" 
                fullWidth 
                isLoading={isLoading} 
                disabled={isLoading} 
                leftIcon={<DocumentArrowUpIcon className="h-5 w-5"/>}
                size="lg"
              >
                {translate('submit_article_button', 'Maqolani yuborish')}
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default WriterSubmitArticlePage;