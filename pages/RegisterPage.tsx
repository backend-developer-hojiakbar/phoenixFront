import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { UserRole } from '../types';
import Alert from '../components/common/Alert';
import { UserPlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [surname, setSurname] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [error, setError] = useState<string | null>(null);
  
  const { register, isLoading } = useAuth();
  const { translate } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError(translate('password_mismatch_error'));
      return;
    }
    if (password.length < 6) {
      setError(translate('password_too_short_error'));
      return;
    }

    try {
      await register({ name, surname, phone, password, role });
      if (role === UserRole.WRITER) {
        navigate('/writer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
        const errorData = err.response?.data;
        let errorMessage = translate('registration_failed_default_error');
        if(errorData) {
            // Combine all error messages from the backend
            errorMessage = Object.keys(errorData).map(key => `${key}: ${errorData[key]}`).join('; ');
        }
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-slate-900 to-secondary-dark p-4 selection:bg-accent-purple/30 pb-24 md:pb-4">
      <Card title={undefined} icon={undefined} className="w-full max-w-lg" gradient={false}>
        <div className="text-center mb-8">
            <UserPlusIcon className="h-16 w-16 mx-auto text-accent-sky mb-2" />
            <h2 className="text-3xl font-bold text-light-text">{translate('create_account_title')}</h2>
            <p className="text-medium-text mt-1">{translate('register_welcome_message')}</p>
        </div>
        
        {error && <Alert type="error" message={error} className="mb-4" onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={translate('name_label')}
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={translate('name_placeholder')}
              required
              disabled={isLoading}
              wrapperClassName="mb-0"
            />
            <Input
              label={translate('surname_label')}
              type="text"
              name="surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder={translate('surname_placeholder')}
              required
              disabled={isLoading}
              wrapperClassName="mb-0"
            />
          </div>
          <Input
            label={translate('phone_label')}
            type="tel"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="998901234567"
            required
            disabled={isLoading}
            wrapperClassName="mb-0"
          />
          <div className="mb-0">
            <label className="block text-sm font-medium text-light-text mb-1">
              {translate('role_label', 'Role')}
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={isLoading}
              className="modern-select"
            >
              <option value={UserRole.CLIENT}>{translate('client_role', 'Client')}</option>
              <option value={UserRole.WRITER}>{translate('writer_role', 'Writer')}</option>
            </select>
          </div>
          <Input
            label={translate('password_label')}
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={translate('password_placeholder_min_chars')}
            required
            disabled={isLoading}
            wrapperClassName="mb-0"
          />
          <Input
            label={translate('confirm_password_label')}
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={translate('confirm_password_placeholder')}
            required
            disabled={isLoading}
            wrapperClassName="mb-0"
          />

          <Button type="submit" className="w-full mt-6" isLoading={isLoading} disabled={isLoading} leftIcon={<UserPlusIcon className="h-5 w-5"/>}>
            {translate('register_button')}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-medium-text">
          {translate('already_have_account_prompt')}{' '}
          <Link to="/login" className="font-medium text-accent-sky hover:text-accent-purple transition-colors">
            {translate('login_link')} <ArrowLeftIcon className="h-4 w-4 inline-block -mt-0.5"/>
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default RegisterPage;