import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
  leftIcon?: React.ReactNode;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, description, leftIcon, wrapperClassName = '', className = '', ...props }, ref) => {
    return (
      <div className={`modern-form-group ${wrapperClassName}`}>
        {label && (
          <label className="modern-form-label">
            {label}
            {props.required && <span className="text-accent-danger"> *</span>}
          </label>
        )}
        {description && (
          <span className="modern-form-description">{description}</span>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`modern-input ${leftIcon ? 'pl-10' : ''} ${error ? 'border-accent-danger' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-accent-danger">{error}</p>
        )}
      </div>
    );
  }
);

export default Input;