import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  leftIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, name, error, className = '', wrapperClassName = '', leftIcon, ...props }) => {
  const baseInputStyles = "bg-slate-700 border border-slate-600 rounded-lg text-light-text placeholder-slate-400 focus:ring-2 focus:ring-accent-sky focus:border-accent-sky focus:outline-none transition duration-150 ease-in-out";
  const errorInputStyles = "border-red-500 focus:ring-red-500 focus:border-red-500";
  
  // Adjust padding based on whether leftIcon is present
  const paddingStyles = leftIcon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-2.5';

  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && <label htmlFor={name} className="block text-sm font-medium text-light-text mb-1">{label}</label>}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          id={name}
          name={name}
          className={`w-full ${paddingStyles} ${baseInputStyles} ${error ? errorInputStyles : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default Input;
