import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const MindMaps: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Generating Mind Maps"
      category="Smart Study Hub"
      categoryHref="/help"
      content="Mind maps are visual representations that show relationships between concepts. The Smart Study Hub can generate mind maps from any content source, helping you visualize and understand complex topics. Generated mind maps include: (1) Central topic or concept, (2) Branching subtopics and related ideas, (3) Visual connections between concepts, (4) Hierarchical organization of information, (5) Easy-to-understand visual format. Mind maps are perfect for: understanding relationships between concepts, reviewing complex topics, visual learners, exam revision, and comprehensive topic overview. You can generate mind maps from YouTube videos, PDFs, or text content. The AI analyzes the content structure and creates visual mind maps that help you see the big picture and understand how different concepts relate to each other."
      relatedArticles={[
        { title: "Extracting content from YouTube videos", href: "/help/study-hub/youtube-extraction" },
        { title: "Generating notes and summaries", href: "/help/study-hub/generating-notes" },
        { title: "Creating practice questions from content", href: "/help/study-hub/practice-questions" }
      ]}
    />
  );
};

export default MindMaps;

