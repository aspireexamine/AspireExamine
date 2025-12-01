import React from 'react';
import { HelpArticle } from '../HelpArticle';
import { motion } from 'framer-motion';

const AccountSetup: React.FC = () => {
  return (
    <HelpArticle
      title="How to Create an Account and Sign Up"
      category="Getting Started"
      categoryHref="/help"
      relatedArticles={[
        { title: "Navigating the student dashboard", href: "/help/getting-started/dashboard-navigation" },
        { title: "Setting up your profile", href: "/help/getting-started/profile-setup" }
      ]}
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Creating Your Account</h2>
          <p className="mb-4">
            Getting started with AspireExamine is quick and easy. Follow these steps to create your account:
          </p>
          <ol className="list-decimal list-inside space-y-3 ml-2">
            <li>
              <strong>Click on "Sign In"</strong> - Located in the top right corner of the landing page
            </li>
            <li>
              <strong>Choose Sign Up</strong> - You'll see options to register with email or use Google OAuth
            </li>
            <li>
              <strong>Email Registration</strong>:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>Enter your email address</li>
                <li>Create a strong password</li>
                <li>Confirm your password</li>
                <li>Click "Sign Up"</li>
              </ul>
            </li>
            <li>
              <strong>Google OAuth</strong> - Click "Continue with Google" for faster registration using your Google account
            </li>
            <li>
              <strong>Verify Your Email</strong> - Check your inbox for a verification email (if required)
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">After Signing Up</h2>
          <p className="mb-4">
            Once you've created your account, you'll have immediate access to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>All practice tests for NEET, JEE, and other competitive exams</li>
            <li>AI Assistant for personalized study help</li>
            <li>Smart Study Hub for generating study materials</li>
            <li>Performance analytics and progress tracking</li>
            <li>Complete access to all features - everything is 100% free!</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Important Notes</h2>
          <div className="bg-pastel-lilac/20 p-4 rounded-xl border border-pastel-lilac/30">
            <ul className="space-y-2">
              <li>✓ AspireExamine is completely free - no hidden charges or premium features</li>
              <li>✓ Your account data is securely stored and protected</li>
              <li>✓ You can access your account from any device (mobile, tablet, desktop)</li>
              <li>✓ All your test results and progress are automatically saved</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Troubleshooting</h2>
          <div className="space-y-3">
            <div>
              <strong className="text-pastel-dark">Forgot Password?</strong>
              <p className="text-sm mt-1">Click "Forgot Password?" on the login page and follow the instructions sent to your email.</p>
            </div>
            <div>
              <strong className="text-pastel-dark">Can't Sign In?</strong>
              <p className="text-sm mt-1">Make sure you're using the correct email and password. If you used Google OAuth, try signing in with Google again.</p>
            </div>
          </div>
        </section>
      </div>
    </HelpArticle>
  );
};

export default AccountSetup;

