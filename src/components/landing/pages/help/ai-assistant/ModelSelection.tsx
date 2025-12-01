import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const ModelSelection: React.FC = () => {
  return (
    <PlaceholderArticle
      title="AI Model Selection (Gemini, Groq, OpenRouter)"
      category="AI Assistant"
      categoryHref="/help"
      content="AspireExamine uses multiple AI models to provide the best possible assistance. The system supports: (1) Google Gemini - Advanced AI for comprehensive explanations, (2) Groq - Fast response times for quick queries, (3) OpenRouter - Access to various AI models. The system automatically selects the best available model and uses fallback mechanisms if one fails. This ensures you always get responses even if one service is unavailable. The AI models are configured by administrators and work seamlessly in the background. You don't need to manually select a model - the system chooses the optimal one based on availability and performance. All models provide high-quality educational assistance tailored for exam preparation."
      relatedArticles={[
        { title: "How to use the AI Assistant", href: "/help/ai-assistant/getting-started" },
        { title: "Asking questions and getting help", href: "/help/ai-assistant/asking-questions" }
      ]}
    />
  );
};

export default ModelSelection;

