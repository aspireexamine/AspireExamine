import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const PracticeQuestions: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Creating Practice Questions from Content"
      category="Smart Study Hub"
      categoryHref="/help"
      content="The Smart Study Hub can automatically generate practice questions from any content source (YouTube videos, PDFs, or text). Generated questions include: (1) Multiple-choice questions (MCQs) with options, (2) Descriptive questions for detailed answers, (3) Questions based on key concepts from the content, (4) Varying difficulty levels, (5) Answers and explanations included. This feature helps you: test your understanding of the content, practice for exams, identify areas that need more study, and create custom question banks. You can generate questions from lecture videos, textbook chapters, or any educational content. The AI analyzes the content and creates relevant questions that help reinforce learning and test comprehension."
      relatedArticles={[
        { title: "Extracting content from YouTube videos", href: "/help/study-hub/youtube-extraction" },
        { title: "Processing PDF documents", href: "/help/study-hub/pdf-processing" },
        { title: "How to attempt a practice test", href: "/help/practice-tests/attempting-tests" }
      ]}
    />
  );
};

export default PracticeQuestions;

