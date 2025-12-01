import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const DataManagement: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Managing Your Study Data"
      category="Account & Profile"
      categoryHref="/help"
      content="You have full control over your study data on AspireExamine. You can: (1) View all your test results and performance data, (2) Export your data for backup, (3) Delete specific test attempts or results, (4) Manage your study library content, (5) Clear chat history if needed, (6) Request complete data deletion. All your data (test results, AI chat history, generated study materials) is stored securely and associated with your account. You can access, manage, or delete your data anytime from your account settings. Data management options help you maintain control over your information and ensure your privacy preferences are respected."
      relatedArticles={[
        { title: "Updating your profile information", href: "/help/account/profile-updates" },
        { title: "Privacy and security settings", href: "/help/account/privacy-security" },
        { title: "Changing account settings", href: "/help/account/account-settings" }
      ]}
    />
  );
};

export default DataManagement;

