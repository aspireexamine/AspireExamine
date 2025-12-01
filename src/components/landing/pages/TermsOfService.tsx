import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Shield } from 'lucide-react';

const TermsOfService: React.FC = () => {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing and using AspireExamine, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
    },
    {
      title: '2. Use License',
      content: 'Permission is granted to temporarily access the materials on AspireExamine\'s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display; attempt to reverse engineer any software contained on AspireExamine\'s website; remove any copyright or other proprietary notations from the materials; or transfer the materials to another person or "mirror" the materials on any other server.'
    },
    {
      title: '3. User Accounts',
      content: 'You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password. You must notify us immediately of any unauthorized use of your account or any other breach of security.'
    },
    {
      title: '4. User Content',
      content: 'You retain ownership of any content you submit, post, or display on or through AspireExamine. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content solely for the purpose of operating and providing the service.'
    },
    {
      title: '5. Prohibited Uses',
      content: 'You may not use AspireExamine: in any way that violates any applicable national or international law or regulation; to transmit, or procure the sending of, any advertising or promotional material without our prior written consent; to impersonate or attempt to impersonate the company, a company employee, another user, or any other person or entity; in any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful.'
    },
    {
      title: '6. Intellectual Property',
      content: 'The service and its original content, features, and functionality are and will remain the exclusive property of AspireExamine and its licensors. The service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.'
    },
    {
      title: '7. Disclaimer',
      content: 'The materials on AspireExamine\'s website are provided on an \'as is\' basis. AspireExamine makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.'
    },
    {
      title: '8. Limitations',
      content: 'In no event shall AspireExamine or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AspireExamine\'s website, even if AspireExamine or an authorized representative has been notified orally or in writing of the possibility of such damage.'
    },
    {
      title: '9. Revisions',
      content: 'AspireExamine may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.'
    },
    {
      title: '10. Contact Information',
      content: 'If you have any questions about these Terms of Service, please contact us at support@aspireexamine.com or through our Contact Us page.'
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
            <Shield className="text-pastel-purple" size={36} />
            <FileText className="text-pastel-purple" size={36} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-heading font-extrabold text-pastel-dark mb-3 sm:mb-4">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Terms Sections */}
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
              <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-pastel-dark mb-3 sm:mb-4">
                {section.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
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
            Questions About Our Terms?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-xl mx-auto">
            If you have any questions or concerns about these Terms of Service, please don't hesitate to contact us.
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

export default TermsOfService;
