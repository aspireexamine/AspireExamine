import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Shield, Eye, Database } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      icon: Database,
      title: '1. Information We Collect',
      content: 'We collect information that you provide directly to us, including: account registration information (name, email address), usage data (how you interact with our platform), content you create (study materials, notes, test responses), and technical information (IP address, browser type, device information).'
    },
    {
      icon: Eye,
      title: '2. How We Use Your Information',
      content: 'We use the information we collect to: provide, maintain, and improve our services, process your requests and transactions, send you technical notices and support messages, respond to your comments and questions, monitor and analyze trends and usage, personalize your experience, and detect, prevent, and address technical issues.'
    },
    {
      icon: Shield,
      title: '3. Information Sharing and Disclosure',
      content: 'We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances: with your consent, to comply with legal obligations, to protect our rights and safety, with service providers who assist us in operating our platform (under strict confidentiality agreements), and in connection with a business transfer (merger, acquisition, etc.).'
    },
    {
      icon: Lock,
      title: '4. Data Security',
      content: 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.'
    },
    {
      icon: Database,
      title: '5. Your Rights and Choices',
      content: 'You have the right to: access your personal information, correct inaccurate data, request deletion of your data, object to processing of your data, request data portability, and withdraw consent at any time. You can exercise these rights by contacting us at support@aspireexamine.com.'
    },
    {
      icon: Eye,
      title: '6. Cookies and Tracking Technologies',
      content: 'We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.'
    },
    {
      icon: Shield,
      title: '7. Children\'s Privacy',
      content: 'Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.'
    },
    {
      icon: Lock,
      title: '8. Data Retention',
      content: 'We retain your personal information for as long as necessary to provide our services and fulfill the purposes described in this policy. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal purposes.'
    },
    {
      icon: Database,
      title: '9. Changes to This Privacy Policy',
      content: 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.'
    },
    {
      icon: Shield,
      title: '10. Contact Us',
      content: 'If you have any questions about this Privacy Policy, please contact us at support@aspireexamine.com or through our Contact Us page. We are committed to protecting your privacy and will respond to your inquiries promptly.'
    }
  ];

  return (
    <div className="min-h-screen bg-cream pt-20 sm:pt-24 pb-12 sm:pb-16">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-4xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Lock className="text-pastel-purple" size={36} />
            <Shield className="text-pastel-purple" size={36} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-heading font-extrabold text-pastel-dark mb-3 sm:mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-600 mb-3 sm:mb-4">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-3 sm:mt-4 max-w-2xl mx-auto px-2">
            At AspireExamine, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
        </motion.div>

        {/* Privacy Sections */}
        <div className="space-y-4 sm:space-y-6">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-soft border border-gray-100"
            >
              <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pastel-lilac rounded-full flex items-center justify-center flex-shrink-0">
                  <section.icon className="text-pastel-purple" size={20} />
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-pastel-dark">
                  {section.title}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed ml-0 sm:ml-14 md:ml-16">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 sm:mt-16 bg-gradient-to-r from-pastel-purple/10 to-pastel-pink/10 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 md:p-12 text-center"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-pastel-dark mb-3 sm:mb-4">
            Questions About Privacy?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-xl mx-auto">
            If you have any questions or concerns about our Privacy Policy or how we handle your data, please contact us.
          </p>
          <Link to="/contact">
            <button className="px-5 sm:px-6 py-2.5 sm:py-3 bg-pastel-purple text-white rounded-full font-bold text-sm sm:text-base hover:bg-pastel-purple/90 transition-colors">
              Contact Us
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
