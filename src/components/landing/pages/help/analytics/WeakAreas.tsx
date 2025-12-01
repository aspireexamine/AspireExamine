import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const WeakAreas: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Identifying Weak Areas"
      category="Performance Analytics"
      categoryHref="/help"
      content="The analytics system automatically identifies your weak areas based on your test performance. Weak areas are determined by: (1) Low scores in specific chapters or topics, (2) Frequently incorrect answers in certain subjects, (3) Consistent mistakes in particular question types, (4) Below-average performance compared to your overall scores. The system highlights: subjects that need more practice, specific chapters with low scores, question types you struggle with, and topics requiring additional study. Use this information to: focus your study time on areas that need improvement, create targeted practice plans, allocate more time to weak subjects, and track improvement in previously weak areas. Regularly reviewing weak areas helps you create an effective study strategy that addresses knowledge gaps systematically."
      relatedArticles={[
        { title: "Understanding your test results", href: "/help/analytics/test-results" },
        { title: "Subject-wise performance breakdown", href: "/help/analytics/subject-analysis" },
        { title: "Progress tracking over time", href: "/help/analytics/progress-tracking" }
      ]}
    />
  );
};

export default WeakAreas;

