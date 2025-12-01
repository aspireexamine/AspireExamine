import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const InterfaceOverview: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Understanding the Interface"
      category="Getting Started"
      categoryHref="/help"
      content="AspireExamine features an intuitive, user-friendly interface designed for efficient exam preparation. The main interface consists of: (1) Top Navigation Bar - Access to sign in, help center, and main navigation, (2) Sidebar - Quick access to different sections (Streams, Tests, AI Assistant, Study Hub, Library), (3) Main Content Area - Displays your selected content, (4) Dashboard Cards - Visual representation of available tests, streams, and features. The interface is fully responsive and works seamlessly on mobile, tablet, and desktop devices. All features are accessible with just a few clicks, making it easy to navigate between practice tests, AI assistance, and study materials."
      relatedArticles={[
        { title: "Navigating the student dashboard", href: "/help/getting-started/dashboard-navigation" },
        { title: "Can I use AspireExamine on mobile?", href: "/help/getting-started/mobile-access" }
      ]}
    />
  );
};

export default InterfaceOverview;

