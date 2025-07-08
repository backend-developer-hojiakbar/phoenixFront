import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { User, UserRole, SelectOption } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { PencilIcon, TrashIcon, UserPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/apiService';
import { LocalizationKeys } from '../../constants';

const UserManagementPage: React.FC = () => {
  const { translate } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User> & { password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState<{type:'success'|'error', text:string}|null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get<User[]>('/users/');
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setActionMessage({ type: 'error', text: 'Foydalanuvchilarni yuklashda xatolik yuz berdi.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  
  const roleOptions: SelectOption[] = Object.values(UserRole).map(role => ({
    value: role,
    label: translate(`role_${role.toLowerCase()}`)
  }));

  const handleOpenModal = (user: User | null = null) => {
    setEditingUser(user);
    setFormData(user ? { ...user } : { role: UserRole.CLIENT });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!formData.name || !formData.surname || !formData.phone || !formData.role) {
      setFormError(translate('all_required_fields_error_user'));
      return;
    }
    
    setIsLoading(true);
    try {
        if (editingUser) {
            await apiService.patch(`/users/${editingUser.id}/`, formData);
            setActionMessage({ type: 'success', text: translate('user_updated_successfully') });
        } else {
            await apiService.post('/users/', formData);
            setActionMessage({ type: 'success', text: translate('user_created_successfully') });
        }
        await fetchUsers();
        handleCloseModal();
    } catch (err: any) {
        const errors = err.response?.data;
        const errorMessage = errors ? Object.values(errors).flat().join(' ') : 'Amalni bajarishda xatolik.';
        setFormError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm(translate('confirm_delete_user_prompt'))) {
      setIsLoading(true);
      try {
        await apiService.delete(`/users/${userId}/`);
        setActionMessage({ type: 'success', text: translate('user_deleted_successfully') });
        await fetchUsers();
      } catch (error) {
        setActionMessage({ type: 'error', text: 'Foydalanuvchini oʻchirishda xatolik.' });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const getRoleName = (role: UserRole) => {
    const roleOpt = roleOptions.find(r => r.value === role);
    return roleOpt ? roleOpt.label : role;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-accent-sky">{translate('user_management_title')}</h1>
        <Button onClick={() => handleOpenModal()} leftIcon={<UserPlusIcon className="h-5 w-5"/>}>
          {translate('add_new_user_button')}
        </Button>
      </div>

       {actionMessage && <Alert type={actionMessage.type} message={actionMessage.text} onClose={() => setActionMessage(null)} className="my-4"/>}

       <Card>
           <Input 
                label={translate('search_users_label')}
                placeholder={translate('type_to_search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400"/>}
                wrapperClassName="mb-0"
            />
       </Card>

      <Card>
        {isLoading ? (
            <LoadingSpinner message={translate('loading_users')} />
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-medium-text py-8">{translate('no_users_found_criteria')}</p>
        ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{translate('name_label')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{translate('phone_label')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{translate('role_label')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{translate('actions_label')}</th>
              </tr>
            </thead>
            <tbody className="bg-secondary-dark divide-y divide-slate-700">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text">{user.name} {user.surname}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">{user.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">{getRoleName(user.role)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(user)} title={translate('edit_user_button')}>
                        <PencilIcon className="h-4 w-4"/>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10" title={translate('delete_user_button')}>
                        <TrashIcon className="h-4 w-4"/>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? translate('edit_user_modal_title') : translate('add_new_user_modal_title')}>
        {formError && <Alert type="error" message={formError} onClose={() => setFormError(null)} className="mb-4" />}
        <Input label={translate('name_label')} name="name" value={formData.name || ''} onChange={handleChange} required />
        <Input label={translate('surname_label')} name="surname" value={formData.surname || ''} onChange={handleChange} required />
        <Input label={translate('phone_label')} type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} required />
        
        <div className="mb-4">
            <label htmlFor="role-modal" className="block text-sm font-medium text-light-text mb-1">{translate('role_label')}</label>
            <select
              id="role-modal"
              name="role"
              value={formData.role || ''}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-light-text focus:ring-2 focus:ring-accent-sky focus:border-accent-sky focus:outline-none"
            >
              {roleOptions.map(opt => <option key={opt.value} value={opt.value as string}>{opt.label}</option>)}
            </select>
        </div>
        {!editingUser && <Input label={translate('password_label')} type="password" name="password" onChange={handleChange} placeholder={translate('set_initial_password_placeholder')} />}

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary" onClick={handleCloseModal} disabled={isLoading}>{translate('cancel_button')}</Button>
          <Button onClick={handleSubmit} isLoading={isLoading} disabled={isLoading}>{editingUser ? translate('save_changes_button') : translate('create_user_button')}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagementPage;