import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const GeneratingNotes: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Generating Notes and Summaries"
      category="Smart Study Hub"
      categoryHref="/help"
      content="The Smart Study Hub can automatically generate well-organized study notes and summaries from any source (YouTube videos, PDFs, or text). Generated notes include: (1) Clear headings and subheadings, (2) Bullet points for key concepts, (3) Important definitions highlighted, (4) Organized by topics and subtopics, (5) Easy-to-read format. Summaries provide concise versions of longer content, highlighting the most important points. You can generate notes from YouTube video transcripts, PDF documents, or by pasting text directly. The AI analyzes the content and creates comprehensive notes that you can edit, save to your library, or export. This feature is perfect for creating study materials from lectures, textbooks, or any educational content."
      relatedArticles={[
        { title: "Extracting content from YouTube videos", href: "/help/study-hub/youtube-extraction" },
        { title: "Processing PDF documents", href: "/help/study-hub/pdf-processing" },
        { title: "Organizing your study library", href: "/help/study-hub/library-organization" }
      ]}
    />
  );
};

export default GeneratingNotes;

