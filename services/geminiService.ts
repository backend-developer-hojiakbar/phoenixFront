
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_TEXT_MODEL, API_KEY_ERROR_MESSAGE, LocalizationKeys } from '../constants';
import { AIJournalSuggestion, AIReferenceCheckSuggestion, PlagiarismCheckResult, AITitleSuggestion, AIComplianceCheckResult, AIComplianceReportItem, JournalChecklistItem } from "../types";

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.error(API_KEY_ERROR_MESSAGE);
}

const ensureAiInitialized = () => {
  if (!ai) {
    throw new Error(LocalizationKeys.API_KEY_REQUIRED_FOR_AI_FEATURE);
  }
  return ai;
}

export const suggestKeywordsFromGemini = async (title: string, abstract: string): Promise<string[]> => {
  const currentAi = ensureAiInitialized();
  if (!title.trim() || !abstract.trim()) {
    throw new Error("Title and abstract are required for keyword suggestion.");
  }

  const prompt = `Suggest 5 relevant keywords for an academic article. Return keywords as a comma-separated list, without any additional text, numbering, or markdown.
  Title: "${title}"
  Abstract: "${abstract}"`;

  try {
    const response: GenerateContentResponse = await currentAi.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
    });
    
    const textResponse = response.text;
    if (textResponse) {
      let cleanedText = textResponse.replace(/```json|```/g, '').trim();
      if (cleanedText.startsWith('"') && cleanedText.endsWith('"')) {
          cleanedText = cleanedText.substring(1, cleanedText.length -1);
      }
      const keywords = cleanedText.split(',').map(kw => kw.trim()).filter(kw => kw.length > 0);
      return keywords;
    }
    return [];
  } catch (error: any) {
    console.error("Error calling Gemini API for keyword suggestion:", error);
    throw new Error(`Gemini API error: ${error.message || String(error)}`);
  }
};


export const suggestTitlesWithGemini = async (abstract: string, keywords: string[]): Promise<string[]> => {
  const currentAi = ensureAiInitialized();
  if (!abstract.trim() || keywords.length === 0) {
    throw new Error("Abstract and keywords are required for title suggestion.");
  }

  const prompt = `Based on the following academic article abstract and keywords, suggest 3 alternative, concise, and impactful titles.
  Return the response as a JSON array of strings. Example: ["Title 1", "Title 2", "Title 3"]

  Abstract: "${abstract}"
  Keywords: ${keywords.join(', ')}
  `;

  try {
    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    const parsedData = JSON.parse(jsonStr);
    if (Array.isArray(parsedData)) {
        return parsedData.filter(title => typeof title === 'string');
    }
    return [];
  } catch (error: any) {
    console.error("Error calling Gemini API for title suggestion:", error);
    throw new Error(`Gemini API error for title suggestion: ${error.message || String(error)}`);
  }
};


export const analyzeTextWithGemini = async (text: string): Promise<{ grammarIssues: string[], styleSuggestions: string[] }> => {
  const currentAi = ensureAiInitialized();
   if (!text.trim()) {
    throw new Error("Text is required for analysis.");
  }

  const prompt = `Analyze the following academic text for grammar errors and style improvement suggestions.
  Respond in JSON format with two keys: "grammarIssues" (an array of strings describing grammar errors) and "styleSuggestions" (an array of strings with style improvement suggestions).
  If no issues, return empty arrays.
  Text: "${text}"`;

  try {
    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);
    return {
        grammarIssues: parsedData.grammarIssues || [],
        styleSuggestions: parsedData.styleSuggestions || [],
    };

  } catch (error: any) {
    console.error("Error calling Gemini API for text analysis:", error);
    throw new Error(`Gemini API error for text analysis: ${error.message || String(error)}`);
  }
};


export const suggestJournalsWithGemini = async (title: string, abstract: string, keywords: string[]): Promise<AIJournalSuggestion[]> => {
  const currentAi = ensureAiInitialized();
  if (!title.trim() || !abstract.trim() || keywords.length === 0) {
    throw new Error("Title, abstract, and keywords are required for journal suggestion.");
  }

  const prompt = `Based on the following academic article title, abstract, and keywords, suggest 3 suitable journals for publication.
  For each suggested journal, provide a brief reasoning.
  Return the response as a JSON array, where each object has "id" (a generated unique string like "journal-1"), "name" (string, journal name), and "reasoning" (string).
  Example: [{"id": "journal-1", "name": "Journal of AI Research", "reasoning": "Focuses on cutting-edge AI topics."}, ...]

  Title: "${title}"
  Abstract: "${abstract}"
  Keywords: ${keywords.join(', ')}
  `;

  try {
    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    const parsedData = JSON.parse(jsonStr);
    if (Array.isArray(parsedData)) {
        return parsedData as AIJournalSuggestion[];
    }
    return [];
  } catch (error: any) {
    console.error("Error calling Gemini API for journal suggestion:", error);
    throw new Error(`Gemini API error for journal suggestion: ${error.message || String(error)}`);
  }
};

