import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import Button from '../../Button';

interface HelpArticleProps {
  title: string;
  category: string;
  categoryHref: string;
  children: React.ReactNode;
  relatedArticles?: { title: string; href: string }[];
}

export const HelpArticle: React.FC<HelpArticleProps> = ({ 
  title, 
  category, 
  categoryHref, 
  children,
  relatedArticles = []
}) => {
  return (
    <div className="min-h-screen bg-cream pt-20 sm:pt-24 pb-12 sm:pb-16">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-4xl">
        {/* Breadcrumb Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4">
            <Link to="/help" className="hover:text-pastel-purple transition-colors flex items-center gap-1">
              <Home size={14} />
              Help Center
            </Link>
            <span>/</span>
            <Link to={categoryHref} className="hover:text-pastel-purple transition-colors">{category}</Link>
            <span>/</span>
            <span className="text-pastel-dark font-medium">{title}</span>
          </div>
          <Link to={categoryHref}>
            <Button variant="outline" className="!py-2 !px-4 text-xs sm:text-sm">
              <ArrowLeft size={14} className="mr-2" />
              Back to {category}
            </Button>
          </Link>
        </motion.div>

        {/* Article Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 md:p-10 shadow-soft border border-gray-100"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-pastel-dark mb-4 sm:mb-6">
            {title}
          </h1>
          
          <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed">
            {children}
          </div>
        </motion.article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 sm:mt-12"
          >
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-pastel-dark mb-4 sm:mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {relatedArticles.map((article, idx) => (
                <Link key={idx} to={article.href}>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 hover:border-pastel-purple hover:shadow-soft transition-all">
                    <p className="text-sm font-medium text-pastel-dark hover:text-pastel-purple transition-colors">{article.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

