import React, { useState, useEffect } from 'react';
import { EditorialBoardApplication } from '../../types';
import apiService from '../../services/apiService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { EyeIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusInfo: Record<string, string> = {
        pending: 'bg-yellow-500/20 text-yellow-300',
        approved: 'bg-emerald-500/20 text-emerald-300',
        rejected: 'bg-red-500/20 text-red-300',
    };
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusInfo[status]} admin-status-badge`}>{statusText}</span>;
};

const ApplicationsOverviewPage: React.FC = () => {
    const [applications, setApplications] = useState<EditorialBoardApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionError, setActionError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState<number | null>(null);

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            const { data } = await apiService.get<EditorialBoardApplication[]>('/applications/');
            setApplications(data);
        } catch (err) {
            setActionError("Arizalarni yuklashda xatolik.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
        setIsUpdating(id);
        setActionError(null);
        try {
            // Yangi URL'ga so'rov yuboramiz
            await apiService.patch(`/applications/${id}/update-status/`, { status });
            // Ma'lumotlarni yangilaymiz
            setApplications(prev => 
                prev.map(app => app.id === id ? { ...app, status } : app)
            );
        } catch (err) {
            setActionError("Statusni yangilashda xatolik yuz berdi.");
        } finally {
            setIsUpdating(null);
        }
    };

    if (isLoading) return <LoadingSpinner message="Arizalar yuklanmoqda..." />;

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header Section */}
            <div className="flex items-center space-x-3">
                <EyeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-accent-sky flex-shrink-0" />
                <h1 className="text-2xl sm:text-3xl font-bold text-accent-sky">Tahririyatga Arizalar</h1>
            </div>
            
            {/* Action Error */}
            {actionError && <Alert type="error" message={actionError} onClose={() => setActionError(null)} className="admin-alert admin-alert-error" />}
            
            {/* Applications Table Card */}
            <Card className="admin-card-gradient" title={undefined} icon={undefined}>
                <div className="overflow-x-auto rounded-lg border border-slate-700">
                    <table className="min-w-full divide-y divide-slate-700 admin-table">
                        <thead className="admin-table-header">
                            <tr>
                                <th className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 uppercase">Foydalanuvchi</th>
                                <th className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 uppercase">Ariza sanasi</th>
                                <th className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 uppercase">Status</th>
                                <th className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 uppercase">Hujjatlar</th>
                                <th className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 uppercase">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="bg-secondary-dark divide-y divide-slate-700">
                            {applications.length > 0 ? applications.map(app => (
                                <tr key={app.id} className="hover:bg-slate-700/50 transition-colors">
                                    <td className="px-3 py-3 sm:px-4 sm:py-4 text-sm whitespace-nowrap max-w-xs truncate">{app.user.name} {app.user.surname}</td>
                                    <td className="px-3 py-3 sm:px-4 sm:py-4 text-sm whitespace-nowrap">{new Date(app.submitted_at).toLocaleDateString()}</td>
                                    <td className="px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap"><StatusBadge status={app.status} /></td>
                                    <td className="px-3 py-3 sm:px-4 sm:py-4 text-sm whitespace-nowrap space-x-1">
                                        <a href={app.passport_file_url} target="_blank" rel="noreferrer">
                                          <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            leftIcon={<EyeIcon className="h-4 w-4"/>} 
                                            className="px-2 py-1 text-xs admin-action-button hover:bg-slate-600"
                                          >
                                            Pasport
                                          </Button>
                                        </a>
                                        <a href={app.photo_3x4_url} target="_blank" rel="noreferrer">
                                          <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            leftIcon={<EyeIcon className="h-4 w-4"/>} 
                                            className="px-2 py-1 text-xs admin-action-button hover:bg-slate-600"
                                          >
                                            Rasm
                                          </Button>
                                        </a>
                                        <a href={app.diploma_file_url} target="_blank" rel="noreferrer">
                                          <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            leftIcon={<EyeIcon className="h-4 w-4"/>} 
                                            className="px-2 py-1 text-xs admin-action-button hover:bg-slate-600"
                                          >
                                            Diplom
                                          </Button>
                                        </a>
                                    </td>
                                    <td className="px-3 py-3 sm:px-4 sm:py-4 text-sm whitespace-nowrap space-x-1">
                                        {app.status === 'pending' && (
                                            <>
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handleStatusUpdate(app.id, 'approved')} 
                                                    isLoading={isUpdating === app.id} 
                                                    leftIcon={<CheckIcon className="h-4 w-4"/>}
                                                    className="px-2 py-1 text-xs admin-button-primary hover:opacity-90"
                                                >
                                                    <span className="hidden xs:inline">Tasdiqlash</span>
                                                    <span className="xs:hidden"><CheckIcon className="h-4 w-4" /></span>
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="danger" 
                                                    onClick={() => handleStatusUpdate(app.id, 'rejected')} 
                                                    isLoading={isUpdating === app.id} 
                                                    leftIcon={<XMarkIcon className="h-4 w-4"/>}
                                                    className="px-2 py-1 text-xs admin-button-danger hover:opacity-90"
                                                >
                                                    <span className="hidden xs:inline">Rad etish</span>
                                                    <span className="xs:hidden"><XMarkIcon className="h-4 w-4" /></span>
                                                </Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-slate-400">Hozircha arizalar mavjud emas.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ApplicationsOverviewPage;