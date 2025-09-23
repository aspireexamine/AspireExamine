export const MAX_FILE_COUNT = 10;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileCategory(mimeType: string): 'image' | 'text' | 'document' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('text/')) return 'text';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word')) return 'document';
  return 'other';
}

// AI Model capabilities based on research
export const MODEL_CAPABILITIES = {
  'gemini': {
    supportsImages: true,
    supportsDocuments: true,
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    supportedDocumentTypes: ['application/pdf', 'text/plain', 'text/markdown', 'text/csv', 'application/json'],
    maxImageSize: 20 * 1024 * 1024, // 20MB
    maxDocumentSize: 10 * 1024 * 1024, // 10MB
  },
  'openrouter': {
    supportsImages: true,
    supportsDocuments: false, // Most OpenRouter models don't support document uploads directly
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    supportedDocumentTypes: [],
    maxImageSize: 10 * 1024 * 1024, // 10MB
    maxDocumentSize: 0,
  },
  'groq': {
    supportsImages: true, // Groq now supports multimodal capabilities
    supportsDocuments: true, // Groq Compound and some models support file inputs
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    supportedDocumentTypes: ['application/pdf', 'text/plain', 'text/markdown', 'text/csv', 'application/json'],
    maxImageSize: 20 * 1024 * 1024, // 20MB based on some models in the docs
    maxDocumentSize: 20 * 1024 * 1024, // 20MB based on some models in the docs
  }
} as const;

export function getModelCapabilities(modelId: string) {
  // Map model IDs to their capabilities
  if (modelId.includes('gemini')) return MODEL_CAPABILITIES.gemini;
  if (modelId.includes('openrouter') || modelId.includes('gpt-4') || modelId.includes('claude')) return MODEL_CAPABILITIES.openrouter;
  
  // Groq models - only Compound systems support file inputs
  if (modelId.includes('groq/compound') || modelId.includes('compound')) return MODEL_CAPABILITIES.groq;
  
  // Other Groq models (Llama variants) don't support file inputs
  if (modelId.includes('groq') || modelId.includes('llama')) {
    return {
      supportsImages: false,
      supportsDocuments: false,
      supportedImageTypes: [],
      supportedDocumentTypes: [],
      maxImageSize: 0,
      maxDocumentSize: 0,
    };
  }
  
  // Default to most restrictive capabilities
  return MODEL_CAPABILITIES.groq;
}

export function validateFileForModel(file: File, modelId: string): { valid: boolean; error?: string } {
  const capabilities = getModelCapabilities(modelId);
  const fileCategory = getFileCategory(file.type);
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit` };
  }
  
  // Check if model supports the file category
  if (fileCategory === 'image' && !capabilities.supportsImages) {
    return { 
      valid: false, 
      error: `This model (${modelId}) does not support image files. Please use a different model or remove the image.` 
    };
  }
  
  if (fileCategory === 'document' && !capabilities.supportsDocuments) {
    return { 
      valid: false, 
      error: `This model (${modelId}) does not support document files. Please use a different model or remove the document.` 
    };
  }
  
  // Check specific file type support
  if (fileCategory === 'image' && !capabilities.supportedImageTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `This model does not support ${file.type} images. Supported formats: ${capabilities.supportedImageTypes.join(', ')}` 
    };
  }
  
  if (fileCategory === 'document' && !capabilities.supportedDocumentTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `This model does not support ${file.type} documents. Supported formats: ${capabilities.supportedDocumentTypes.join(', ')}` 
    };
  }
  
  // Check size limits for specific categories
  if (fileCategory === 'image' && file.size > capabilities.maxImageSize) {
    return { 
      valid: false, 
      error: `Image size exceeds ${formatFileSize(capabilities.maxImageSize)} limit for this model` 
    };
  }
  
  if (fileCategory === 'document' && file.size > capabilities.maxDocumentSize) {
    return { 
      valid: false, 
      error: `Document size exceeds ${formatFileSize(capabilities.maxDocumentSize)} limit for this model` 
    };
  }
  
  return { valid: true };
}

// Legacy function for backward compatibility
export function validateFile(file: File): { valid: boolean; error?: string } {
  return validateFileForModel(file, 'gemini'); // Default to most permissive model
}
