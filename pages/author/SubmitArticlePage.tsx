import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { Journal } from '../../types';
import { api } from '../../services/api';

const SubmitArticlePage: React.FC = () => {
  const { translate, language } = useLanguage();
  
  const [journals, setJournals] = useState<Journal[]>([]);
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState('');
  const [journalId, setJournalId] = useState<string>('');
  const [articleFile, setArticleFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    api.get('/journals/')
      .then(data => {
        setJournals(data);
        if (data.length > 0) {
          setJournalId(String(data[0].id));
        }
      })
      .catch(err => setError('Failed to load journals.'));
  }, []);

  const resetForm = () => {
    setTitle('');
    setAbstract('');
    setKeywords('');
    setJournalId(journals.length > 0 ? String(journals[0].id) : '');
    setArticleFile(null);
    const fileInput = document.getElementById('articleFile') as HTMLInputElement;
    if(fileInput) fileInput.value = "";
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !abstract || !keywords || !journalId || !articleFile) {
      setError(translate('all_fields_required_error'));
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('abstract', abstract);
    formData.append('keywords', keywords);
    formData.append('journal', journalId);
    formData.append('file', articleFile, articleFile.name);
    
    try {
      await api.post('/articles/', formData);
      setSuccessMessage(translate('article_submitted_success'));
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to submit article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getJournalName = (journal: Journal) => {
    if (language === 'uz' && journal.name_uz) return journal.name_uz;
    if (language === 'ru' && journal.name_ru) return journal.name_ru;
    return journal.name;
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-accent-sky">{translate('submit_new_article_title')}</h1>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-4" />}
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} className="mb-4" />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title={translate('article_details_title')}>
          <div>
            <label htmlFor="journalId" className="block text-sm font-medium text-light-text mb-1">{translate('select_journal_label')}</label>
            <select
              id="journalId"
              name="journalId"
              value={journalId}
              onChange={(e) => setJournalId(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-light-text focus:ring-2 focus:ring-accent-sky"
            >
              <option value="">-- {translate('select_journal_placeholder')} --</option>
              {journals.map(j => <option key={j.id} value={j.id}>{getJournalName(j)}</option>)}
            </select>
          </div>
          <Input label={translate('article_title_label')} name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea label={translate('article_abstract_label')} name="abstract" value={abstract} onChange={(e) => setAbstract(e.target.value)} rows={5} required />
          <Input label={translate('keywords_label')} name="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="e.g., AI, ML, Science" required />
        </Card>
        
        <Card title={translate('upload_article_file_title')}>
          <label htmlFor="articleFile" className="block text-sm font-medium text-light-text mb-1">{translate('article_file_label_docx_pdf')}</label>
          <input
            type="file"
            id="articleFile"
            name="articleFile"
            onChange={(e) => setArticleFile(e.target.files ? e.target.files[0] : null)}
            required
            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent-purple file:text-white"
          />
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} leftIcon={<DocumentArrowUpIcon className="h-5 w-5"/>}>
            {translate('submit_article_button')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SubmitArticlePage;