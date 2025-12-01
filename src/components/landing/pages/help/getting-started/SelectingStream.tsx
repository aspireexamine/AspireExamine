import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const SelectingStream: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Selecting Your Exam Stream (NEET/JEE)"
      category="Getting Started"
      categoryHref="/help"
      content="AspireExamine supports multiple competitive exam streams. Currently, we offer comprehensive preparation materials for NEET (National Eligibility cum Entrance Test) and JEE (Joint Entrance Examination) Main & Advanced. To select your stream, navigate to your dashboard and click on the exam stream card (NEET or JEE). Once selected, you'll see all available subjects, practice tests, and study materials for that stream. You can switch between streams anytime from the dashboard. Each stream is organized by subjects (Physics, Chemistry, Biology for NEET; Physics, Chemistry, Mathematics for JEE) with chapter-wise practice tests and previous year questions."
      relatedArticles={[
        { title: "Navigating the student dashboard", href: "/help/getting-started/dashboard-navigation" },
        { title: "How to attempt a practice test", href: "/help/practice-tests/attempting-tests" }
      ]}
    />
  );
};

export default SelectingStream;

