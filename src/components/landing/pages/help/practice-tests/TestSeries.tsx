import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const TestSeries: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Test Series and Mock Tests"
      category="Practice Tests"
      categoryHref="/help"
      content="Test series are comprehensive collections of mock tests designed to simulate real exam conditions. Each test series contains multiple full-length tests covering the complete syllabus. Mock tests help you: (1) Practice time management, (2) Build exam stamina, (3) Identify knowledge gaps, (4) Improve speed and accuracy, (5) Get familiar with exam pattern. Test series are organized by exam stream (NEET/JEE) and include previous year papers, chapter-wise tests, and full syllabus mock tests. You can attempt tests in Exam Mode for realistic simulation or Practice Mode for learning. All test attempts are tracked and contribute to your overall performance analytics."
      relatedArticles={[
        { title: "How to attempt a practice test", href: "/help/practice-tests/attempting-tests" },
        { title: "Understanding test modes (Practice vs Exam)", href: "/help/practice-tests/test-modes" },
        { title: "Previous year questions", href: "/help/practice-tests/previous-year-questions" }
      ]}
    />
  );
};

export default TestSeries;

