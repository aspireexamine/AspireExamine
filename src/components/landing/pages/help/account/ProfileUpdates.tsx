import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const ProfileUpdates: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Updating Your Profile Information"
      category="Account & Profile"
      categoryHref="/help"
      content="You can update your profile information anytime from your dashboard. To update your profile: (1) Navigate to your profile section, (2) Click on 'Edit Profile' or the edit icon, (3) Update any information you want to change (name, email, profile picture, etc.), (4) Click 'Save' to apply changes. You can update: your display name, email address (may require verification), profile picture/avatar, exam stream preferences, and other personal information. All changes are saved automatically and reflected immediately across the platform. Your profile information is used to personalize your experience and track your progress. Keep your profile updated to ensure accurate analytics and personalized recommendations."
      relatedArticles={[
        { title: "Setting up your profile", href: "/help/getting-started/profile-setup" },
        { title: "Changing account settings", href: "/help/account/account-settings" },
        { title: "Privacy and security settings", href: "/help/account/privacy-security" }
      ]}
    />
  );
};

export default ProfileUpdates;

