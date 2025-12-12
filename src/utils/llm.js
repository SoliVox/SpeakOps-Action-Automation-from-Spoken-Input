// This handles all the GPT-4 API calls
import OpenAI from "openai";

let openaiClient = null;

/**
 * Creates the OpenAI client when we first need it
 * No point initializing it if we don't have an API key
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
 * Sends a prompt to GPT-4 and gets back the response
 * Falls back to mock responses if the API key isn't configured
 * Using gpt-4o-mini by default since it's fast and cheap
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
