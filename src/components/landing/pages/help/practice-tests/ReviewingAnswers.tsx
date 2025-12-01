import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const ReviewingAnswers: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Reviewing Answers and Solutions"
      category="Practice Tests"
      categoryHref="/help"
      content="After completing a practice test, you can review all your answers with detailed explanations. The results page shows: (1) Your selected answers highlighted, (2) Correct answers clearly marked, (3) Detailed explanations for each question, (4) Subject-wise performance breakdown, (5) Overall score and percentage. You can review results immediately after submission or access them later from your dashboard. Each question shows whether you answered correctly, the correct answer, and a comprehensive explanation to help you understand the concept. This review process is crucial for learning from mistakes and improving your understanding."
      relatedArticles={[
        { title: "How to attempt a practice test", href: "/help/practice-tests/attempting-tests" },
        { title: "Understanding performance analytics", href: "/help/practice-tests/performance-analytics" },
        { title: "Downloading PDF reports", href: "/help/practice-tests/pdf-reports" }
      ]}
    />
  );
};

export default ReviewingAnswers;

