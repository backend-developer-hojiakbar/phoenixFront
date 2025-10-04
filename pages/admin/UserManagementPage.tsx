import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { User, UserRole } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { PencilIcon, TrashIcon, UserPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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
          <UserPlusIcon className="h-6 w-6 sm:h-8 sm:w-8 text-accent-sky flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-bold text-accent-sky">{translate('user_management_title')}</h1>
        </div>
        <Button 
          onClick={() => handleOpenModal()} 
          leftIcon={<UserPlusIcon className="h-4 w-4 sm:h-5 sm:w-5"/>} 
          size="sm" 
          className="sm:size-md admin-button-primary hover:opacity-90 transition-opacity"
        >
          {translate('add_new_user_button')}
        </Button>
      </div>

      {/* Action Message */}
      {actionMessage && <Alert type={actionMessage.type} message={actionMessage.text} onClose={() => setActionMessage(null)} className="my-4 admin-alert admin-alert-success" />}

      {/* Search Filter Card */}
      <Card className="admin-card-gradient" title={undefined} icon={undefined}>
        <div className="admin-filter-grid">
          <Input 
            label={translate('search_users_label')}
            placeholder={translate('type_to_search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"/>}
            wrapperClassName="mb-0 admin-form-group"
            className="admin-input"
          />
        </div>
      </Card>

      {/* User List Card */}
      <Card className="admin-card-gradient" title={undefined} icon={undefined}>
        {isLoading ? (
          <LoadingSpinner message={translate('loading_users')} />
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-medium-text mb-2">{translate('no_users_found_criteria')}</div>
            <Button 
              onClick={() => handleOpenModal()} 
              leftIcon={<UserPlusIcon className="h-4 w-4"/>} 
              className="admin-button-primary"
            >
              {translate('add_first_user_button')}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="min-w-full divide-y divide-slate-700 admin-table">
              <thead className="admin-table-header">
                <tr>
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 uppercase tracking-wider">{translate('name_label')}</th>
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 uppercase tracking-wider">{translate('phone_label')}</th>
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 uppercase tracking-wider">{translate('role_label')}</th>
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 uppercase tracking-wider">{translate('actions_label')}</th>
                </tr>
              </thead>
              <tbody className="bg-secondary-dark divide-y divide-slate-700">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-3 py-3 sm:px-4 sm:py-4 text-sm sm:text-base font-medium text-light-text max-w-xs truncate">{user.name} {user.surname}</td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4 text-sm text-medium-text">{user.phone}</td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4 text-sm text-medium-text">
                      <span className="admin-status-badge">
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4 text-sm font-medium space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenModal(user)} 
                        title={translate('edit_user_button')} 
                        className="admin-action-button hover:bg-slate-600"
                      >
                        <PencilIcon className="h-4 w-4"/>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(user.id)} 
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 admin-action-button" 
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
        {formError && <Alert type="error" message={formError} onClose={() => setFormError(null)} className="mb-4 admin-alert admin-alert-error" />}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="admin-form-group">
            <Input 
              label={translate('name_label')} 
              name="name" 
              value={formData.name || ''} 
              onChange={handleChange} 
              required 
              className="admin-input"
            />
          </div>
          <div className="admin-form-group">
            <Input 
              label={translate('surname_label')} 
              name="surname" 
              value={formData.surname || ''} 
              onChange={handleChange} 
              required 
              className="admin-input"
            />
          </div>
        </div>
        
        <div className="admin-form-group">
          <Input 
            label={translate('phone_label')} 
            type="tel" 
            name="phone" 
            value={formData.phone || ''} 
            onChange={handleChange} 
            required 
            className="admin-input"
          />
        </div>
        
        <div className="admin-form-group">
          <label htmlFor="role-modal" className="block text-sm font-medium text-light-text mb-1">{translate('role_label')}</label>
          <select
            id="role-modal"
            name="role"
            value={formData.role || ''}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-light-text focus:ring-2 focus:ring-accent-sky focus:border-accent-sky focus:outline-none text-sm admin-input"
          >
            {roleOptions.map(opt => <option key={opt.value} value={opt.value as string}>{opt.label}</option>)}
          </select>
        </div>
        
        {!editingUser && (
          <div className="admin-form-group">
            <Input 
              label={translate('password_label')} 
              type="password" 
              name="password" 
              onChange={handleChange} 
              placeholder={translate('set_initial_password_placeholder')} 
              className="admin-input"
            />
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <Button 
            variant="secondary" 
            onClick={handleCloseModal} 
            disabled={isLoading} 
            className="w-full sm:w-auto admin-button-secondary"
          >
            {translate('cancel_button')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            isLoading={isLoading} 
            disabled={isLoading} 
            className="w-full sm:w-auto admin-button-primary"
          >
            {editingUser ? translate('save_changes_button') : translate('create_user_button')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagementPage;