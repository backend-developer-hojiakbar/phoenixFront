import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { User, Language, NotificationPreferences } from '../types';
import { SUPPORTED_LANGUAGES, LocalizationKeys } from '../constants';
import Alert from '../components/common/Alert';
import { BellAlertIcon } from '@heroicons/react/24/outline';
import { api } from '../services/api';

const ProfilePage: React.FC = () => {
  const { user, isLoading: authLoading, refetchUser } = useAuth();
  const { language: currentGlobalLang, setLanguage: setGlobalLanguage, translate } = useLanguage();
  
  const [formData, setFormData] = useState<Partial<User>>({});
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        surname: user.surname,
        phone: user.phone,
        orcidId: user.orcidId || '',
        language: user.language,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    setMessage(null);
    
    try {
      await api.patch(`/users/${user.id}/`, formData);
      setMessage({ type: 'success', text: translate('profile_updated_success') });
      setIsEditing(false);
      refetchUser();
      if(formData.language && formData.language !== currentGlobalLang) {
          setGlobalLanguage(formData.language);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmNewPassword) {
      setMessage({type: 'error', text: translate('password_mismatch_error')});
      return;
    }
    if (newPassword.length < 6) {
      setMessage({type: 'error', text: translate('password_too_short_error')});
      return;
    }
    setIsUpdating(true);
    
    try {
      await api.post(`/users/set_password/`, { current_password: currentPassword, new_password: newPassword });
      setMessage({type: 'success', text: translate('password_changed_success')});
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
        setMessage({type: 'error', text: err.message || 'Failed to change password.'});
    } finally {
        setIsUpdating(false);
    }
  };

  if (authLoading || !user) {
    return <div className="p-6 text-light-text">{translate('loading_profile')}</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-accent-sky">{translate('user_profile_title')}</h1>
      
      {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} className="mb-6" />}

      <Card title={translate('personal_information_title')}>
        <form onSubmit={handleProfileUpdate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Input label={translate('name_label')} name="name" value={formData.name || ''} onChange={handleChange} disabled={!isEditing || isUpdating} />
            <Input label={translate('surname_label')} name="surname" value={formData.surname || ''} onChange={handleChange} disabled={!isEditing || isUpdating} />
            <Input label={translate('phone_label')} type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} disabled />
            <Input label={translate('orcid_id_label')} name="orcidId" value={formData.orcidId || ''} onChange={handleChange} placeholder="0000-0000-0000-0000" disabled={!isEditing || isUpdating} />
          </div>
          <div className="mt-4">
             <label htmlFor="language" className="block text-sm font-medium text-light-text mb-1">{translate('language_label')}</label>
             <select 
                name="language" 
                id="language"
                value={formData.language || currentGlobalLang} 
                onChange={handleChange}
                disabled={!isEditing || isUpdating}
                className="w-full md:w-1/2 px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-light-text focus:ring-2 focus:ring-accent-sky focus:border-accent-sky focus:outline-none"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                ))}
              </select>
          </div>

          <div className="mt-6 flex space-x-3">
            {isEditing ? (
              <>
                <Button type="submit" isLoading={isUpdating} disabled={isUpdating}>{translate('save_changes_button')}</Button>
                <Button variant="secondary" onClick={() => { setIsEditing(false); setMessage(null); if(user) {setFormData(user);}}} disabled={isUpdating}>{translate('cancel_button')}</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>{translate('edit_profile_button')}</Button>
            )}
          </div>
        </form>
      </Card>

      <Card title={translate('change_password_title')}>
        <form onSubmit={handlePasswordChange}>
           <Input label={translate('current_password_label')} type="password" name="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={isUpdating} />
           <Input label={translate('new_password_label')} type="password" name="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isUpdating} />
           <Input label={translate('confirm_new_password_label')} type="password" name="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} disabled={isUpdating} />
           <Button type="submit" className="mt-2" isLoading={isUpdating} disabled={isUpdating}>{translate('update_password_button')}</Button>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;