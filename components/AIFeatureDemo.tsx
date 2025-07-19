
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import Button from './common/Button';
import Textarea from './common/Textarea';
import Input from './common/Input';
import Card from './common/Card';
import LoadingSpinner from './common/LoadingSpinner';
import Alert from './common/Alert';
import { useLanguage } from '../hooks/useLanguage';
import { GEMINI_TEXT_MODEL, API_KEY_ERROR_MESSAGE } from '../constants';

const AIFeatureDemo: React.FC = () => {
  const { translate } = useLanguage();
  const [title, setTitle] = useState<string>('');
  const [abstract, setAbstract] = useState<string>('');
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.API_KEY;

  const handleSuggestKeywords = useCallback(async () => {
    if (!apiKey) {
      setError(API_KEY_ERROR_MESSAGE);
      console.error(API_KEY_ERROR_MESSAGE);
      return;
    }
    if (!title.trim() || !abstract.trim()) {
      setError(translate('ai_error_title_abstract_required', 'Please enter both title and abstract.'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestedKeywords([]);

    try {
      const ai = new GoogleGenAI({apiKey});
      const prompt = `Suggest 5 relevant keywords for an academic article with the following title and abstract. Return keywords as a comma-separated list, without any additional text or numbering.
      Title: ${title}
      Abstract: ${abstract}`;
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
      });

      const textResponse = response.text;
      if (textResponse) {
        const keywords = textResponse.split(',').map(kw => kw.trim()).filter(kw => kw.length > 0);
        setSuggestedKeywords(keywords);
      } else {
        setError(translate('ai_error_no_keywords', 'AI could not suggest keywords. The response was empty.'));
      }
    } catch (e: any) {
      console.error("Error fetching AI keywords:", e);
      setError(`${translate('ai_error_fetching', 'Error fetching AI keywords:')} ${e.message || String(e)}`);
    } finally {
      setIsLoading(false);
    }
  }, [title, abstract, apiKey, translate]);

  return (
    <Card title={translate('ai_keyword_suggestion_title', 'AI Keyword Suggestion')} className="mt-6">
      <p className="text-sm text-medium-text mb-4">
        {translate('ai_keyword_suggestion_desc', 'Enter your article title and abstract, and our AI will suggest relevant keywords.')}
      </p>
      
      {!apiKey && (
         <Alert type="error" message={API_KEY_ERROR_MESSAGE} className="mb-4" />
      )}

      <Input
        label={translate('article_title_label', 'Article Title')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={translate('article_title_placeholder', 'Enter article title')}
        disabled={isLoading || !apiKey}
      />
      <Textarea
        label={translate('article_abstract_label', 'Abstract')}
        value={abstract}
        onChange={(e) => setAbstract(e.target.value)}
        placeholder={translate('article_abstract_placeholder', 'Enter article abstract')}
        rows={5}
        disabled={isLoading || !apiKey}
      />
      <Button 
        onClick={handleSuggestKeywords} 
        isLoading={isLoading}
        disabled={isLoading || !apiKey || !title.trim() || !abstract.trim()}
        className="mt-2 w-full sm:w-auto"
      >
        {translate('suggest_keywords_button', 'Suggest Keywords')}
      </Button>

      {error && <Alert type="error" message={error} className="mt-4" />}

      {suggestedKeywords.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-semibold text-accent-emerald mb-2">
            {translate('suggested_keywords_label', 'Suggested Keywords:')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {suggestedKeywords.map((keyword, index) => (
              <span
                key={index}
                className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
       {isLoading && <LoadingSpinner message={translate('ai_processing_message', 'AI is thinking...')} className="mt-4" />}
    </Card>
  );
};

export default AIFeatureDemo;
