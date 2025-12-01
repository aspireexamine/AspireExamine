import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const PDFProcessing: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Processing PDF Documents"
      category="Smart Study Hub"
      categoryHref="/help"
      content="The Smart Study Hub can process PDF documents to generate comprehensive study materials. To process a PDF: (1) Go to Smart Study Hub, (2) Select PDF processing option, (3) Upload your PDF file (textbooks, notes, or educational content), (4) Choose what to generate (notes, flashcards, mind maps, practice questions), (5) Click generate and wait for processing. The AI extracts text from the PDF and creates organized study materials. Supported PDFs include textbooks, lecture notes, research papers, and any educational content. The system can handle PDFs with text content and generates various formats based on your needs. This feature saves hours of manual note-taking and helps you create comprehensive study materials from any PDF source."
      relatedArticles={[
        { title: "Extracting content from YouTube videos", href: "/help/study-hub/youtube-extraction" },
        { title: "Generating notes and summaries", href: "/help/study-hub/generating-notes" },
        { title: "Creating flashcards automatically", href: "/help/study-hub/flashcards" }
      ]}
    />
  );
};

export default PDFProcessing;

