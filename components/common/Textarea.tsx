import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  description?: string;
  leftIcon?: React.ReactNode;
  wrapperClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
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
          <textarea
            ref={ref}
            className={`modern-textarea ${leftIcon ? 'pl-10' : ''} ${error ? 'border-accent-danger' : ''} ${className}`}
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

export default Textarea;