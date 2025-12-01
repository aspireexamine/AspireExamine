import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Button from '../Button';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqs: FAQItem[] = [
    {
      category: 'Getting Started',
      question: 'How do I create an account on AspireExamine?',
      answer: 'Creating an account is simple! Click on "Sign In" in the top right corner, then select "Sign Up". You can register using your email address or through Google OAuth. Once registered, you\'ll have immediate access to all our free features.'
    },
    {
      category: 'Getting Started',
      question: 'Is AspireExamine completely free?',
      answer: 'Yes! AspireExamine is 100% free. All features including practice tests, AI Assistant, Smart Study Hub, and performance analytics are available at no cost. We believe quality education should be accessible to everyone.'
    },
    {
      category: 'Getting Started',
      question: 'What exams are covered on AspireExamine?',
      answer: 'We currently support NEET (National Eligibility cum Entrance Test) and JEE (Joint Entrance Examination) Main & Advanced. We\'re continuously adding more competitive exam streams to help students prepare for various entrance tests.'
    },
    {
      category: 'Practice Tests',
      question: 'How do I attempt a practice test?',
      answer: 'Navigate to your dashboard, select your exam stream (NEET/JEE), choose a subject or chapter, and click on any available practice test. You can set a timer, answer questions, and review your performance with detailed analytics after completion.'
    },
    {
      category: 'Practice Tests',
      question: 'Understanding test modes (Practice vs Exam)',
      answer: 'AspireExamine offers two test modes: **Practice Mode** - Answer questions one by one with immediate feedback after each question. Perfect for learning and understanding concepts. **Exam Mode** - Simulates a real exam experience with a timer, question palette, and final scoring. Your answers are saved automatically, and you can mark questions for review. Choose Practice Mode for learning or Exam Mode for realistic exam simulation.'
    },
    {
      category: 'Practice Tests',
      question: 'Can I review my answers after completing a test?',
      answer: 'Absolutely! After completing a practice test, you\'ll see a detailed results page with all your answers, correct solutions, explanations, and performance analytics. You can review this anytime from your dashboard.'
    },
    {
      category: 'Practice Tests',
      question: 'How do I use the question palette during a test?',
      answer: 'The question palette is a visual navigation tool that shows all questions in the test. You can see which questions you\'ve answered (marked in green), which are marked for review (marked in yellow), and which are unanswered (marked in gray). Simply click on any question number to jump directly to that question.'
    },
    {
      category: 'Practice Tests',
      question: 'Can I download my test results as PDF?',
      answer: 'Yes! After completing a test, you can download a comprehensive PDF report that includes your score, subject-wise breakdown, all questions with your answers, correct solutions, and detailed explanations. This helps you review your performance offline.'
    },
    {
      category: 'AI Assistant',
      question: 'What is the AI Assistant and how does it work?',
      answer: 'Our AI Assistant is a powerful study companion that helps you with exam preparation. It supports multiple AI models (Gemini, Groq, OpenRouter) with automatic fallback. You can ask questions about concepts, get explanations, generate study materials, and receive personalized learning guidance. All conversations are saved in your chat history for easy reference.'
    },
    {
      category: 'AI Assistant',
      question: 'Can the AI Assistant help with specific exam questions?',
      answer: 'Yes! The AI Assistant can help explain concepts, solve problems, and provide step-by-step solutions. Simply type your question or upload an image of the problem, and the AI will provide detailed explanations to help you understand the topic better.'
    },
    {
      category: 'AI Assistant',
      question: 'How do I access my chat history?',
      answer: 'All your AI Assistant conversations are automatically saved. Click on the "History" button (usually in the top-left corner of the AI Assistant interface) to view all your previous chat sessions. You can search, load, or delete any conversation from your history.'
    },
    {
      category: 'Study Hub',
      question: 'How do I generate study materials from YouTube videos?',
      answer: 'Go to the Smart Study Hub section, select the YouTube option, paste a YouTube video URL, and our AI will extract the transcript and generate comprehensive study materials including notes, summaries, flashcards, mind maps, and practice questions automatically. The video must have captions/transcripts enabled for this to work.'
    },
    {
      category: 'Study Hub',
      question: 'What file formats are supported for PDF processing?',
      answer: 'We support standard PDF files. You can upload textbooks, notes, or any educational PDF, and our AI will process it to create organized study materials, summaries, and practice questions. The system extracts text content and generates various study formats based on your needs.'
    },
    {
      category: 'Study Hub',
      question: 'What types of content can I generate from study materials?',
      answer: 'From any source (YouTube videos, PDFs, or text), you can generate: **Study Notes** - Well-organized notes with headings and key concepts, **Flashcards** - Question-answer pairs for quick revision, **Mind Maps** - Visual representation of concepts and relationships, **Practice Questions** - Multiple-choice and descriptive questions for self-assessment, **Summaries** - Concise summaries of important points.'
    },
    {
      category: 'Performance Analytics',
      question: 'How do I track my progress?',
      answer: 'Your dashboard shows comprehensive analytics including test scores, subject-wise performance, improvement trends, and study streaks. You can view detailed reports for each practice test you\'ve attempted, see your performance over time, and identify areas that need more practice.'
    },
    {
      category: 'Performance Analytics',
      question: 'How can I identify my weak areas?',
      answer: 'The performance analytics section provides detailed breakdowns by subject and topic. You can see which subjects or chapters you\'re scoring lower in, track your improvement over time, and get recommendations on what to focus on. The system highlights areas where you need more practice.'
    },
    {
      category: 'Account',
      question: 'Can I use AspireExamine on mobile devices?',
      answer: 'Yes! AspireExamine is fully responsive and works seamlessly on mobile phones, tablets, and desktops. You can practice tests, use the AI Assistant, and access all features from any device with an internet connection.'
    },
    {
      category: 'Account',
      question: 'How do I update my profile information?',
      answer: 'Navigate to your profile section from the dashboard. You can update your name, email, profile picture, and other personal information. Changes are saved automatically and reflected across the platform.'
    },
    {
      category: 'Technical',
      question: 'What should I do if I encounter a technical issue?',
      answer: 'If you face any technical problems, please contact our support team through the Contact Us page or email us at support@aspireexamine.com. We typically respond within 24 hours and are committed to resolving any issues quickly. Make sure to include details about the issue, your browser, and device information.'
    },
    {
      category: 'Technical',
      question: 'Do I need to install any software to use AspireExamine?',
      answer: 'No! AspireExamine is a web-based platform that works directly in your browser. You don\'t need to install any software or apps. Just visit our website, create an account, and start using all features immediately. It works on all modern browsers including Chrome, Firefox, Safari, and Edge.'
    }
  ];

  const categories = ['all', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

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
          <HelpCircle className="mx-auto mb-3 sm:mb-4 text-pastel-purple" size={40} />
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-heading font-extrabold text-pastel-dark mb-3 sm:mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            Find quick answers to common questions about AspireExamine
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-8 sm:mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setOpenIndex(null);
              }}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm transition-all ${
                selectedCategory === category
                  ? 'bg-pastel-purple text-white shadow-md'
                  : 'bg-white text-pastel-dark border-2 border-gray-200 hover:border-pastel-purple'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No FAQs found in this category.</p>
            </div>
          ) : (
            filteredFAQs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-soft border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 pr-2">
                    <span className="text-[10px] sm:text-xs font-bold text-pastel-purple uppercase tracking-wider mb-1 sm:mb-2 block">
                      {faq.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-heading font-bold text-pastel-dark">
                      {faq.question}
                    </h3>
                  </div>
                  <motion.div
                    animate={{ rotate: openIndex === idx ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="text-pastel-purple ml-2 sm:ml-4" size={20} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {faq.answer.split('**').map((part, i) => 
                          i % 2 === 1 ? <strong key={i} className="text-pastel-dark font-semibold">{part}</strong> : part
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 sm:mt-16 bg-gradient-to-r from-pastel-purple/10 to-pastel-pink/10 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 md:p-12 text-center"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-pastel-dark mb-3 sm:mb-4">
            Still Have Questions?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-xl mx-auto">
            Can't find the answer you're looking for? Please reach out to our friendly support team.
          </p>
          <Link to="/contact">
            <Button variant="primary" className="mx-auto text-sm sm:text-base !py-2.5 sm:!py-3">Contact Support</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
