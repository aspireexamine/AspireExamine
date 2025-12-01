import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const Attachments: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Using Attachments and Images"
      category="AI Assistant"
      categoryHref="/help"
      content="The AI Assistant supports image and document attachments to help with visual questions and problems. You can: (1) Upload images of problems, diagrams, or questions, (2) Attach documents for analysis, (3) Get step-by-step solutions for image-based questions, (4) Ask questions about diagrams or figures. To use attachments, click the attachment icon in the chat input, select your image or file, and ask your question. The AI will analyze the image and provide detailed explanations. This is especially useful for: solving physics problems with diagrams, understanding chemical structures, analyzing mathematical equations, and getting help with complex visual concepts."
      relatedArticles={[
        { title: "How to use the AI Assistant", href: "/help/ai-assistant/getting-started" },
        { title: "Asking questions and getting help", href: "/help/ai-assistant/asking-questions" }
      ]}
    />
  );
};

export default Attachments;

