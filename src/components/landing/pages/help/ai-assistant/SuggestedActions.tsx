import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const SuggestedActions: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Suggested Actions and Prompts"
      category="AI Assistant"
      categoryHref="/help"
      content="The AI Assistant provides suggested actions to help you get started quickly. These pre-made prompts include: (1) 'Explain a concept' - Get detailed explanations, (2) 'Solve a problem' - Step-by-step solutions, (3) 'Generate notes' - Create study materials, (4) 'Create flashcards' - Generate Q&A pairs, (5) 'Summarize content' - Get concise summaries, (6) 'Practice questions' - Generate test questions, (7) 'Study plan' - Get personalized guidance, (8) 'Formula list' - Access important formulas. Clicking on any suggested action automatically fills the chat input with that prompt, making it easy to start conversations. These suggestions help you discover the full capabilities of the AI Assistant and save time typing common queries."
      relatedArticles={[
        { title: "How to use the AI Assistant", href: "/help/ai-assistant/getting-started" },
        { title: "Asking questions and getting help", href: "/help/ai-assistant/asking-questions" }
      ]}
    />
  );
};

export default SuggestedActions;