export const improveAbstractWithGemini = async (currentAbstract: string, title: string, keywords: string[]): Promise<string> => {
  const currentAi = ensureAiInitialized();
   if (!title.trim() || keywords.length === 0) {
    throw new Error("Title and keywords are required for abstract assistance.");
  }
  const promptAction = currentAbstract.trim() 
    ? `Improve the following academic article abstract, making it more concise, impactful, and clear, based on the title and keywords.`
    : `Generate a concise and impactful academic article abstract (around 150-250 words) based on the following title and keywords.`;
  
  const prompt = `${promptAction}
  Title: "${title}"
  Keywords: ${keywords.join(', ')}
  ${currentAbstract.trim() ? `Current Abstract: "${currentAbstract}"` : ''}
  Return only the improved or generated abstract as a single block of text, without any introductory phrases like "Here's an improved abstract:" or "Here is a generated abstract:".
  `;

  try {
    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error: any) {
    console.error("Error calling Gemini API for abstract improvement/generation:", error);
    throw new Error(`Gemini API error for abstract help: ${error.message || String(error)}`);
  }
};

export const analyzeReferencesWithGemini = async (referencesText: string, style: 'APA' | 'MLA' = 'APA'): Promise<AIReferenceCheckSuggestion[]> => {
  const currentAi = ensureAiInitialized();
  if (!referencesText.trim()) {
    throw new Error("Reference text is required for analysis.");
  }

  const prompt = `Analyze the following list of academic references. For each reference, check if it generally conforms to ${style} citation style.
  If a reference seems to have formatting issues or deviations from ${style} style, provide a brief description of the issue and, if possible, a corrected version.
  Return the response as a JSON array of objects. Each object should have "originalReference" (string) and optionally "suggestedCorrection" (string) and "issueDescription" (string).
  If a reference appears correct, you can omit "suggestedCorrection" and "issueDescription" or provide an empty string for "issueDescription".
  Focus on common formatting errors like punctuation, capitalization, order of elements. Do not validate the existence of the DOI or URL.

  References Text:
  """
  ${referencesText}
  """
  `;

  try {
    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    const parsedData = JSON.parse(jsonStr);
     if (Array.isArray(parsedData)) {
        return parsedData as AIReferenceCheckSuggestion[];
    }
    return [];
  } catch (error: any) {
    console.error("Error calling Gemini API for reference analysis:", error);
    throw new Error(`Gemini API error for reference analysis: ${error.message || String(error)}`);
  }
};

export const runPreliminaryPlagiarismCheckMock = async (fileContentSnippet: string): Promise<PlagiarismCheckResult> => {
  console.log("Simulating plagiarism & AI content check for content snippet:", fileContentSnippet.substring(0,100) + "...");
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomSimilarity = Math.floor(Math.random() * 35) + 1; // 1-35%
      const randomAIProb = Math.floor(Math.random() * 70) + 5; // 5-75%
      
      // Mock plagiarism sources
      const mockSources = [
        { source: 'wikipedia.org/some_article', similarity: Math.floor(randomSimilarity * 0.4), details: 'Direct match found in introduction.' },
        { source: 'researchgate.net/another_paper', similarity: Math.floor(randomSimilarity * 0.3), details: 'Paraphrased content in methodology section.' },
        { source: 'internal_database/thesis_xyz', similarity: Math.floor(randomSimilarity * 0.3), details: 'Minor overlap in literature review.' },
      ].filter(s => s.similarity > 0);


      resolve({
        similarityPercentage: randomSimilarity,
        reportUrl: `/mock-plagiarism-report-${Date.now()}.html`, // Keep for backward compatibility if needed
        plagiarismSources: mockSources,
        checkedDate: new Date().toISOString(),
        aiContentProbability: randomAIProb,
        aiContentReportUrl: `/mock-ai-report-${Date.now()}.html`,
      });
    }, 2000);
  });
};

