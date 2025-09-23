export interface Model {
  id: string;
  label: string;
  description?: string;
  maxTokens?: number;
  supportsImages?: boolean;
  supportsAudio?: boolean;
  supportsDocuments?: boolean;
}

export interface ProviderAdapter {
  id: string;
  displayName: string;
  models: Model[];
  needsKey: boolean;
  apiKeyName?: string;
}

// Mock providers for now - in a real implementation, these would be actual AI providers
export const mockProviders: ProviderAdapter[] = [
  {
    id: 'openai',
    displayName: 'OpenAI',
    needsKey: true,
    apiKeyName: 'OPENAI_API_KEY',
    models: [
      {
        id: 'gpt-4',
        label: 'GPT-4',
        description: 'Most capable model',
        maxTokens: 8192,
        supportsImages: false,
      },
      {
        id: 'gpt-3.5-turbo',
        label: 'GPT-3.5 Turbo',
        description: 'Fast and efficient',
        maxTokens: 4096,
        supportsImages: false,
      },
    ],
  },
  {
    id: 'anthropic',
    displayName: 'Anthropic',
    needsKey: true,
    apiKeyName: 'ANTHROPIC_API_KEY',
    models: [
      {
        id: 'claude-3-opus',
        label: 'Claude 3 Opus',
        description: 'Most powerful Claude model',
        maxTokens: 200000,
        supportsImages: true,
      },
      {
        id: 'claude-3-sonnet',
        label: 'Claude 3 Sonnet',
        description: 'Balanced performance',
        maxTokens: 200000,
        supportsImages: true,
      },
    ],
  },
  {
    id: 'groq',
    displayName: 'Groq',
    needsKey: true,
    apiKeyName: 'GROQ_API_KEY',
    models: [
      {
        id: 'groq/compound',
        label: 'Groq Compound',
        description: 'AI system with built-in tools, web search, and code execution',
        maxTokens: 8192,
        supportsImages: true,
        supportsDocuments: true,
      },
      {
        id: 'groq/compound-mini',
        label: 'Groq Compound Mini',
        description: 'Lightweight version of Groq Compound',
        maxTokens: 8192,
        supportsImages: true,
        supportsDocuments: true,
      },
      {
        id: 'llama-3.1-8b-instant',
        label: 'Llama 3.1 8B Instant',
        description: 'Fast and efficient text generation',
        maxTokens: 131072,
        supportsImages: false,
        supportsDocuments: false,
      },
      {
        id: 'llama-3.3-70b-versatile',
        label: 'Llama 3.3 70B Versatile',
        description: 'High-quality text generation',
        maxTokens: 32768,
        supportsImages: false,
        supportsDocuments: false,
      },
    ],
  },
];
