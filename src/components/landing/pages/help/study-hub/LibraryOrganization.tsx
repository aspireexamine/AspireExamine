import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const LibraryOrganization: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Organizing Your Study Library"
      category="Smart Study Hub"
      categoryHref="/help"
      content="Your study library is where all your generated study materials are stored. You can organize your library by: (1) Creating folders for different subjects or topics, (2) Tagging materials for easy search, (3) Organizing by exam stream (NEET/JEE), (4) Sorting by date, type, or subject, (5) Creating custom collections. The library stores: generated notes, flashcards, mind maps, practice questions, summaries, and any content you create. You can access your library anytime from the dashboard, search for specific materials, edit or delete items, and share materials if needed. Good organization helps you find study materials quickly and maintain an efficient study routine. Use folders and tags to keep related materials together."
      relatedArticles={[
        { title: "Generating notes and summaries", href: "/help/study-hub/generating-notes" },
        { title: "Creating flashcards automatically", href: "/help/study-hub/flashcards" },
        { title: "Extracting content from YouTube videos", href: "/help/study-hub/youtube-extraction" }
      ]}
    />
  );
};

export default LibraryOrganization;

