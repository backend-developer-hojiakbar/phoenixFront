import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { Cog6ToothIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline'; 
import { IntegrationSetting } from '../../types'; 
import { LocalizationKeys } from '../../constants';
import apiService from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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
            const { data } = await apiService.get<IntegrationSetting[]>('/system-settings/');
            setSettings(data);
            setTempSettings(JSON.parse(JSON.stringify(data))); // Deep copy for editing
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
            await apiService.patch(`/system-settings/${serviceName}/`, dataToPatch);
            setActionMessage({ type: 'success', text: translate(LocalizationKeys.INTEGRATION_SETTINGS_UPDATED_SUCCESS_MESSAGE) });
            await fetchSettings(); // Refetch to get updated masked keys
            setTempApiKeys(prev => ({ ...prev, [serviceName]: '' })); // Clear temp key
        } catch(err: any) {
            setActionMessage({type: 'error', text: err.response?.data?.error || 'Sozlamalarni saqlashda xatolik.'});
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-3">
                <Cog6ToothIcon className="h-8 w-8 text-accent-sky" />
                <h1 className="text-3xl font-bold text-accent-sky">{translate(LocalizationKeys.SYSTEM_SETTINGS_TITLE_ADMIN)}</h1>
            </div>

            {actionMessage && <Alert type={actionMessage.type} message={actionMessage.text} onClose={() => setActionMessage(null)} className="my-4" />}

            <Card title={translate(LocalizationKeys.INTEGRATION_SETTINGS_TITLE)} icon={<PuzzlePieceIcon className="h-6 w-6 text-accent-emerald"/>}>
                {isLoading ? <LoadingSpinner /> : tempSettings.map(setting => (
                    <div key={setting.serviceName} className="mb-6 p-4 border border-slate-700 rounded-md bg-slate-800/30">
                        <h3 className="text-lg font-semibold text-light-text mb-2 flex items-center">
                            {setting.serviceName}
                        </h3>
                        <div className="flex items-center space-x-3 mb-3">
                            <label className="text-sm text-medium-text">{translate(LocalizationKeys.SERVICE_ENABLED_LABEL)}</label>
                            <input 
                                type="checkbox"
                                checked={setting.isEnabled}
                                onChange={(e) => handleSettingChange(setting.serviceName, 'isEnabled', e.target.checked)}
                                className="form-checkbox h-5 w-5 text-accent-purple bg-slate-600 border-slate-500 rounded focus:ring-accent-purple"
                            />
                        </div>
                        
                        <Input 
                            label={translate(LocalizationKeys.SET_API_KEY_BUTTON)} 
                            type="password"
                            value={tempApiKeys[setting.serviceName] || ''}
                            onChange={e => setTempApiKeys(prev => ({...prev, [setting.serviceName]: e.target.value}))}
                            placeholder={setting.apiKeyMasked || translate('key_not_set_placeholder')}
                            wrapperClassName="mb-1"
                        />
                         <Input
                            label={'Service URL'}
                            value={setting.serviceUrl || ''}
                            onChange={(e) => handleSettingChange(setting.serviceName, 'serviceUrl', e.target.value)}
                        />
                         <Input
                            label={'Monthly Limit'}
                            type="number"
                            value={setting.monthlyLimit || ''}
                            onChange={(e) => handleSettingChange(setting.serviceName, 'monthlyLimit', parseInt(e.target.value) || 0)}
                        />
                        <p className="text-xs text-slate-500 mb-3">{translate('api_key_management_note')}</p>

                        <Button onClick={() => handleSaveSettings(setting.serviceName)} className="mt-4" isLoading={isLoading}>
                            {translate(LocalizationKeys.SAVE_INTEGRATION_SETTINGS_BUTTON)}
                        </Button>
                    </div>
                ))}
            </Card>
        </div>
    );
};

export default AdminSystemSettingsPage;