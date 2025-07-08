import React from 'react';
import Button from './Button';
import { ArrowDownTrayIcon, DocumentIcon } from '@heroicons/react/24/outline';

interface DocumentViewerProps {
  fileUrl: string;
  fileName?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ fileUrl, fileName }) => {
  const getFileExtension = (url: string) => {
    try {
      return new URL(url).pathname.split('.').pop()?.toLowerCase() || '';
    } catch (e) {
      return url.split('.').pop()?.toLowerCase() || '';
    }
  };

  const extension = getFileExtension(fileUrl);

  const renderContent = () => {
    if (extension === 'pdf') {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-full border-0"
          title={fileName || 'PDF Viewer'}
        />
      );
    }

    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
      return (
        <div className="flex justify-center items-center w-full h-full p-4 bg-black/20">
            <img 
                src={fileUrl} 
                alt={fileName || 'Image preview'} 
                className="max-w-full max-h-full object-contain"
            />
        </div>
      );
    }

    // DOCX va boshqa fayllar uchun
    return (
      <div className="flex flex-col justify-center items-center w-full h-full text-center p-8 bg-slate-800">
        <DocumentIcon className="h-24 w-24 text-slate-500 mb-4" />
        <h3 className="text-xl font-semibold text-light-text mb-2">Faylni Ko'rish Imkonsiz</h3>
        <p className="text-medium-text mb-6 max-w-sm">
          '{extension.toUpperCase()}' formatidagi fayllarni bevosita sahifada ko'rsatib bo'lmaydi. Faylni ko'rish uchun uni yuklab olishingiz mumkin.
        </p>
        <Button as="a" href={fileUrl} target="_blank" download>
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          {fileName || 'Faylni'} Yuklab Olish
        </Button>
      </div>
    );
  };

  return (
    <div className="w-full h-[80vh] bg-slate-900 rounded-lg overflow-hidden">
        {renderContent()}
    </div>
  );
};

export default DocumentViewer;