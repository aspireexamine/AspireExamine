import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const ProgressTracking: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Progress Tracking Over Time"
      category="Performance Analytics"
      categoryHref="/help"
      content="Progress tracking shows how your performance improves over time through visual charts and statistics. The tracking includes: (1) Score trends - How your scores change across multiple test attempts, (2) Improvement graphs - Visual representation of your progress, (3) Monthly/weekly statistics - Performance patterns over different time periods, (4) Consistency metrics - How consistent your performance is, (5) Goal tracking - Progress toward your target scores. These insights help you: see your improvement journey, identify patterns in your performance, stay motivated with visible progress, adjust study strategies based on trends, and set realistic goals. The system automatically tracks all your test attempts and generates comprehensive progress reports that you can view anytime from your dashboard."
      relatedArticles={[
        { title: "Understanding your test results", href: "/help/analytics/test-results" },
        { title: "Performance statistics and trends", href: "/help/analytics/statistics" },
        { title: "Subject-wise performance breakdown", href: "/help/analytics/subject-analysis" }
      ]}
    />
  );
};

export default ProgressTracking;

