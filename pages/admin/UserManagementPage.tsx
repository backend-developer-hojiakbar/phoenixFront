import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { User, UserRole } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { PencilIcon, TrashIcon, UserPlusIcon, MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/apiService';
import { LocalizationKeys } from '../../constants';

// Define SelectOption interface inline since it's not in the types file
interface SelectOption {
  value: string | number;
  label: string;
}

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
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 text-accent-sky flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-bold text-accent-sky">{translate('user_management_title')}</h1>
        </div>
        <Button 
          onClick={() => handleOpenModal()} 
          leftIcon={<UserPlusIcon className="h-4 w-4 sm:h-5 sm:w-5"/>} 
          size="sm" 
          className="sm:size-md"
        >
          {translate('add_new_user_button')}
        </Button>
      </div>

      {/* Action Message */}
      {actionMessage && <Alert type={actionMessage.type} message={actionMessage.text} onClose={() => setActionMessage(null)} className="my-4" />}

      {/* Search Filter Card */}
      <Card title={translate('filter_users_title')} icon={<MagnifyingGlassIcon className="h-6 w-6 text-accent-sky"/>}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text"
              placeholder={translate('type_to_search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="modern-input pl-10"
            />
          </div>
        </div>
      </Card>

      {/* User List Card */}
      <Card title={`${translate('user_list_title')} (${filteredUsers.length})`} icon={<UserGroupIcon className="h-6 w-6 text-accent-sky"/>}>
        {isLoading ? (
          <LoadingSpinner message={translate('loading_users')} />
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="h-12 w-12 mx-auto text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-light-text mb-2">{translate('no_users_found')}</h3>
            <p className="text-medium-text mb-4">{translate('no_users_found_criteria')}</p>
            <Button 
              onClick={() => handleOpenModal()} 
              leftIcon={<UserPlusIcon className="h-4 w-4"/>} 
              variant="primary"
            >
              {translate('add_first_user_button')}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="modern-table">
              <thead>
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{translate('name_label')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{translate('phone_label')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{translate('role_label')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{translate('actions_label')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-light-text">{user.name} {user.surname}</td>
                    <td className="px-4 py-3 text-sm text-medium-text">{user.phone}</td>
                    <td className="px-4 py-3 text-sm text-medium-text">
                      <span className="modern-badge modern-badge-primary">
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenModal(user)} 
                        title={translate('edit_user_button')} 
                      >
                        <PencilIcon className="h-4 w-4"/>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(user.id)} 
                        className="text-red-400 hover:text-red-300" 
                        title={translate('delete_user_button')}
                      >
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

      {/* User Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingUser ? translate('edit_user_modal_title') : translate('add_new_user_modal_title')}
      >
        {formError && <Alert type="error" message={formError} onClose={() => setFormError(null)} className="mb-4" />}
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label={translate('name_label')} 
              name="name" 
              value={formData.name || ''} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label={translate('surname_label')} 
              name="surname" 
              value={formData.surname || ''} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <Input 
            label={translate('phone_label')} 
            type="tel" 
            name="phone" 
            value={formData.phone || ''} 
            onChange={handleChange} 
            required 
          />
          
          <div>
            <label htmlFor="role-modal" className="block text-sm font-medium text-light-text mb-1">{translate('role_label')}</label>
            <select
              id="role-modal"
              name="role"
              value={formData.role || ''}
              onChange={handleChange}
              required
              className="modern-select"
            >
              {roleOptions.map(opt => <option key={opt.value} value={opt.value as string}>{opt.label}</option>)}
            </select>
          </div>
          
          {!editingUser && (
            <Input 
              label={translate('password_label')} 
              type="password" 
              name="password" 
              onChange={handleChange} 
              placeholder={translate('set_initial_password_placeholder')} 
            />
          )}

          <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <Button 
              variant="secondary" 
              onClick={handleCloseModal} 
              disabled={isLoading} 
            >
              {translate('cancel_button')}
            </Button>
            <Button 
              onClick={handleSubmit} 
              isLoading={isLoading} 
              disabled={isLoading} 
              variant="primary"
            >
              {editingUser ? translate('save_changes_button') : translate('create_user_button')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagementPage;