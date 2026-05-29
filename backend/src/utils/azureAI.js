/**
 * Azure AI Language — Text Analytics
 * Used to:
 *   1. Auto-detect language of course descriptions
 *   2. Extract key phrases to suggest tags
 *   3. Detect if description content is too short/poor quality
 *
 * SETUP: Add AZURE_TEXT_ANALYTICS_ENDPOINT and AZURE_TEXT_ANALYTICS_KEY to .env
 * Azure Portal → Language Service → Keys and Endpoint
 */

const { TextAnalyticsClient, AzureKeyCredential } = require('@azure/ai-text-analytics');

let textClient = null;

function getTextClient() {
  if (textClient) return textClient;
  const endpoint = process.env.AZURE_TEXT_ANALYTICS_ENDPOINT;
  const key = process.env.AZURE_TEXT_ANALYTICS_KEY;
  if (!endpoint || !key) {
    console.warn('[AzureAI] Text Analytics not configured — AI features disabled.');
    return null;
  }
  textClient = new TextAnalyticsClient(endpoint, new AzureKeyCredential(key));
  return textClient;
}

/**
 * Analyze course description text:
 * Returns { keyPhrases, language, suggestedCategory }
 */
async function analyzeCourseContent(text) {
  const client = getTextClient();
  const defaultResult = { keyPhrases: [], language: 'en', suggestedCategory: null };
  if (!client || !text || text.trim().length < 10) return defaultResult;

  try {
    const documents = [{ id: '1', text: text.slice(0, 5000) }];

    // Run key phrase extraction and language detection in parallel
    const [keyphraseResults, langResults] = await Promise.all([
      client.extractKeyPhrases(documents),
      client.detectLanguage(documents),
    ]);

    const keyPhrases = keyphraseResults[0]?.keyPhrases || [];
    const language = langResults[0]?.primaryLanguage?.iso6391Name || 'en';

    // Rule-based category suggestion from key phrases
    const combined = keyPhrases.join(' ').toLowerCase() + ' ' + text.toLowerCase();
    let suggestedCategory = null;

    const categoryRules = [
      { keywords: ['javascript', 'react', 'node', 'html', 'css', 'web', 'frontend', 'backend', 'express'], category: 'Web Dev' },
      { keywords: ['python', 'java', 'c++', 'programming', 'algorithm', 'data structure', 'object oriented'], category: 'Programming' },
      { keywords: ['machine learning', 'ai', 'deep learning', 'neural', 'tensorflow', 'pytorch', 'data science'], category: 'AI & ML' },
      { keywords: ['mongodb', 'sql', 'database', 'nosql', 'postgres', 'mysql', 'dynamo'], category: 'General' },
      { keywords: ['docker', 'kubernetes', 'devops', 'ci/cd', 'azure', 'aws', 'cloud'], category: 'DevOps' },
      { keywords: ['design', 'ui', 'ux', 'figma', 'photoshop', 'illustration'], category: 'Design' },
    ];

    for (const rule of categoryRules) {
      if (rule.keywords.some(kw => combined.includes(kw))) {
        suggestedCategory = rule.category;
        break;
      }
    }

    console.log(`[AzureAI] Key phrases extracted: [${keyPhrases.slice(0, 5).join(', ')}] | Language: ${language} | Suggested category: ${suggestedCategory || 'none'}`);
    return { keyPhrases, language, suggestedCategory };
  } catch (err) {
    console.error('[AzureAI] Text Analytics error:', err.message);
    return defaultResult;
  }
}

module.exports = { analyzeCourseContent };
