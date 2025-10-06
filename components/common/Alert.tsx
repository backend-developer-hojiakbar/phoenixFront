import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose, className = '' }) => {
  const typeClasses = {
    success: 'modern-alert-success',
    error: 'modern-alert-error',
    warning: 'modern-alert-warning',
    info: 'modern-alert-info',
  };

  return (
    <div className={`modern-alert ${typeClasses[type]} ${className}`}>
      <div className="flex-1">
        <p>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current hover:opacity-70 focus:outline-none"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;