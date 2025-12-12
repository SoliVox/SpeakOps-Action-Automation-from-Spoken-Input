// LLM integration utilities
import OpenAI from "openai";

let openaiClient = null;

/**
 * Initialize OpenAI client (lazy loading)
 */
function getOpenAIClient() {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

/**
 * Call OpenAI Chat API
 * @param {string} prompt - The prompt to send
 * @param {Object} options - Additional options
 * @returns {Promise<string>} The LLM response
 */
export async function callOpenAI(prompt, options = {}) {
  const client = getOpenAIClient();
  
  if (!client) {
    console.warn("OpenAI API key not configured, returning mock response");
    return generateMockResponse(prompt);
  }

  try {
    const completion = await client.chat.completions.create({
      model: options.model || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: options.systemPrompt || "You are a helpful assistant that processes voice notes into structured content.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error.message);
    throw new Error(`LLM processing failed: ${error.message}`);
  }
}

/**
 * Generate mock response when API key is not configured
 */
function generateMockResponse(prompt) {
  const length = Math.min(prompt.length, 200);
  return `Mock LLM Response: Processing "${prompt.slice(0, length)}..."\n\nThis is a placeholder response. Configure OPENAI_API_KEY in .env to enable real LLM processing.`;
}

/**
 * Check if LLM is configured
 */
export function isLLMConfigured() {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Parse JSON from LLM response (handles markdown code blocks)
 */
export function parseJSONFromLLM(text) {
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch {
    // Extract from markdown code block
    const match = text.match(/```(?:json)?\s*(\[[\s\S]*?\]|\{[\s\S]*?\})\s*```/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {
        return null;
      }
    }
    return null;
  }
}
