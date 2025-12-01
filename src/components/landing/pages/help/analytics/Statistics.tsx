import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const Statistics: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Performance Statistics and Trends"
      category="Performance Analytics"
      categoryHref="/help"
      content="Performance statistics provide comprehensive insights into your exam preparation journey. The statistics include: (1) Total tests attempted, (2) Average score and percentage, (3) Best and worst performances, (4) Improvement rate over time, (5) Consistency score, (6) Time spent on tests, (7) Accuracy rates, (8) Subject-wise statistics. Trends show: upward or downward performance patterns, seasonal variations in scores, improvement rates, and performance stability. These statistics help you: understand your overall performance level, identify improvement patterns, set realistic goals, track long-term progress, and make data-driven study decisions. All statistics are automatically calculated and updated after each test attempt, giving you real-time insights into your preparation progress."
      relatedArticles={[
        { title: "Understanding your test results", href: "/help/analytics/test-results" },
        { title: "Progress tracking over time", href: "/help/analytics/progress-tracking" },
        { title: "Subject-wise performance breakdown", href: "/help/analytics/subject-analysis" }
      ]}
    />
  );
};

export default Statistics;

