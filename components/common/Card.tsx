// @ts-nocheck
import React from 'react';

const Card = ({ children, className = '', title, gradient = true, titleClassName = '', icon }) => {
  const baseCardStyles = "rounded-xl shadow-2xl overflow-hidden p-4 md:p-6 transition-all duration-300 hover:shadow-accent-purple/30";
  const gradientStyles = gradient ? "bg-gradient-to-br from-slate-800 via-slate-800 to-slate-700 border border-slate-700" : "bg-secondary-dark border border-slate-700";
  
  return (
    React.createElement('div', { className: `${baseCardStyles} ${gradientStyles} ${className}` },
      title && (
        React.createElement('h2', { className: `text-xl md:text-2xl font-semibold mb-4 text-accent-sky flex items-center ${titleClassName}` },
          icon && React.createElement('span', { className: 'mr-2 flex-shrink-0' }, icon),
          React.createElement('span', null, title)
        )
      ),
      children
    )
  );
};

export default Card;