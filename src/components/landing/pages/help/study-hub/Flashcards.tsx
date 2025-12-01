import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const Flashcards: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Creating Flashcards Automatically"
      category="Smart Study Hub"
      categoryHref="/help"
      content="Flashcards are an effective way to memorize key concepts and facts. The Smart Study Hub can automatically generate question-answer flashcards from any content source. Generated flashcards include: (1) Clear questions based on important concepts, (2) Concise answers for quick revision, (3) Organized by topics, (4) Perfect for spaced repetition learning. You can generate flashcards from YouTube videos, PDF documents, or text content. The AI identifies key concepts and creates question-answer pairs automatically. Flashcards are saved to your library where you can review them anytime. This feature is especially useful for memorizing formulas, definitions, important facts, and key concepts for competitive exams."
      relatedArticles={[
        { title: "Extracting content from YouTube videos", href: "/help/study-hub/youtube-extraction" },
        { title: "Generating notes and summaries", href: "/help/study-hub/generating-notes" },
        { title: "Organizing your study library", href: "/help/study-hub/library-organization" }
      ]}
    />
  );
};

export default Flashcards;

