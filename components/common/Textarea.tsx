
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, name, error, className = '', wrapperClassName = '', rows = 4, ...props }) => {
  const baseStyles = "w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-light-text placeholder-slate-400 focus:ring-2 focus:ring-accent-sky focus:border-accent-sky focus:outline-none transition duration-150 ease-in-out";
  const errorStyles = "border-red-500 focus:ring-red-500 focus:border-red-500";

  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && <label htmlFor={name} className="block text-sm font-medium text-light-text mb-1">{label}</label>}
      <textarea
        id={name}
        name={name}
        rows={rows}
        className={`${baseStyles} ${error ? errorStyles : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default Textarea;
