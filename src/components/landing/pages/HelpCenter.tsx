import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, BookOpen, MessageSquare, Video, FileText, Search, BarChart3, User, ChevronRight } from 'lucide-react';
import Button from '../Button';

interface HelpCategory {
  icon: React.ElementType;
  title: string;
  description: string;
  items: { title: string; href: string }[];
  color: string;
}

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories: HelpCategory[] = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn how to use AspireExamine and start your exam preparation journey",
      color: "#DDFCE5",
      items: [
        { title: "How to create an account and sign up", href: "/help/getting-started/account-setup" },
        { title: "Navigating the student dashboard", href: "/help/getting-started/dashboard-navigation" },
        { title: "Selecting your exam stream (NEET/JEE)", href: "/help/getting-started/selecting-stream" },
        { title: "Understanding the interface", href: "/help/getting-started/interface-overview" },
        { title: "Setting up your profile", href: "/help/getting-started/profile-setup" }
      ]
    },
    {
      icon: FileText,
      title: "Practice Tests",
      description: "Everything about practice tests, mock exams, and performance tracking",
      color: "#FFF279",
      items: [
        { title: "How to attempt a practice test", href: "/help/practice-tests/attempting-tests" },
        { title: "Understanding test modes (Practice vs Exam)", href: "/help/practice-tests/test-modes" },
        { title: "Using the question palette and navigation", href: "/help/practice-tests/question-palette" },
        { title: "Reviewing answers and solutions", href: "/help/practice-tests/reviewing-answers" },
        { title: "Understanding performance analytics", href: "/help/practice-tests/performance-analytics" },
        { title: "Downloading PDF reports", href: "/help/practice-tests/pdf-reports" },
        { title: "Test series and mock tests", href: "/help/practice-tests/test-series" },
        { title: "Previous year questions", href: "/help/practice-tests/previous-year-questions" }
      ]
    },
    {
      icon: MessageSquare,
      title: "AI Assistant",
      description: "Get help with using our AI-powered study assistant and content generation",
      color: "#DCCBFF",
      items: [
        { title: "How to use the AI Assistant", href: "/help/ai-assistant/getting-started" },
        { title: "Chat history and session management", href: "/help/ai-assistant/chat-history" },
        { title: "Asking questions and getting help", href: "/help/ai-assistant/asking-questions" },
        { title: "AI model selection (Gemini, Groq, OpenRouter)", href: "/help/ai-assistant/model-selection" },
        { title: "Using attachments and images", href: "/help/ai-assistant/attachments" },
        { title: "Suggested actions and prompts", href: "/help/ai-assistant/suggested-actions" }
      ]
    },
    {
      icon: Video,
      title: "Smart Study Hub",
      description: "Learn about generating study materials from videos and PDFs",
      color: "#FFDBEB",
      items: [
        { title: "Extracting content from YouTube videos", href: "/help/study-hub/youtube-extraction" },
        { title: "Processing PDF documents", href: "/help/study-hub/pdf-processing" },
        { title: "Generating notes and summaries", href: "/help/study-hub/generating-notes" },
        { title: "Creating flashcards automatically", href: "/help/study-hub/flashcards" },
        { title: "Generating mind maps", href: "/help/study-hub/mind-maps" },
        { title: "Creating practice questions from content", href: "/help/study-hub/practice-questions" },
        { title: "Organizing your study library", href: "/help/study-hub/library-organization" }
      ]
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track your progress, analyze performance, and identify improvement areas",
      color: "#DDFCE5",
      items: [
        { title: "Understanding your test results", href: "/help/analytics/test-results" },
        { title: "Subject-wise performance breakdown", href: "/help/analytics/subject-analysis" },
        { title: "Progress tracking over time", href: "/help/analytics/progress-tracking" },
        { title: "Identifying weak areas", href: "/help/analytics/weak-areas" },
        { title: "Performance statistics and trends", href: "/help/analytics/statistics" }
      ]
    },
    {
      icon: User,
      title: "Account & Profile",
      description: "Manage your account settings, profile, and preferences",
      color: "#FFF279",
      items: [
        { title: "Updating your profile information", href: "/help/account/profile-updates" },
        { title: "Changing account settings", href: "/help/account/account-settings" },
        { title: "Privacy and security settings", href: "/help/account/privacy-security" },
        { title: "Managing your study data", href: "/help/account/data-management" }
      ]
    }
  ];

  const popularArticles = [
    { title: "How do I start practicing for NEET?", href: "/help/practice-tests/attempting-tests" },
    { title: "What is the AI Assistant and how does it work?", href: "/help/ai-assistant/getting-started" },
    { title: "How to generate study materials from YouTube videos?", href: "/help/study-hub/youtube-extraction" },
    { title: "Understanding performance analytics", href: "/help/analytics/test-results" },
    { title: "How to organize my study library?", href: "/help/study-hub/library-organization" },
    { title: "Can I use AspireExamine on mobile?", href: "/help/getting-started/mobile-access" },
    { title: "How to download my test results as PDF?", href: "/help/practice-tests/pdf-reports" },
    { title: "What exam streams are available?", href: "/help/getting-started/selecting-stream" }
  ];

  const filteredCategories = helpCategories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-cream pt-20 sm:pt-24 pb-12 sm:pb-16">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-heading font-extrabold text-pastel-dark mb-3 sm:mb-4">
            Help Center
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
            Find comprehensive guides and answers to all your questions about AspireExamine
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto px-2">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-full border-2 border-pastel-dark/20 focus:border-pastel-purple focus:outline-none bg-white text-pastel-dark text-sm sm:text-base"
              />
            </div>
          </div>
        </motion.div>

        {/* Popular Articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-10 sm:mb-16"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-pastel-dark mb-4 sm:mb-6">Popular Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {popularArticles.map((article, idx) => (
              <Link key={idx} to={article.href}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + idx * 0.05 }}
                  className="bg-white p-4 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-pastel-purple hover:shadow-soft transition-all group cursor-pointer h-full"
                >
                  <p className="text-pastel-dark font-medium text-xs sm:text-sm group-hover:text-pastel-purple transition-colors">{article.title}</p>
                  <ChevronRight className="mt-2 text-gray-400 group-hover:text-pastel-purple group-hover:translate-x-1 transition-all" size={16} />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Help Categories */}
        <div className="space-y-6 sm:space-y-8">
          {filteredCategories.map((category, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 md:p-8 shadow-soft border border-gray-100"
            >
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div 
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${category.color}40` }}
                >
                  <category.icon className="text-pastel-purple" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-pastel-dark mb-1 sm:mb-2">{category.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{category.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {category.items.map((item, itemIdx) => (
                  <Link key={itemIdx} to={item.href}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-2 sm:gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                    >
                      <div className="w-1.5 h-1.5 bg-pastel-purple rounded-full flex-shrink-0"></div>
                      <span className="text-xs sm:text-sm text-gray-700 group-hover:text-pastel-purple transition-colors flex-1">{item.title}</span>
                      <ChevronRight className="text-gray-400 group-hover:text-pastel-purple group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" size={14} />
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 sm:mt-16 bg-gradient-to-r from-pastel-purple/10 to-pastel-pink/10 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 md:p-12 text-center"
        >
          <HelpCircle className="mx-auto mb-3 sm:mb-4 text-pastel-purple" size={40} />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-pastel-dark mb-3 sm:mb-4">
            Still Need Help?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you.
          </p>
          <Link to="/contact">
            <Button variant="primary" className="mx-auto text-sm sm:text-base !py-2.5 sm:!py-3">Contact Support</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpCenter;
