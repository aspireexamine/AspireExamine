import { getAIProviderKeys } from '@/lib/supabaseQueries';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: string[]; // File IDs
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

class AIChatService {
  private async getAPIKeys() {
    try {
      const keys = await getAIProviderKeys();
      return {
        google: keys.google_gemini_key,
        openrouter: keys.openrouter_key,
        groq: keys.groq_key
      };
    } catch (error) {
      console.error('Failed to get API keys:', error);
      return { google: null, openrouter: null, groq: null };
    }
  }

  private async tryGemini(message: string, conversationHistory: ChatMessage[] = [], attachmentIds: string[] = []): Promise<string> {
    const keys = await this.getAPIKeys();
    const key = keys.google;
    if (!key) throw new Error('Gemini API key not configured');

    // Convert conversation history to Gemini format
    const contents = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Add current message with attachments
    const parts: any[] = [{ text: message }];
    
    // Add file attachments if any
    if (attachmentIds.length > 0) {
      for (const fileId of attachmentIds) {
        const fileData = sessionStorage.getItem(`file_${fileId}`);
        if (fileData) {
          const parsed = JSON.parse(fileData);
          if (parsed.type === 'image') {
            // Add image to Gemini request
            parts.push({
              inline_data: {
                mime_type: parsed.mimeType,
                data: parsed.data.split(',')[1] // Remove data:image/...;base64, prefix
              }
            });
          } else if (parsed.type === 'pdf' || parsed.type === 'text') {
            // For text content, append to the message
            parts[0].text += `\n\n[File: ${parsed.name}]\n${parsed.content}`;
          }
        }
      }
    }
    
    contents.push({
      role: 'user',
      parts: parts
    });

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
      method: 'POST',
      headers: {
        'x-goog-api-key': key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    
    if (!text) {
      throw new Error('No response from Gemini API');
    }

    return text;
  }

  private async tryGroq(message: string, conversationHistory: ChatMessage[] = [], attachmentIds: string[] = []): Promise<string> {
    const keys = await this.getAPIKeys();
    const key = keys.groq;
    if (!key) throw new Error('Groq API key not configured');

    // Convert conversation history to OpenAI format
    const messages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add current message with attachments
    const messageParts: any[] = [{ type: 'text', text: message }];
    
    // Add file attachments if any
    if (attachmentIds.length > 0) {
      for (const fileId of attachmentIds) {
        const fileData = sessionStorage.getItem(`file_${fileId}`);
        if (fileData) {
          const parsed = JSON.parse(fileData);
          if (parsed.type === 'pdf' || parsed.type === 'text') {
            messageParts[0].text += `\n\n[File: ${parsed.name}]\n${parsed.content}`;
          } else if (parsed.type === 'image') {
            // For Groq Compound, add image as a separate part
            messageParts.push({
              type: 'image_url',
              image_url: {
                url: parsed.data
              }
            });
          }
        }
      }
    }

    messages.push({
      role: 'user',
      content: messageParts
    });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const text = result?.choices?.[0]?.message?.content ?? '';
    
    if (!text) {
      throw new Error('No response from Groq API');
    }

    return text;
  }

  private async tryOpenRouter(message: string, conversationHistory: ChatMessage[] = [], attachmentIds: string[] = []): Promise<string> {
    const keys = await this.getAPIKeys();
    const key = keys.openrouter;
    if (!key) throw new Error('OpenRouter API key not configured');

    // Convert conversation history to OpenAI format
    const messages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add current message with attachments
    let messageContent = message;
    
    // Add file attachments if any (as text for non-multimodal models)
    if (attachmentIds.length > 0) {
      for (const fileId of attachmentIds) {
        const fileData = sessionStorage.getItem(`file_${fileId}`);
        if (fileData) {
          const parsed = JSON.parse(fileData);
          if (parsed.type === 'pdf' || parsed.type === 'text') {
            messageContent += `\n\n[File: ${parsed.name}]\n${parsed.content}`;
          } else if (parsed.type === 'image') {
            messageContent += `\n\n[Image: ${parsed.name} - This model cannot process images directly]`;
          }
        }
      }
    }

    messages.push({
      role: 'user',
      content: messageContent
    });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AspireExamine AI Assistant'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const text = result?.choices?.[0]?.message?.content ?? '';
    
    if (!text) {
      throw new Error('No response from OpenRouter API');
    }

    return text;
  }

  async sendMessage(message: string, conversationHistory: ChatMessage[] = [], attachmentIds: string[] = []): Promise<string> {
    const errors: string[] = [];

    // Try providers in order of preference
    const providers = [
      { name: 'Gemini', fn: () => this.tryGemini(message, conversationHistory, attachmentIds) },
      { name: 'Groq', fn: () => this.tryGroq(message, conversationHistory, attachmentIds) },
      { name: 'OpenRouter', fn: () => this.tryOpenRouter(message, conversationHistory, attachmentIds) }
    ];

    for (const provider of providers) {
      try {
        const response = await provider.fn();
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${provider.name}: ${errorMessage}`);
        console.warn(`Failed to use ${provider.name}:`, error);
      }
    }

    // If all providers fail, throw a comprehensive error
    throw new Error(`All AI providers failed. Errors: ${errors.join('; ')}`);
  }

  async *sendMessageStream(message: string, conversationHistory: ChatMessage[] = [], attachmentIds: string[] = [], abortSignal?: AbortSignal): AsyncGenerator<string, void, unknown> {
    const keys = await this.getAPIKeys();
    
    // Try streaming with Groq first (best streaming support)
    if (keys.groq) {
      try {
        yield* this.tryGroqStream(message, conversationHistory, attachmentIds, abortSignal);
        return;
      } catch (error) {
        console.warn('Groq streaming failed, falling back to regular response:', error);
      }
    }

    // Fallback to regular response and simulate streaming
    try {
      const response = await this.sendMessage(message, conversationHistory);
      // Simulate streaming by yielding chunks
      const words = response.split(' ');
      for (let i = 0; i < words.length; i++) {
        const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
        yield chunk;
        // Add small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    } catch (error) {
      throw error;
    }
  }

  private async *tryGroqStream(message: string, conversationHistory: ChatMessage[] = [], attachmentIds: string[] = [], abortSignal?: AbortSignal): AsyncGenerator<string, void, unknown> {
    const keys = await this.getAPIKeys();
    const key = keys.groq;
    if (!key) throw new Error('Groq API key not configured');

    // Convert conversation history to OpenAI format
    const messages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add current message with attachments
    const messageParts: any[] = [{ type: 'text', text: message }];
    
    // Add file attachments if any
    if (attachmentIds.length > 0) {
      for (const fileId of attachmentIds) {
        const fileData = sessionStorage.getItem(`file_${fileId}`);
        if (fileData) {
          const parsed = JSON.parse(fileData);
          if (parsed.type === 'pdf' || parsed.type === 'text') {
            messageParts[0].text += `\n\n[File: ${parsed.name}]\n${parsed.content}`;
          } else if (parsed.type === 'image') {
            // For Groq Compound, add image as a separate part
            messageParts.push({
              type: 'image_url',
              image_url: {
                url: parsed.data
              }
            });
          }
        }
      }
    }

    messages.push({
      role: 'user',
      content: messageParts
    });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: true
      }),
      signal: abortSignal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                // console.log('Groq streaming chunk:', content);
                yield content;
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async enhancePrompt(prompt: string): Promise<string> {
    const enhancementPrompt = `Please enhance the following text by correcting grammatical mistakes and improving readability. Do NOT add extra content, details, or change the meaning. Only fix grammar, spelling, and sentence structure to make it clearer and more readable. Return only the enhanced text without any explanations or additional commentary.

Original text: "${prompt}"`;

    const errors: string[] = [];

    // Try providers in order of preference
    const providers = [
      { name: 'Gemini', fn: () => this.tryGeminiEnhancement(enhancementPrompt) },
      { name: 'Groq', fn: () => this.tryGroqEnhancement(enhancementPrompt) },
      { name: 'OpenRouter', fn: () => this.tryOpenRouterEnhancement(enhancementPrompt) }
    ];

    for (const provider of providers) {
      try {
        const response = await provider.fn();
        return response.trim();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${provider.name}: ${errorMessage}`);
        console.warn(`Failed to use ${provider.name} for enhancement:`, error);
      }
    }

    // If all providers fail, throw a comprehensive error
    throw new Error(`All AI providers failed for enhancement. Errors: ${errors.join('; ')}`);
  }

  private async tryGeminiEnhancement(prompt: string): Promise<string> {
    const keys = await this.getAPIKeys();
    const key = keys.google;
    if (!key) throw new Error('Gemini API key not configured');

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
      method: 'POST',
      headers: {
        'x-goog-api-key': key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more consistent enhancement
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 512,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    
    if (!text) {
      throw new Error('No response from Gemini API');
    }

    return text;
  }

  private async tryGroqEnhancement(prompt: string): Promise<string> {
    const keys = await this.getAPIKeys();
    const key = keys.groq;
    if (!key) throw new Error('Groq API key not configured');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.3, // Lower temperature for more consistent enhancement
        max_tokens: 512,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const text = result?.choices?.[0]?.message?.content ?? '';
    
    if (!text) {
      throw new Error('No response from Groq API');
    }

    return text;
  }

  private async tryOpenRouterEnhancement(prompt: string): Promise<string> {
    const keys = await this.getAPIKeys();
    const key = keys.openrouter;
    if (!key) throw new Error('OpenRouter API key not configured');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AspireExamine AI Assistant'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.3, // Lower temperature for more consistent enhancement
        max_tokens: 512,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const text = result?.choices?.[0]?.message?.content ?? '';
    
    if (!text) {
      throw new Error('No response from OpenRouter API');
    }

    return text;
  }

  generateChatTitle(firstMessage: string): string {
    // Generate a clean title based on first message
    const words = firstMessage.split(' ').slice(0, 6);
    let baseTitle = words.join(' ').replace(/[^\w\s]/g, '') || 'New Chat';
    
    // Clean up the title and capitalize first letter
    baseTitle = baseTitle.trim();
    if (baseTitle.length > 0) {
      baseTitle = baseTitle.charAt(0).toUpperCase() + baseTitle.slice(1);
    }
    
    return baseTitle;
  }
}

export const aiChatService = new AIChatService();
