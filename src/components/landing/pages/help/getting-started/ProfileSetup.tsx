import React from 'react';
import { PlaceholderArticle } from '../PlaceholderArticle';

const ProfileSetup: React.FC = () => {
  return (
    <PlaceholderArticle
      title="Setting Up Your Profile"
      category="Getting Started"
      categoryHref="/help"
      content="Setting up your profile helps personalize your AspireExamine experience. After creating your account, you can access your profile from the dashboard. In your profile, you can: update your name and email address, add or change your profile picture, set your exam stream preferences, view your account statistics, and manage your study data. Your profile information is used to personalize your dashboard and track your progress. All profile changes are saved automatically. You can update your profile information anytime from the profile section in your dashboard."
      relatedArticles={[
        { title: "How to create an account and sign up", href: "/help/getting-started/account-setup" },
        { title: "Updating your profile information", href: "/help/account/profile-updates" }
      ]}
    />
  );
};

export default ProfileSetup;

