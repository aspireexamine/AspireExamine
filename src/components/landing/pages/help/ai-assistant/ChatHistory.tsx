import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const ChatHistory: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Chat History and Session Management"
      category="AI Assistant"
      categoryHref="/help"
      content="All your AI Assistant conversations are automatically saved to your chat history. You can access your chat history by clicking the 'History' button (usually in the top-left corner of the AI Assistant interface). Your chat history shows: (1) All previous conversation sessions with auto-generated titles, (2) Search functionality to find specific conversations, (3) Option to load any previous conversation, (4) Ability to delete old conversations, (5) Timestamps for each session. Chat sessions are stored locally in your browser and persist across sessions. You can create new chat sessions anytime, and each session maintains its own conversation context. This helps you track your learning progress and revisit important explanations."
      relatedArticles={[
        { title: "How to use the AI Assistant", href: "/help/ai-assistant/getting-started" },
        { title: "Asking questions and getting help", href: "/help/ai-assistant/asking-questions" }
      ]}
    />
  );
};

export default ChatHistory;

