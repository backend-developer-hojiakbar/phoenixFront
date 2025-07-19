import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { UserRole, DashboardSummary, Article } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { DocumentPlusIcon, DocumentMagnifyingGlassIcon, UsersIcon, CogIcon, PresentationChartBarIcon, BanknotesIcon, DocumentCheckIcon, EyeIcon } from '@heroicons/react/24/outline';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import DocumentViewer from '../components/common/DocumentViewer';
import Alert from '../components/common/Alert';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for approval modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const { data } = await apiService.get<DashboardSummary>('/dashboard-summary/');
        setSummary(data);
    } catch (err) {
        setError("Boshqaruv paneli ma'lumotlarini yuklashda xatolik.");
        console.error("Failed to fetch dashboard summary", err);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchSummary();
    }
  }, [user]);
  
  const handleOpenApprovalModal = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };
  
  const handleApprovePayment = async () => {
    if (!selectedArticle) return;
    setIsApproving(true);
    setError(null);
    try {
      await apiService.post(`/approve-payment/${selectedArticle.id}/`);
      setIsModalOpen(false);
      await fetchSummary(); // Refresh dashboard data
    } catch (err: any) {
      setError(err.response?.data?.error || "To'lovni tasdiqlashda xatolik.");
    } finally {
      setIsApproving(false);
    }
  };

  const renderApprovalSection = () => (
    <Card title="Tasdiqlanishi Kutilayotgan To'lovlar" icon={<DocumentCheckIcon className="h-6 w-6 text-accent-sky"/>}>
      {summary?.pending_payments_list && summary.pending_payments_list.length > 0 ? (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-800">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-300">Maqola</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-300">Muallif</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-300">Amal</th>
                    </tr>
                </thead>
                <tbody className="bg-secondary-dark divide-y divide-slate-700">
                    {summary.pending_payments_list.map(article => (
                        <tr key={article.id}>
                            <td className="px-4 py-3 text-sm">{article.title}</td>
                            <td className="px-4 py-3 text-sm">{article.author.name} {article.author.surname}</td>
                            <td className="px-4 py-3">
                                <Button size="sm" onClick={() => handleOpenApprovalModal(article)} leftIcon={<EyeIcon className="h-4 w-4"/>}>
                                    Ko'rish va Tasdiqlash
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      ) : (
        <p className="text-center text-medium-text py-4">Tasdiqlanishi kutilayotgan to'lovlar mavjud emas.</p>
      )}
    </Card>
  );

  const renderClientDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card title={'Maqolalarim holati'}>
        <p>Ko'rib chiqilmoqda: <span className="font-semibold">{summary?.pending || 0}</span></p>
        <p>Qayta ishlash kerak: <span className="font-semibold">{summary?.revision || 0}</span></p>
        <p>Qabul qilingan: <span className="font-semibold">{summary?.accepted || 0}</span></p>
        <Button onClick={() => navigate('/submit-article')} leftIcon={<DocumentPlusIcon className="h-5 w-5"/>} className="mt-4">Yangi maqola yuborish</Button>
      </Card>
    </div>
  );

  const renderEditorDashboard = () => (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card title={'Ko\'rib chiqish uchun maqolalar'}>
        <p>Yangi kelganlar: <span className="font-semibold">{summary?.newSubmissions || 0}</span></p>
        <p>Jarayonda: <span className="font-semibold">{summary?.reviewing || 0}</span></p>
        <Button onClick={() => navigate('/assigned-articles')} leftIcon={<DocumentMagnifyingGlassIcon className="h-5 w-5"/>} className="mt-4">Maqolalarni ko'rish</Button>
      </Card>
    </div>
  );
  
  const renderAccountantDashboard = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title={"Jami Tushum"} icon={<BanknotesIcon className="h-6 w-6 text-accent-emerald"/>}>
                <p className="text-4xl font-bold">{new Intl.NumberFormat('uz-UZ').format( (summary?.total_submission_fees || 0) + (summary?.total_publication_fees || 0) )} UZS</p>
            </Card>
            <Card title={"Tasdiqlanishi kutilayotgan to'lovlar soni"} icon={<DocumentCheckIcon className="h-6 w-6 text-accent-sky"/>}>
                <p className="text-4xl font-bold">{summary?.payments_pending_approval || 0}</p>
            </Card>
        </div>
        {renderApprovalSection()}
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card title={'Umumiy tizim holati'} icon={<PresentationChartBarIcon className="h-6 w-6 text-accent-sky"/>}>
                <p>Foydalanuvchilar: {summary?.totalUsers || 0}</p>
                <p>Jurnallar: {summary?.totalJournals || 0}</p>
                <p>Maqolalar: {summary?.totalArticles || 0}</p>
            </Card>
            <Card title={"Jami Tushum"} icon={<BanknotesIcon className="h-6 w-6 text-accent-emerald"/>}>
                 <p className="text-2xl font-bold">{new Intl.NumberFormat('uz-UZ').format( (summary?.total_submission_fees || 0) + (summary?.total_publication_fees || 0) )} UZS</p>
            </Card>
            <Card title={"Kutilayotgan to'lovlar"} icon={<DocumentCheckIcon className="h-6 w-6 text-accent-sky"/>}>
                <p className="text-2xl font-bold">{summary?.payments_pending_approval || 0}</p>
            </Card>
             <Card title={'Boshqaruv'} icon={<CogIcon className="h-6 w-6 text-accent-purple"/>}>
                <Button fullWidth variant="secondary" onClick={() => navigate('/user-management')} leftIcon={<UsersIcon className="h-5 w-5"/>}>Foydalanuvchilar</Button>
             </Card>
        </div>
        {renderApprovalSection()}
    </div>
  );
  
  if (isLoading || !user) {
    return <LoadingSpinner message={'Ma\'lumotlar yuklanmoqda...'} />;
  }

  return (
    <>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-light-text">Boshqaruv Paneli</h1>
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {user.role === UserRole.CLIENT && renderClientDashboard()}
        {user.role === UserRole.JOURNAL_MANAGER && renderEditorDashboard()}
        {user.role === UserRole.ACCOUNTANT && renderAccountantDashboard()}
        {user.role === UserRole.ADMIN && renderAdminDashboard()}
      </div>
      
      {selectedArticle && (
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`To'lovni tasdiqlash: ${selectedArticle.title}`} size="3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <h4 className='text-lg font-semibold text-light-text mb-2'>Foydalanuvchi yuklagan kvitansiya</h4>
                      <DocumentViewer fileUrl={selectedArticle.submissionReceiptFileUrl!} fileName="Kvitansiya" />
                  </div>
                  <div className="flex flex-col">
                       <h4 className='text-lg font-semibold text-light-text mb-2'>Tasdiqlash</h4>
                       <p className='text-medium-text mb-4'>Ushbu maqola uchun to'lov kvitansiyasini ko'rib chiqdingizmi? "Tasdiqlash" tugmasini bosish orqali maqola ko'rib chiqish jarayoniga o'tkaziladi.</p>
                       <div className='mt-auto flex justify-end space-x-3'>
                          <Button variant='secondary' onClick={() => setIsModalOpen(false)}>Bekor qilish</Button>
                          <Button onClick={handleApprovePayment} isLoading={isApproving}>
                              Tasdiqlash
                          </Button>
                       </div>
                  </div>
              </div>
          </Modal>
      )}
    </>
  );
};

export default DashboardPage;