import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { Cog6ToothIcon, PuzzlePieceIcon, LockClosedIcon, LinkIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline'; 
import { IntegrationSettings } from '../../types'; 
import { LocalizationKeys } from '../../constants';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminSystemSettingsPage: React.FC = () => {
    const { translate } = useLanguage();
    const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [tempApiKeys, setTempApiKeys] = useState<{[key: string]: string}>({});

    const fetchSettings = () => {
        setIsLoading(true);
        api.get('/system-settings/')
          .then(data => {
              if (Array.isArray(data)) {
                  setIntegrationSettings(data);
              } else {
                  // Agar backend massiv qaytarmasa, xatolik beramiz
                  throw new Error("API did not return an array of settings.");
              }
          })
          .catch(err => setActionMessage({ type: 'error', text: err.message || 'Failed to load settings.' }))
          .finally(() => setIsLoading(false));
    };
    
    useEffect(() => {
        fetchSettings();
    }, []);
    
    const handleIntegrationSettingChange = (serviceName: IntegrationSettings['serviceName'], field: keyof IntegrationSettings, value: any) => {
        setIntegrationSettings(prev => prev.map(s => s.serviceName === serviceName ? {...s, [field]: value} : s));
    };

    const handleSaveIntegrationSettings = async (serviceName: IntegrationSettings['serviceName']) => {
        const settingToSave = integrationSettings.find(s => s.serviceName === serviceName);
        if (!settingToSave) return;

        const dataToSave: Partial<IntegrationSettings> & { apiKey?: string } = {
            isEnabled: settingToSave.isEnabled,
            serviceUrl: settingToSave.serviceUrl,
            monthlyLimit: settingToSave.monthlyLimit,
        };

        if(tempApiKeys[serviceName]) {
            dataToSave.apiKey = tempApiKeys[serviceName];
        }

        try {
            await api.patch(`/system-settings/${serviceName}/`, dataToSave);
            setActionMessage({ type: 'success', text: `${translate(LocalizationKeys.INTEGRATION_SETTINGS_UPDATED_SUCCESS_MESSAGE)}: ${serviceName}` });
            setTempApiKeys(prev => ({...prev, [serviceName]: ''}));
            fetchSettings(); 
        } catch(err: any) {
             setActionMessage({ type: 'error', text: err.message || 'Failed to save settings.'});
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-3">
                <Cog6ToothIcon className="h-8 w-8 text-accent-sky" />
                <h1 className="text-3xl font-bold text-accent-sky">{translate(LocalizationKeys.SYSTEM_SETTINGS_TITLE_ADMIN)}</h1>
            </div>

            {actionMessage && <Alert type={actionMessage.type} message={actionMessage.text} onClose={() => setActionMessage(null)} className="my-4" />}

            <Card title={translate(LocalizationKeys.INTEGRATION_SETTINGS_TITLE)} icon={<PuzzlePieceIcon className="h-6 w-6 text-accent-emerald"/>}>
                {integrationSettings.map(setting => (
                    <div key={setting.serviceName} className="mb-6 p-4 border border-slate-700 rounded-md bg-slate-800/30">
                        <h3 className="text-lg font-semibold text-light-text mb-2 flex items-center">
                             {setting.serviceName === 'AI_Gemini' ? <PuzzlePieceIcon className="h-5 w-5 mr-2 text-sky-400"/> : 
                             setting.serviceName === 'PlagiarismChecker' ? <ShieldExclamationIcon className="h-5 w-5 mr-2 text-amber-400"/> :
                             <LinkIcon className="h-5 w-5 mr-2 text-purple-400"/>}
                            {translate(
                                setting.serviceName === 'AI_Gemini' ? LocalizationKeys.AI_GEMINI_SERVICE_LABEL : 
                                setting.serviceName === 'PlagiarismChecker' ? LocalizationKeys.PLAGIARISM_CHECKER_SERVICE_LABEL :
                                LocalizationKeys.DOI_PROVIDER_SERVICE_LABEL,
                                setting.serviceName
                            )}
                        </h3>
                        <div className="flex items-center space-x-3 mb-3">
                            <label className="text-sm text-medium-text">{translate(LocalizationKeys.SERVICE_ENABLED_LABEL)}</label>
                            <input 
                                type="checkbox"
                                checked={setting.isEnabled}
                                onChange={(e) => handleIntegrationSettingChange(setting.serviceName, 'isEnabled', e.target.checked)}
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
                        <p className="text-xs text-slate-500 mb-3">{translate('api_key_management_note')}</p>

                        <Button onClick={() => handleSaveIntegrationSettings(setting.serviceName)} className="mt-4">
                            {translate(LocalizationKeys.SAVE_INTEGRATION_SETTINGS_BUTTON)}
                        </Button>
                    </div>
                ))}
            </Card>
        </div>
    );
};

export default AdminSystemSettingsPage;