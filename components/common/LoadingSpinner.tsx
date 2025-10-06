
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="modern-spinner"></div>
      {message && (
        <p className="mt-4 text-medium-text text-center">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
