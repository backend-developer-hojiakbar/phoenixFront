// src/pages/LoginPage.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Alert from '../components/common/Alert';
import { ArrowLeftOnRectangleIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { LocalizationKeys } from '../constants';

const LoginPage: React.FC = () => {
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const { translate } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(phone, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || translate('login_failed_default_error', 'Login failed. Please check your credentials.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-slate-900 to-secondary-dark p-4 selection:bg-accent-purple/30 pb-24 md:pb-4">
      <Card className="w-full max-w-md" gradient={false}>
        <div className="text-center mb-8">
            <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-sky">
              {translate(LocalizationKeys.APP_TITLE_SHORT, 'PSPC')}
            </span>
            <p className="text-medium-text mt-2">{translate('login_welcome_message', 'Welcome back! Please login to your account.')}</p>
        </div>
        
        {error && <Alert type="error" message={error} className="mb-4" onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit}>
          <Input
            label={translate('phone_label', 'Phone')}
            type="tel"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998901234567"
            required
            disabled={isLoading}
          />
          <Input
            label={translate('password_label', 'Password')}
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isLoading}
          />

          <Button type="submit" className="w-full mt-4" isLoading={isLoading} disabled={isLoading} leftIcon={<ArrowLeftOnRectangleIcon className="h-5 w-5"/>}>
            {translate('login_button', 'Login')}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-medium-text">
          {translate('dont_have_account_prompt', "Don't have an account?")}{' '}
          <Link to="/register" className="font-medium text-accent-sky hover:text-accent-purple transition-colors">
            {translate('register_link', 'Register here')} <UserPlusIcon className="h-4 w-4 inline-block -mt-0.5"/>
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;