
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import Button from '../components/common/Button';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const NotFoundPage: React.FC = () => {
  const { translate } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-dark via-slate-900 to-secondary-dark text-center p-6 pb-24 md:pb-6"> {/* Added pb-24 for mobile nav */}
      <ExclamationTriangleIcon className="h-24 w-24 text-amber-400 mb-6 animate-pulse-fast" />
      <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-sky mb-4">
        404
      </h1>
      <h2 className="text-3xl font-semibold text-light-text mb-3">
        {translate('notfound_title', 'Page Not Found')}
      </h2>
      <p className="text-lg text-medium-text mb-8 max-w-md">
        {translate('notfound_message', 'Oops! The page you are looking for does not exist. It might have been moved or deleted.')}
      </p>
      <Button
        onClick={() => {}}
        className="text-lg"
      >
        <Link to="/dashboard" className="flex items-center">
         {translate('go_to_dashboard_button', 'Go to Dashboard')}
        </Link>
      </Button>
    </div>
  );
};

export default NotFoundPage;