export const checkJournalComplianceWithGemini = async (
  articleContent: string, // Could be abstract or full text snippet
  journalChecklistText: string,
  checklistItems: Omit<JournalChecklistItem, 'isCompleted'>[] // Original checklist items for reference
): Promise<AIComplianceCheckResult> => {
  const currentAi = ensureAiInitialized();
  if (!articleContent.trim() || !journalChecklistText.trim() || checklistItems.length === 0) {
    throw new Error("Article content and a non-empty journal checklist are required for compliance check.");
  }

  const prompt = `
  Analyze the provided academic article content against the given journal submission checklist.
  For each checklist item, determine if the article content appears to meet the requirement.
  Provide a status: 'compliant', 'issues_found', or 'not_enough_info'.
  If 'issues_found', briefly explain the issue and provide a suggestion if possible.
  If 'not_enough_info', explain what additional information or context might be needed from the article.

  Journal Submission Checklist:
  ---
  ${journalChecklistText}
  ---

  Article Content (e.g., abstract, introduction, or relevant sections):
  ---
  ${articleContent}
  ---

  Return the response as a JSON object with two keys:
  1. "reportItems": An array of objects, where each object corresponds to a checklist item and has the following structure:
     { "checklistItemId": "original_id_of_checklist_item", "checklistItemText": "original_text_of_checklist_item", "status": "compliant" | "issues_found" | "not_enough_info", "aiSuggestion": "string (optional suggestion or explanation)" }
  2. "overallAssessment": A brief overall assessment string (e.g., "Largely compliant", "Several issues found needing attention").

  Match checklistItemId from the provided checklist items: ${JSON.stringify(checklistItems.map(item => ({id: item.id, text: item.text})))}
  Ensure every original checklist item is represented in the 'reportItems' array.
  `;

  try {
    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Regex to remove markdown fences
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);

    // Validate and structure the data
    const reportItems: AIComplianceReportItem[] = [];
    if (parsedData.reportItems && Array.isArray(parsedData.reportItems)) {
        parsedData.reportItems.forEach((item: any) => {
            const originalItem = checklistItems.find(ci => ci.id === item.checklistItemId || ci.text === item.checklistItemText);
            if (originalItem) {
                 reportItems.push({
                    checklistItemId: originalItem.id,
                    checklistItemText: originalItem.text, // Use original text
                    isMet: item.status === 'compliant', // Convert status to boolean isMet for consistency
                    status: item.status || 'not_enough_info',
                    aiSuggestion: item.aiSuggestion || undefined,
                });
            }
        });
    }
     // Ensure all original checklist items are covered, even if AI missed some
     checklistItems.forEach(originalItem => {
      if (!reportItems.find(ri => ri.checklistItemId === originalItem.id)) {
        reportItems.push({
          checklistItemId: originalItem.id,
          checklistItemText: originalItem.text,
          isMet: false,
          status: 'not_enough_info',
          aiSuggestion: "AI did not provide specific feedback for this item."
        });
      }
    });


    return {
      checkedDate: new Date().toISOString(),
      reportItems: reportItems,
      overallAssessment: parsedData.overallAssessment || "AI assessment not fully parsed or provided.",
    };

  } catch (error: any) {
    console.error("Error calling Gemini API for journal compliance check:", error);
    throw new Error(`Gemini API error for compliance check: ${error.message || String(error)}`);
  }
};


export const analyzeDocumentLiteracy = async (
  pdfTextContent: string
): Promise<{ report: string; suggestions: string[]; error?: string }> => {
  const currentAi = ensureAiInitialized();
  if (!pdfTextContent.trim()) {
    // This case should be handled by the calling component, but as a safeguard:
    return { report: "", suggestions: [], error: "No text content provided for analysis." };
  }

  const prompt = `You are an expert academic editor. Analyze the following text, supposedly extracted from a PDF document, for literacy issues. Focus on grammar, spelling, punctuation, style, clarity, and overall academic tone.
Provide your feedback in JSON format with two keys:
1. "report": A concise overall assessment of the document's literacy (e.g., "The document is well-written with minor grammatical errors." or "The document requires significant revisions for clarity and style.").
2. "suggestions": An array of strings, where each string is a specific, actionable suggestion for improvement. Include the original problematic phrase if applicable, and then your suggested change or comment. Example: "Original: 'The data indicates that...' Suggestion: 'Consider rephrasing for stronger impact, e.g., 'The data reveals that...' or 'The findings indicate that...'."

Text from PDF:
"""
${pdfTextContent}
"""`;

  try {
    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        temperature: 0,
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    const parsedData = JSON.parse(jsonStr);
    return {
      report: parsedData.report || "AI did not provide a report.",
      suggestions: parsedData.suggestions || [],
    };
  } catch (error: any) {
    console.error("Error calling Gemini API for document literacy analysis:", error);
    return {
      report: "",
      suggestions: [],
      error: `Gemini API error for literacy analysis: ${error.message || String(error)}`,
    };
  }
};

export const transliterateText = async (
  pdfTextContent: string,
  targetScript: 'latin' | 'cyrillic'
): Promise<{ transliteratedText: string; error?: string }> => {
  const currentAi = ensureAiInitialized();
  if (!pdfTextContent.trim()) {
    return { transliteratedText: "", error: "No text content provided for transliteration." };
  }

  const sourceScript = targetScript === 'latin' ? 'Cyrillic' : 'Latin';

  const prompt = `Transliterate the following text, which was supposedly extracted from a PDF document, from ${sourceScript} script to ${targetScript} script.
Preserve the meaning and general formatting (like paragraphs) as much as possible.
Return only the transliterated text. Do not include any introductory phrases or markdown.

Original text:
"""
${pdfTextContent}
"""`;

  try {
    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        temperature: 0,
      }
    });
    return { transliteratedText: response.text.trim() };
  } catch (error: any) {
    console.error("Error calling Gemini API for transliteration:", error);
    return {
      transliteratedText: "",
      error: `Gemini API error for transliteration: ${error.message || String(error)}`,
    };
  }
};
