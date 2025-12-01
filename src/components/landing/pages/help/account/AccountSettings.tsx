import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const AccountSettings: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Changing Account Settings"
      category="Account & Profile"
      categoryHref="/help"
      content="Account settings allow you to customize your AspireExamine experience. In account settings, you can: (1) Change your password, (2) Update email preferences, (3) Adjust notification settings, (4) Modify display preferences, (5) Set language preferences (if available), (6) Configure privacy settings. To access account settings, go to your profile section and look for 'Settings' or 'Account Settings'. All changes are saved automatically. You can also manage: data export options, account deletion (if needed), connected accounts (Google OAuth), and security settings. Keep your account settings updated to ensure the best experience and security."
      relatedArticles={[
        { title: "Updating your profile information", href: "/help/account/profile-updates" },
        { title: "Privacy and security settings", href: "/help/account/privacy-security" },
        { title: "Managing your study data", href: "/help/account/data-management" }
      ]}
    />
  );
};

export default AccountSettings;

