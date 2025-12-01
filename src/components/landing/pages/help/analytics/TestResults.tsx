import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const TestResults: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Understanding Your Test Results"
      category="Performance Analytics"
      categoryHref="/help"
      content="After completing a test, you'll see comprehensive results that include: (1) Overall Score - Your total marks and percentage, (2) Subject-wise Breakdown - Performance in each subject (Physics, Chemistry, Biology, Mathematics), (3) Question Analysis - Which questions you got right/wrong, (4) Correct Answers - All correct answers with explanations, (5) Performance Metrics - Accuracy rate, time taken, improvement trends. The results page is color-coded: green for correct answers, red for incorrect, and shows detailed explanations for each question. You can review results immediately after submission or access them later from your dashboard. Use these results to identify weak areas, track improvement, and focus your study efforts on topics that need more practice."
      relatedArticles={[
        { title: "Subject-wise performance breakdown", href: "/help/analytics/subject-analysis" },
        { title: "Identifying weak areas", href: "/help/analytics/weak-areas" },
        { title: "Reviewing answers and solutions", href: "/help/practice-tests/reviewing-answers" }
      ]}
    />
  );
};

export default TestResults;

