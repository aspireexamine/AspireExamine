import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const PrivacySecurity: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Privacy and Security Settings"
      category="Account & Profile"
      categoryHref="/help"
      content="Your privacy and security are important to us. In privacy settings, you can: (1) Control what information is visible, (2) Manage data sharing preferences, (3) Configure security options, (4) Set password requirements, (5) Enable two-factor authentication (if available), (6) Manage session security. Your data is encrypted and stored securely. You have full control over your personal information and can request data deletion at any time. We never share your personal information with third parties without your consent. For detailed information about how we handle your data, please refer to our Privacy Policy page."
      relatedArticles={[
        { title: "Changing account settings", href: "/help/account/account-settings" },
        { title: "Managing your study data", href: "/help/account/data-management" }
      ]}
    />
  );
};

export default PrivacySecurity;

