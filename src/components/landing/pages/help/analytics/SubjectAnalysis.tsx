import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const SubjectAnalysis: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Subject-wise Performance Breakdown"
      category="Performance Analytics"
      categoryHref="/help"
      content="Subject-wise analysis shows your performance in each subject separately (Physics, Chemistry, Biology for NEET; Physics, Chemistry, Mathematics for JEE). This breakdown helps you: (1) Identify which subjects need more attention, (2) Track improvement in each subject over time, (3) Allocate study time effectively, (4) Focus on weak subjects while maintaining strong ones, (5) Set subject-specific goals. The analysis includes: average scores per subject, chapter-wise performance within each subject, trend analysis showing improvement or decline, comparison with previous test attempts, and recommendations for each subject. Use this information to create a balanced study plan that addresses all subjects appropriately."
      relatedArticles={[
        { title: "Understanding your test results", href: "/help/analytics/test-results" },
        { title: "Identifying weak areas", href: "/help/analytics/weak-areas" },
        { title: "Progress tracking over time", href: "/help/analytics/progress-tracking" }
      ]}
    />
  );
};

export default SubjectAnalysis;

