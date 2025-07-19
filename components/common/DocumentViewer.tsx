import React from 'react';
import { DocumentArrowDownIcon, EyeIcon, PhotoIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import Button from './Button';

interface DocumentViewerProps {
  fileUrl?: string | null;
  fileName?: string;
}

const getFileExtension = (url: string): string => {
  // URL'dan fayl nomini olamiz va kengaytmasini qaytaramiz
  return url.split('.').pop()?.toLowerCase() || '';
};

const DocumentViewer: React.FC<DocumentViewerProps> = ({ fileUrl, fileName = 'Hujjat' }) => {
  // Agar fileUrl mavjud bo'lmasa, xabar ko'rsatamiz
  if (!fileUrl) {
    return (
      <div className="p-4 text-center bg-slate-700 rounded-md">
        <QuestionMarkCircleIcon className="h-12 w-12 mx-auto text-slate-500 mb-2" />
        <p className="text-sm text-slate-400">Fayl yuklanmagan yoki topilmadi.</p>
      </div>
    );
  }

  const fileExtension = getFileExtension(fileUrl);

  const renderContent = () => {
    switch (fileExtension) {
      case 'pdf':
        return <iframe src={fileUrl} className="w-full h-96 md:h-[600px] border-0" title={fileName}></iframe>;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <img src={fileUrl} alt={fileName} className="w-full h-auto max-h-[600px] object-contain rounded-md" />;
      default:
        return (
          <div className="p-8 text-center bg-slate-800 rounded-md">
            <PhotoIcon className="h-16 w-16 mx-auto text-slate-500 mb-4" />
            <p className="text-light-text mb-2">Oldindan ko'rish imkoni yo'q.</p>
            <p className="text-sm text-slate-400 mb-4">Fayl turi: .{fileExtension.toUpperCase()}</p>
            <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer">
              <Button leftIcon={<DocumentArrowDownIcon className="h-5 w-5" />}>
                {fileName} faylini yuklab olish
              </Button>
            </a>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {renderContent()}
      <div className="flex justify-end space-x-2">
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm" leftIcon={<EyeIcon className="h-4 w-4" />}>
            Yangi oynada ochish
          </Button>
        </a>
      </div>
    </div>
  );
};

export default DocumentViewer;