import React from 'react';
import { HelpArticle } from '../HelpArticle';

const GettingStarted: React.FC = () => {
  return (
    <HelpArticle
      title="How to Use the AI Assistant"
      category="AI Assistant"
      categoryHref="/help"
      relatedArticles={[
        { title: "Chat history and session management", href: "/help/ai-assistant/chat-history" },
        { title: "Asking questions and getting help", href: "/help/ai-assistant/asking-questions" },
        { title: "AI model selection", href: "/help/ai-assistant/model-selection" }
      ]}
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">What is the AI Assistant?</h2>
          <p className="mb-4">
            The AspireExamine AI Assistant is your intelligent study companion powered by advanced AI models (Gemini, Groq, and OpenRouter). It helps you with:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Answering study questions and explaining concepts</li>
            <li>Solving problems step-by-step</li>
            <li>Generating study materials and notes</li>
            <li>Providing personalized learning guidance</li>
            <li>Helping with exam preparation strategies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Accessing the AI Assistant</h2>
          <ol className="list-decimal list-inside space-y-3 ml-2">
            <li>
              <strong>Navigate to AI Assistant</strong>
              <p className="text-sm mt-1 ml-4">From your student dashboard, click on "AI Assistant" in the sidebar navigation.</p>
            </li>
            <li>
              <strong>View the Interface</strong>
              <p className="text-sm mt-1 ml-4">You'll see a chat interface similar to Notion AI, with suggested actions to help you get started.</p>
            </li>
            <li>
              <strong>Start a Conversation</strong>
              <p className="text-sm mt-1 ml-4">Type your question in the input box at the bottom and press Enter or click Send.</p>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Key Features</h2>
          <div className="space-y-4">
            <div className="bg-pastel-lilac/20 p-4 rounded-xl border border-pastel-lilac/30">
              <h3 className="font-bold text-pastel-dark mb-2">Multiple AI Models</h3>
              <p className="text-sm">The AI Assistant automatically uses the best available AI model (Gemini, Groq, or OpenRouter) with automatic fallback if one fails.</p>
            </div>
            <div className="bg-pastel-green/20 p-4 rounded-xl border border-pastel-green/30">
              <h3 className="font-bold text-pastel-dark mb-2">Chat History</h3>
              <p className="text-sm">All your conversations are saved automatically. Access your chat history anytime to review previous discussions.</p>
            </div>
            <div className="bg-pastel-yellow/20 p-4 rounded-xl border border-pastel-yellow/30">
              <h3 className="font-bold text-pastel-dark mb-2">Suggested Actions</h3>
              <p className="text-sm">Get started quickly with pre-made prompts like "Explain a concept", "Solve a problem", "Generate notes", etc.</p>
            </div>
            <div className="bg-pastel-pink/20 p-4 rounded-xl border border-pastel-pink/30">
              <h3 className="font-bold text-pastel-dark mb-2">Attachments</h3>
              <p className="text-sm">Upload images or documents to get help with specific questions or content.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Example Questions You Can Ask</h2>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>"Explain the concept of photosynthesis in detail"</li>
            <li>"Solve this physics problem: [paste problem]"</li>
            <li>"Generate study notes for organic chemistry reactions"</li>
            <li>"What are the important formulas for JEE Main physics?"</li>
            <li>"Help me understand the difference between mitosis and meiosis"</li>
            <li>"Create flashcards for periodic table elements"</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Tips for Best Results</h2>
          <div className="bg-pastel-purple/10 p-4 rounded-xl border border-pastel-purple/20">
            <ul className="space-y-2 text-sm">
              <li>✓ Be specific in your questions for more accurate answers</li>
              <li>✓ Use the suggested actions to discover what the AI can do</li>
              <li>✓ Review your chat history to track your learning progress</li>
              <li>✓ Upload images of problems for step-by-step solutions</li>
              <li>✓ Ask follow-up questions to dive deeper into topics</li>
            </ul>
          </div>
        </section>
      </div>
    </HelpArticle>
  );
};

export default GettingStarted;

