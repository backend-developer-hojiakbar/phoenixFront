
import React from 'react';
import { InformationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  className?: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, className = '', onClose }) => {
  const typeStyles = {
    info: {
      bg: 'bg-sky-600/20 border-sky-500',
      icon: <InformationCircleIcon className="h-5 w-5 text-sky-400" />,
      text: 'text-sky-300',
    },
    success: {
      bg: 'bg-emerald-600/20 border-emerald-500',
      icon: <CheckCircleIcon className="h-5 w-5 text-emerald-400" />,
      text: 'text-emerald-300',
    },
    warning: {
      bg: 'bg-amber-600/20 border-amber-500',
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />,
      text: 'text-amber-300',
    },
    error: {
      bg: 'bg-red-600/20 border-red-500',
      icon: <XCircleIcon className="h-5 w-5 text-red-400" />,
      text: 'text-red-300',
    },
  };

  const currentStyle = typeStyles[type];

  return (
    <div className={`p-4 border-l-4 rounded-md shadow-md ${currentStyle.bg} ${className} flex items-start space-x-3`}>
      <div className="flex-shrink-0">
        {currentStyle.icon}
      </div>
      <div className={`flex-1 text-sm ${currentStyle.text}`}>
        {message}
      </div>
      {onClose && (
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
           <XCircleIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;
