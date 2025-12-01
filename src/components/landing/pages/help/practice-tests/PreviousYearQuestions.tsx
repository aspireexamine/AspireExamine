import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const PreviousYearQuestions: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Previous Year Questions"
      category="Practice Tests"
      categoryHref="/help"
      content="Previous year questions (PYQs) are actual questions from past NEET and JEE exams. These are invaluable for exam preparation as they: (1) Show the actual exam pattern and difficulty level, (2) Help you understand question types and formats, (3) Reveal frequently asked topics, (4) Build confidence with real exam questions, (5) Provide authentic practice material. PYQs are organized by year and exam (NEET, JEE Main, JEE Advanced) and can be attempted in both Practice and Exam modes. Each question includes detailed solutions and explanations. Practicing PYQs regularly is one of the most effective ways to prepare for competitive exams."
      relatedArticles={[
        { title: "How to attempt a practice test", href: "/help/practice-tests/attempting-tests" },
        { title: "Test series and mock tests", href: "/help/practice-tests/test-series" },
        { title: "Reviewing answers and solutions", href: "/help/practice-tests/reviewing-answers" }
      ]}
    />
  );
};

export default PreviousYearQuestions;

