import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const PerformanceAnalytics: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Understanding Performance Analytics"
      category="Practice Tests"
      categoryHref="/help"
      content="Performance analytics provide comprehensive insights into your test performance. The analytics dashboard shows: (1) Overall score trends over time, (2) Subject-wise performance breakdown (Physics, Chemistry, Biology, Mathematics), (3) Chapter-wise analysis to identify weak areas, (4) Improvement trends showing your progress, (5) Comparison with previous test attempts, (6) Time management statistics, (7) Accuracy rates for different question types. Use these analytics to identify areas that need more practice, track your improvement, and focus your study efforts effectively. The system automatically generates these insights after each test attempt."
      relatedArticles={[
        { title: "Understanding your test results", href: "/help/analytics/test-results" },
        { title: "Identifying weak areas", href: "/help/analytics/weak-areas" },
        { title: "Subject-wise performance breakdown", href: "/help/analytics/subject-analysis" }
      ]}
    />
  );
};

export default PerformanceAnalytics;

