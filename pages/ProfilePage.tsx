import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { User } from '../types';
import Alert from '../components/common/Alert';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProfilePage: React.FC = () => {
  const { user, refetchUser, isLoading: authLoading } = useAuth();
  const { translate } = useLanguage();
  
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        surname: user.surname,
        phone: user.phone,
        orcidId: user.orcidId
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    setMessage(null);
    
    try {
        await apiService.patch(`/users/${user.id}/`, formData);
        await refetchUser(); // Refetch user data to update context
        setMessage({type: 'success', text: translate('profile_updated_success')});
        setIsEditing(false);
    } catch(err: any) {
        setMessage({type: 'error', text: err.response?.data?.detail || 'Failed to update profile'});
    } finally {
        setIsUpdating(false);
    }
  };

  if (authLoading || !user) {
    return <LoadingSpinner message={translate('loading_profile')} />;
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
            <Input label={translate('phone_label')} type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} disabled={!isEditing || isUpdating} />
            <Input label={'ORCID iD'} name="orcidId" value={formData.orcidId || ''} onChange={handleChange} disabled={!isEditing || isUpdating} />
          </div>

          <div className="mt-6 flex space-x-3">
            {isEditing ? (
              <>
                <Button type="submit" isLoading={isUpdating} disabled={isUpdating}>{translate('save_changes_button')}</Button>
                <Button variant="secondary" onClick={() => { setIsEditing(false); setMessage(null); if(user) {setFormData(user)}}} disabled={isUpdating}>{translate('cancel_button')}</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>{translate('edit_profile_button')}</Button>
            )}
          </div>
        </form>
      </Card>
      
    </div>
  );
};

export default ProfilePage;