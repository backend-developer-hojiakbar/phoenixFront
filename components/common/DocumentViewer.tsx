import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface DocumentViewerProps {
  fileUrl: string;
  fileName: string;
  className?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ fileUrl, fileName, className = '' }) => {
  return (
    <div className={`modern-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="modern-card-title">
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          {fileName}
        </h3>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-4">
        <iframe
          src={fileUrl}
          className="w-full h-96 rounded-lg border border-slate-700"
          title={fileName}
        />
      </div>
      <div className="mt-4 flex justify-end">
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="modern-button modern-button-primary"
        >
          Download Document
        </a>
      </div>
    </div>
  );
};

export default DocumentViewer;
