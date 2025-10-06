import React, { ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="modern-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div 
        className="modern-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modern-modal-header">
          {title && <h2 className="modern-modal-title">{title}</h2>}
          <button
            onClick={onClose}
            className="modern-modal-close"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="modern-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;