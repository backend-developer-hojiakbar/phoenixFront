
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  gradient?: boolean; // If true, applies a default gradient
  titleClassName?: string;
  icon?: React.ReactNode; // New optional icon prop
}

const Card: React.FC<CardProps> = ({ children, className = '', title, gradient = true, titleClassName = '', icon }) => {
  const baseCardStyles = "rounded-xl shadow-2xl overflow-hidden p-6 transition-all duration-300 hover:shadow-accent-purple/30";
  const gradientStyles = gradient ? "bg-gradient-to-br from-slate-800 via-slate-800 to-slate-700 border border-slate-700" : "bg-secondary-dark border border-slate-700";
  
  return (
    <div className={`${baseCardStyles} ${gradientStyles} ${className}`}>
      {title && (
        <h2 className={`text-xl font-semibold mb-4 text-accent-sky flex items-center ${titleClassName}`}>
          {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
          <span>{title}</span>
        </h2>
      )}
      {children}
    </div>
  );
};

export default Card;