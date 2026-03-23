/**
 * Example AI service — demonstrates proper error handling.
 *
 * IMPORTANT: This is an EXAMPLE file showing best practices.
 * You can use this as a reference when creating your own AI services.
 *
 * Key rules:
 * 1. ALWAYS propagate errors to the caller — never silently swallow them
 * 2. Let the route/controller decide how to handle failures
 * 3. DO NOT return fallback messages that hide AI failures
 */

import { openai, DEPLOYMENT } from '../ai-client.js';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Get a chat completion from Azure OpenAI.
 *
 * @param messages - The conversation history
 * @param options - Optional parameters
 * @throws Error if the API call fails — this is INTENTIONAL
 *
 * ⚠️ DO NOT catch errors here and return fallback messages.
 * ⚠️ Let the caller handle errors appropriately.
 */
export async function getChatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: DEPLOYMENT,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response content from AI');
  }

  return content.trim();
}

/**
 * Stream a chat completion using Server-Sent Events.
 *
 * @param messages - The conversation history
 * @param onChunk - Callback for each streamed chunk
 * @throws Error if the API call fails
 */
export async function streamChatCompletion(
  messages: ChatMessage[],
  onChunk: (content: string) => void
): Promise<void> {
  const stream = await openai.chat.completions.create({
    model: DEPLOYMENT,
    messages,
    temperature: 0.7,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      onChunk(content);
    }
  }
}

