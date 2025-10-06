// @ts-nocheck
import React from 'react';

const Card = ({ children, className = '', title, gradient = true, titleClassName = '', icon }) => {
  return (
    <div className={`modern-card ${className}`}>
      {title && (
        <div className="modern-card-header">
          <h2 className={`modern-card-title ${titleClassName}`}>
            {icon && <span>{icon}</span>}
            <span>{title}</span>
          </h2>
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;