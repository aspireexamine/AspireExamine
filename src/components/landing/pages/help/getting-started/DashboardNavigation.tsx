import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const DashboardNavigation: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Navigating the Student Dashboard"
      category="Getting Started"
      categoryHref="/help"
      content="The student dashboard is your central hub for all exam preparation activities. From here, you can access practice tests, AI Assistant, Smart Study Hub, and view your performance analytics. The dashboard is organized into sections: Streams (NEET/JEE), Practice Tests, AI Assistant, Smart Study Hub, and Library. Use the sidebar navigation to switch between different sections. The main area displays your selected content, whether it's available test papers, AI chat interface, or study materials."
      relatedArticles={[
        { title: "How to create an account and sign up", href: "/help/getting-started/account-setup" },
        { title: "Selecting your exam stream (NEET/JEE)", href: "/help/getting-started/selecting-stream" }
      ]}
    />
  );
};

export default DashboardNavigation;

