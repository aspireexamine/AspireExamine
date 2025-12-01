import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const AskingQuestions: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Asking Questions and Getting Help"
      category="AI Assistant"
      categoryHref="/help"
      content="The AI Assistant can help with a wide variety of study-related questions. You can ask: (1) Concept explanations - 'Explain photosynthesis in detail', (2) Problem solving - 'Solve this physics problem: [paste problem]', (3) Study guidance - 'How should I prepare for NEET Chemistry?', (4) Formula queries - 'What are the important formulas for JEE Main Physics?', (5) Comparison questions - 'What's the difference between mitosis and meiosis?', (6) Step-by-step solutions for complex problems. For best results, be specific in your questions, provide context when needed, and use the suggested actions to discover what the AI can help with. You can also upload images of problems or questions for visual analysis."
      relatedArticles={[
        { title: "How to use the AI Assistant", href: "/help/ai-assistant/getting-started" },
        { title: "Using attachments and images", href: "/help/ai-assistant/attachments" },
        { title: "Suggested actions and prompts", href: "/help/ai-assistant/suggested-actions" }
      ]}
    />
  );
};

export default AskingQuestions;

