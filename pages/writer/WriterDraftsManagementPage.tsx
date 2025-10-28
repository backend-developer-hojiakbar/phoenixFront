import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useNavigate } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import apiService from '../../services/apiService';



const WriterDraftsManagementPage: React.FC = () => {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDrafts = async () => {
      setIsLoading(true);
      try {
        // For now, we'll use a placeholder since drafts aren't implemented in the backend yet
        // When backend is ready, this will be replaced with actual API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setDrafts([]);
      } catch (err) {
        setError("Qoralamalarni yuklashda xatolik yuz berdi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrafts();
  }, []);

  const handleDeleteDraft = async (draftId: number) => {
    if (!window.confirm("Ushbu qoralamani o'chirishni tasdiqlaysizmi?")) {
      return;
    }
    
    try {
      // For now, drafts aren't implemented in the backend yet
      // When backend is ready, this will be replaced with actual API call
      // await apiService.delete(`/writer/drafts/${draftId}/`);
      
      // For now, just update local state
      setDrafts(drafts.filter(draft => draft.id !== draftId));
    } catch (err) {
      setError("Qoralamani o'chirishda xatolik yuz berdi.");
    }
  };

  const filteredDrafts = drafts.filter(draft => 
    draft.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner message="Qoralamalar yuklanmoqda..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-accent-sky flex items-center">
          <DocumentTextIcon className="h-8 w-8 mr-2" />
          {translate('drafts_management_title', 'Qoralamalarni Boshqarish')}
        </h1>
        <Button 
          onClick={() => navigate('/writer/drafts/new')}
          leftIcon={<PlusIcon className="h-4 w-4"/>}
        >
          {translate('create_new_draft_button', 'Yangi qoralama yaratish')}
        </Button>
      </div>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Card title={undefined} icon={undefined}>
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PencilIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder={translate('search_drafts_placeholder', 'Qoralamalarni qidirish...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="modern-input pl-10"
            />
          </div>
        </div>
        
        {filteredDrafts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrafts.map(draft => (
              <div key={draft.id} className="modern-card hover:border-accent-purple transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-light-text text-lg line-clamp-2">{draft.title}</h3>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => navigate(`/writer/drafts/${draft.id}/edit`)}
                      leftIcon={<PencilIcon className="h-4 w-4" />}
                      aria-label={translate('edit_draft', 'Qoralamani tahrirlash')}
                    />
                    <Button 
                      size="sm" 
                      variant="danger"
                      onClick={() => handleDeleteDraft(draft.id)}
                      leftIcon={<TrashIcon className="h-4 w-4" />}
                      aria-label={translate('delete_draft', 'Qoralamani o\'chirish')}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-medium-text">
                    <ClockIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                      {translate('last_modified', 'Oxirgi o\'zgartirish')}: {new Date(draft.lastModified).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-medium-text">
                      {draft.wordCount} {translate('words', 'so\'z')}
                    </span>
                    <span className="modern-badge modern-badge-secondary">
                      {draft.status === 'completed' 
                        ? translate('completed', 'Tugallangan') 
                        : translate('in_progress', 'Jarayonda')}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    fullWidth 
                    size="sm"
                    onClick={() => navigate(`/writer/drafts/${draft.id}`)}
                    leftIcon={<EyeIcon className="h-4 w-4" />}
                  >
                    {translate('view_draft', 'Ko\'rish')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 mx-auto text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-light-text mb-2">
              {searchTerm 
                ? translate('no_drafts_found', 'Qidiruv bo\'yicha qoralamalar topilmadi') 
                : translate('no_drafts_yet', 'Hali qoralamalar mavjud emas')}
            </h3>
            <p className="text-medium-text mb-6">
              {searchTerm 
                ? translate('try_different_search', 'Boshqa so\'z bilan qidirib ko\'ring') 
                : translate('create_first_draft', 'Birinchi qoralamani yaratish uchun quyidagi tugmani bosing')}
            </p>
            <Button 
              onClick={() => navigate('/writer/drafts/new')}
              leftIcon={<PlusIcon className="h-4 w-4"/>}
            >
              {translate('create_new_draft_button', 'Yangi qoralama yaratish')}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default WriterDraftsManagementPage;