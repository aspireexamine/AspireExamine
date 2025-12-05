import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import SEO from '../SEO';

interface LandingLayoutProps {
  children: React.ReactNode;
  onGetStarted?: () => void;
  onLogin?: () => void;
  onSignup?: () => void;
}

export const LandingLayout: React.FC<LandingLayoutProps> = ({ 
  children, 
  onGetStarted, 
  onLogin, 
  onSignup 
}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  // Get SEO data based on current path
  const getSEOData = () => {
    switch (pathname) {
      case '/help':
        return {
          title: 'Help Center - AspireExamine | Get Support & Learn How to Use',
          description: 'Get help with AspireExamine. Find answers to common questions, tutorials, and guides for using our AI-powered exam preparation platform.',
          keywords: 'AspireExamine help, support, tutorials, how to use, guide, FAQ'
        };
      case '/contact':
        return {
          title: 'Contact Us - AspireExamine | Get in Touch',
          description: 'Contact AspireExamine for support, questions, or feedback. We\'re here to help you with your exam preparation journey.',
          keywords: 'contact AspireExamine, support, get in touch, help'
        };
      case '/faq':
        return {
          title: 'FAQ - AspireExamine | Frequently Asked Questions',
          description: 'Find answers to frequently asked questions about AspireExamine, our features, pricing, and how to get started with your exam preparation.',
          keywords: 'AspireExamine FAQ, frequently asked questions, help, support'
        };
      case '/terms':
        return {
          title: 'Terms of Service - AspireExamine',
          description: 'Read the terms of service for AspireExamine. Understand the rules and guidelines for using our platform.',
          keywords: 'terms of service, AspireExamine terms, legal'
        };
      case '/privacy':
        return {
          title: 'Privacy Policy - AspireExamine',
          description: 'Learn how AspireExamine protects your privacy and handles your personal information.',
          keywords: 'privacy policy, data protection, AspireExamine privacy'
        };
      default:
        return {
          title: 'AspireExamine - Free AI-Powered NEET & JEE Exam Preparation Platform',
          description: 'Master NEET, JEE, and competitive exams with free AI-powered practice tests, smart study materials, and personalized learning guidance.',
          keywords: 'NEET preparation, JEE preparation, competitive exams, AI learning'
        };
    }
  };

  const seoData = getSEOData();

  return (
    <div className="font-sans antialiased text-slate-800 bg-cream min-h-screen flex flex-col">
      <SEO {...seoData} />
      <Navbar onLogin={onLogin} onSignup={onSignup} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

