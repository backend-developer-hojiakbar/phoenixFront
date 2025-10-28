import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { Cog6ToothIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline'; 
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BookOpenIcon } from '@heroicons/react/24/outline';

// Define IntegrationSetting interface inline since it's not in the types file
interface IntegrationSetting {
  serviceName: string;
  isEnabled: boolean;
  monthlyLimit: number;
  serviceUrl: string;
  apiKeyMasked?: string;
}

const AdminSystemSettingsPage: React.FC = () => {
    const { translate } = useLanguage();
    const [settings, setSettings] = useState<IntegrationSetting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [tempApiKeys, setTempApiKeys] = useState<Record<string, string>>({});
    const [tempSettings, setTempSettings] = useState<IntegrationSetting[]>([]);


    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            // Endi bu yerga massiv keladi
            const { data } = await apiService.get<IntegrationSetting[]>('/system-settings/');
            setSettings(data);
            // JSON.parse(JSON.stringify(data)) chuqur nusxalash uchun yaxshi usul
            setTempSettings(JSON.parse(JSON.stringify(data)));
        } catch (error) {
            setActionMessage({type: 'error', text: "Sozlamalarni yuklashda xatolik."});
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSettingChange = (serviceName: string, field: keyof IntegrationSetting, value: any) => {
        setTempSettings(prev => prev.map(s => {
            if (s.serviceName === serviceName) {
                return {...s, [field]: value};
            }
            return s;
        }));
    };

    const handleSaveSettings = async (serviceName: string) => {
        const settingToUpdate = tempSettings.find(s => s.serviceName === serviceName);
        if (!settingToUpdate) return;
        
        setIsLoading(true);
        setActionMessage(null);
        
        // Backendga yuboriladigan ma'lumotlar
        const dataToPatch: Partial<IntegrationSetting> & { apiKey?: string } = {
            isEnabled: settingToUpdate.isEnabled,
            monthlyLimit: settingToUpdate.monthlyLimit,
            serviceUrl: settingToUpdate.serviceUrl,
        };
        
        const tempApiKey = tempApiKeys[serviceName];
        if (tempApiKey) {
            dataToPatch.apiKey = tempApiKey;
        }

        try {
            // URL'ni to'g'rilaymiz, serviceName qo'shiladi
            await apiService.patch(`/system-settings/${serviceName}/`, dataToPatch);
            setActionMessage({ type: 'success', text: "Sozlamalar muvaffaqiyatli saqlandi!" });
            await fetchSettings(); // Yangilangan ma'lumotlarni olish
            setTempApiKeys(prev => ({ ...prev, [serviceName]: '' })); // Vaqtinchalik API keyni tozalash
        } catch(err: any) {
            setActionMessage({type: 'error', text: err.response?.data?.error || 'Sozlamalarni saqlashda xatolik.'});
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <Cog6ToothIcon className="h-6 w-6 sm:h-8 sm:w-8 text-accent-sky flex-shrink-0" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-accent-sky">Tizim Sozlamalari</h1>
                </div>
                <Button 
                    onClick={() => window.location.hash = '#/service-management'}
                    className="modern-button modern-button-secondary"
                >
                    <Cog6ToothIcon className="h-5 w-5 mr-2" />
                    Xizmatlarni Boshqarish
                </Button>
            </div>

            {/* Action Message */}
            {actionMessage && <Alert type={actionMessage.type} message={actionMessage.text} onClose={() => setActionMessage(null)} className="my-4 admin-alert admin-alert-success" />}

            {/* Integration Settings Card */}
            <Card className="admin-card-gradient" title="Integratsiya Sozlamalari" icon={<PuzzlePieceIcon className="h-5 w-5 sm:h-6 sm:w-6 text-accent-emerald"/>}>
                {isLoading ? <LoadingSpinner /> : tempSettings.length > 0 ? tempSettings.map(setting => (
                    <div key={setting.serviceName} className="mb-5 sm:mb-6 p-4 sm:p-5 border border-slate-700 rounded-md bg-slate-800/30 admin-card hover:shadow-lg transition-shadow">
                        <h3 className="text-lg sm:text-xl font-semibold text-light-text mb-3 flex items-center">
                            {setting.serviceName}
                        </h3>
                        
                        {/* Service Enabled Toggle */}
                        <div className="flex items-center space-x-3 mb-4">
                            <label className="text-sm text-medium-text">Servis faol</label>
                            <input 
                                type="checkbox"
                                checked={setting.isEnabled}
                                onChange={(e) => handleSettingChange(setting.serviceName, 'isEnabled', e.target.checked)}
                                className="form-checkbox h-5 w-5 sm:h-6 sm:w-6 text-accent-purple bg-slate-600 border-slate-500 rounded focus:ring-accent-purple admin-checkbox"
                            />
                        </div>
                        
                        {/* API Key Input */}
                        <div className="admin-form-group mb-4">
                          <Input 
                              label="Yangi API Key kiritish" 
                              type="password"
                              value={tempApiKeys[setting.serviceName] || ''}
                              onChange={e => setTempApiKeys(prev => ({...prev, [setting.serviceName]: e.target.value}))}
                              placeholder={setting.apiKeyMasked || 'API kaliti kiritilmagan'}
                              wrapperClassName="mb-1"
                              className="admin-input"
                          />
                        </div>
                        
                        {/* Service URL Input */}
                        <div className="admin-form-group mb-4">
                          <Input
                              label={'Servis URL manzili'}
                              value={setting.serviceUrl || ''}
                              onChange={(e) => handleSettingChange(setting.serviceName, 'serviceUrl', e.target.value)}
                              className="admin-input"
                          />
                        </div>
                        
                        {/* Monthly Limit Input */}
                        <div className="admin-form-group mb-4">
                          <Input
                              label={'Oylik chegara (limit)'}
                              type="number"
                              value={setting.monthlyLimit || ''}
                              onChange={(e) => handleSettingChange(setting.serviceName, 'monthlyLimit', parseInt(e.target.value) || 0)}
                              className="admin-input"
                          />
                        </div>
                        
                        {/* Helper Text */}
                        <p className="text-xs text-slate-500 mb-4">API kalitini o'zgartirish uchun shu yerga yangisini yozing. O'zgartirmasangiz, bo'sh qoldiring.</p>

                        {/* Save Button */}
                        <Button 
                          onClick={() => handleSaveSettings(setting.serviceName)} 
                          className="mt-2 w-full sm:w-auto admin-button-primary hover:opacity-90"
                          isLoading={isLoading}
                        >
                            Saqlash
                        </Button>
                    </div>
                )) : (
                    <div className="text-center py-12">
                        <p className="text-medium-text mb-4">Hech qanday sozlama topilmadi.</p>
                        <Button 
                          onClick={fetchSettings} 
                          variant="secondary" 
                          className="admin-button-secondary"
                        >
                          Qayta urinib ko'rish
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminSystemSettingsPage;