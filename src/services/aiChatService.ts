import { getAIProviderKeys } from '@/lib/supabaseQueries';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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

  private async tryGemini(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    const keys = await this.getAPIKeys();
    const key = keys.google;
    if (!key) throw new Error('Gemini API key not configured');

    // Convert conversation history to Gemini format
    const contents = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
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

  private async tryGroq(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    const keys = await this.getAPIKeys();
    const key = keys.groq;
    if (!key) throw new Error('Groq API key not configured');

    // Convert conversation history to OpenAI format
    const messages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
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

  private async tryOpenRouter(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    const keys = await this.getAPIKeys();
    const key = keys.openrouter;
    if (!key) throw new Error('OpenRouter API key not configured');

    // Convert conversation history to OpenAI format
    const messages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add current message
    messages.push({
      role: 'user',
      content: message
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

  async sendMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    const errors: string[] = [];

    // Try providers in order of preference
    const providers = [
      { name: 'Gemini', fn: () => this.tryGemini(message, conversationHistory) },
      { name: 'Groq', fn: () => this.tryGroq(message, conversationHistory) },
      { name: 'OpenRouter', fn: () => this.tryOpenRouter(message, conversationHistory) }
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

  async *sendMessageStream(message: string, conversationHistory: ChatMessage[] = []): AsyncGenerator<string, void, unknown> {
    const keys = await this.getAPIKeys();
    
    // Try streaming with Groq first (best streaming support)
    if (keys.groq) {
      try {
        yield* this.tryGroqStream(message, conversationHistory);
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

  private async *tryGroqStream(message: string, conversationHistory: ChatMessage[] = []): AsyncGenerator<string, void, unknown> {
    const keys = await this.getAPIKeys();
    const key = keys.groq;
    if (!key) throw new Error('Groq API key not configured');

    // Convert conversation history to OpenAI format
    const messages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: true
      })
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

  generateChatTitle(firstMessage: string): string {
    // Simple title generation based on first message
    const words = firstMessage.split(' ').slice(0, 6);
    return words.join(' ').replace(/[^\w\s]/g, '') || 'New Chat';
  }
}

export const aiChatService = new AIChatService();
