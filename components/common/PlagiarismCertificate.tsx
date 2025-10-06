import React from 'react';
import { CheckBadgeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface PlagiarismCertificateProps {
  articleTitle: string;
  authorName: string;
  similarityPercentage: number;
  aiContentProbability: number;
  issueDate: string;
  certificateId: string;
  onDownload?: () => void;
}

const PlagiarismCertificate: React.FC<PlagiarismCertificateProps> = ({
  articleTitle,
  authorName,
  similarityPercentage,
  aiContentProbability,
  issueDate,
  certificateId,
  onDownload
}) => {
  return (
    <div className="modern-card">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mb-4">
          <CheckBadgeIcon className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-light-text mb-2">Plagiarism Check Certificate</h2>
        <p className="text-medium-text">This certificate confirms the originality of the submitted work</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-medium-text uppercase tracking-wider mb-1">Article Title</h3>
            <p className="text-light-text">{articleTitle}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-medium-text uppercase tracking-wider mb-1">Author</h3>
            <p className="text-light-text">{authorName}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-medium-text uppercase tracking-wider mb-1">Similarity Percentage</h3>
            <p className={`text-2xl font-bold ${similarityPercentage < 15 ? 'text-emerald-500' : similarityPercentage < 25 ? 'text-amber-500' : 'text-red-500'}`}>
              {similarityPercentage}%
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-medium-text uppercase tracking-wider mb-1">AI Content Probability</h3>
            <p className={`text-2xl font-bold ${aiContentProbability < 10 ? 'text-emerald-500' : aiContentProbability < 20 ? 'text-amber-500' : 'text-red-500'}`}>
              {aiContentProbability}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-medium-text uppercase tracking-wider mb-1">Issue Date</h3>
          <p className="text-light-text">{issueDate}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-medium-text uppercase tracking-wider mb-1">Certificate ID</h3>
          <p className="text-light-text font-mono">{certificateId}</p>
        </div>
      </div>

      <div className="border-t border-slate-700 pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="text-medium-text text-sm">This certificate is issued by Phoenix Scientific Publication Center</p>
            <p className="text-medium-text text-sm mt-1">Valid for 30 days from issue date</p>
          </div>
          {onDownload && (
            <button
              onClick={onDownload}
              className="modern-button modern-button-primary"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Download Certificate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlagiarismCertificate;