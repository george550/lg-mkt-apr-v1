import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('Missing required environment variable: ANTHROPIC_API_KEY');
}

// The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate a summary of text using Claude
 * 
 * @param text The text to summarize
 * @returns A summarized version of the text
 */
export async function summarizeText(text: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1024,
      messages: [
        { 
          role: 'user', 
          content: `Please summarize the following text concisely while maintaining key points:\n\n${text}` 
        }
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    
    throw new Error('Unexpected response format from Claude');
  } catch (error: any) {
    console.error('Error summarizing text with Claude:', error);
    throw new Error(`Failed to summarize text: ${error.message}`);
  }
}

/**
 * Analyze sentiment of a text using Claude
 * 
 * @param text The text to analyze
 * @returns An object containing sentiment and confidence
 */
export async function analyzeSentiment(text: string): Promise<{ sentiment: string, confidence: number }> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      system: `You're a Customer Insights AI. Analyze this feedback and output in JSON format with keys: "sentiment" (positive/negative/neutral) and "confidence" (number, 0 through 1).`,
      max_tokens: 1024,
      messages: [
        { role: 'user', content: text }
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }
    
    const result = JSON.parse(content.text);
    return {
      sentiment: result.sentiment,
      confidence: Math.max(0, Math.min(1, result.confidence))
    };
  } catch (error: any) {
    console.error('Error analyzing sentiment with Claude:', error);
    throw new Error(`Failed to analyze sentiment: ${error.message}`);
  }
}

/**
 * Generates an AI-enhanced description for a listing
 * 
 * @param title The title of the listing
 * @param description The basic description
 * @param tags The tags associated with the listing
 * @returns An enhanced, SEO-friendly description
 */
export async function enhanceListingDescription(
  title: string, 
  description: string, 
  tags: string[] = []
): Promise<string> {
  try {
    const prompt = `
    Please enhance the following listing description for a code template marketplace:
    
    Title: ${title}
    Original Description: ${description}
    Tags: ${tags.join(', ')}
    
    Create a more detailed, SEO-friendly description that:
    1. Highlights the key features
    2. Explains the benefits for developers
    3. Mentions the technologies used (based on the tags)
    4. Uses professional language
    5. Is between 150-300 words
    
    Return only the enhanced description text without any additional comments.
    `;
    
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }
    
    return content.text.trim();
  } catch (error: any) {
    console.error('Error enhancing listing description with Claude:', error);
    throw new Error(`Failed to enhance listing description: ${error.message}`);
  }
}

export default {
  summarizeText,
  analyzeSentiment,
  enhanceListingDescription,
  client: anthropic
};