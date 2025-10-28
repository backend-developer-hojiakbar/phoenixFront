import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { UserIcon, EnvelopeIcon, PhoneIcon, KeyIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/apiService';

const WriterProfilePage: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const { translate } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [surname, setSurname] = useState(user?.surname || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [orcidId, setOrcidId] = useState(user?.orcidId || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const userData = {
        name,
        surname,
        phone,
        orcidId
      };
      
      const response = await apiService.patch('/profile/', userData);
      
      // Update local storage with the updated user data
      if (user) {
        const updatedUser = response.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        await refetchUser();
      }
      
      setSuccessMessage("Profil ma'lumotlari muvaffaqiyatli saqlandi.");
      setIsEditing(false);
    } catch (err) {
      setError("Profil ma'lumotlarini saqlashda xatolik yuz berdi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Yangi parol va tasdiqlash paroli mos emas.");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const passwordData = {
        current_password: currentPassword,
        new_password: newPassword
      };
      
      await apiService.post('/change-password/', passwordData);
      
      setSuccessMessage("Parol muvaffaqiyatli o'zgartirildi.");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError("Parolni o'zgartirishda xatolik yuz berdi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-accent-sky flex items-center">
          <UserIcon className="h-8 w-8 mr-2" />
          {translate('profile_title', 'Profil')}
        </h1>
      </div>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title={translate('personal_information', 'Shaxsiy ma\'lumotlar')} icon={<UserIcon className="h-6 w-6 text-accent-sky"/>}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={translate('name_label', 'Ism')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<UserIcon className="h-5 w-5 text-slate-400" />}
                />
                <Input
                  label={translate('surname_label', 'Familiya')}
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<UserIcon className="h-5 w-5 text-slate-400" />}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={translate('phone_label', 'Telefon raqam')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<PhoneIcon className="h-5 w-5 text-slate-400" />}
                />
                <Input
                  label="ORCID ID"
                  value={orcidId}
                  onChange={(e) => setOrcidId(e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<UserIcon className="h-5 w-5 text-slate-400" />}
                  placeholder="https://orcid.org/0000-0000-0000-0000"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                {isEditing ? (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        // Reset form values
                        setName(user?.name || '');
                        setSurname(user?.surname || '');
                        setPhone(user?.phone || '');
                        setOrcidId(user?.orcidId || '');
                        setIsEditing(false);
                      }}
                      disabled={isSaving}
                    >
                      {translate('cancel_button', 'Bekor qilish')}
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      isLoading={isSaving}
                      disabled={isSaving}
                    >
                      {translate('save_changes_button', 'O\'zgarishlarni saqlash')}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    leftIcon={<UserIcon className="h-4 w-4" />}
                  >
                    {translate('edit_profile_button', 'Profilni tahrirlash')}
                  </Button>
                )}
              </div>
            </div>
          </Card>
          
          <Card title={translate('change_password_title', 'Parolni o\'zgartirish')} icon={<KeyIcon className="h-6 w-6 text-accent-sky"/>}>
            <div className="space-y-6">
              <Input
                label={translate('current_password_label', 'Joriy parol')}
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                leftIcon={<KeyIcon className="h-5 w-5 text-slate-400" />}
              />
              <Input
                label={translate('new_password_label', 'Yangi parol')}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<KeyIcon className="h-5 w-5 text-slate-400" />}
              />
              <Input
                label={translate('confirm_password_label', 'Parolni tasdiqlash')}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<KeyIcon className="h-5 w-5 text-slate-400" />}
              />
              
              <div className="flex justify-end">
                <Button
                  onClick={handleChangePassword}
                  isLoading={isSaving}
                  disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
                  leftIcon={<KeyIcon className="h-4 w-4" />}
                >
                  {translate('change_password_button', 'Parolni o\'zgartirish')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card title={translate('account_summary', 'Hisob ma\'lumotlari')} icon={<EnvelopeIcon className="h-6 w-6 text-accent-sky"/>}>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-slate-800 rounded-lg">
                <div className="p-2 bg-accent-purple/10 rounded-lg mr-3">
                  <UserIcon className="h-5 w-5 text-accent-purple" />
                </div>
                <div>
                  <p className="text-xs text-medium-text">{translate('role_label', 'Rol')}</p>
                  <p className="font-medium text-light-text">Yozuvchi</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-slate-800 rounded-lg">
                <div className="p-2 bg-accent-sky/10 rounded-lg mr-3">
                  <EnvelopeIcon className="h-5 w-5 text-accent-sky" />
                </div>
                <div>
                  <p className="text-xs text-medium-text">{translate('email_label', 'Email')}</p>
                  <p className="font-medium text-light-text">{user?.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-slate-800 rounded-lg">
                <div className="p-2 bg-emerald-500/10 rounded-lg mr-3">
                  <UserIcon className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-medium-text">{translate('member_since_label', 'A\'zo bo\'lgan sana')}</p>
                  <p className="font-medium text-light-text">15-oktabr, 2023</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-slate-800 rounded-lg">
                <div className="p-2 bg-amber-500/10 rounded-lg mr-3">
                  <DocumentTextIcon className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-medium-text">{translate('articles_submitted_label', 'Yuborilgan maqolalar')}</p>
                  <p className="font-medium text-light-text">12 ta</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WriterProfilePage;