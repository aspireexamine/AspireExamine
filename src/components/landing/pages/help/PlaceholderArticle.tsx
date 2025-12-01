import React from 'react';
import { Link } from 'react-router-dom';
import { HelpArticle } from './HelpArticle';

interface PlaceholderArticleProps {
  title: string;
  category: string;
  categoryHref: string;
  content: string;
  relatedArticles?: { title: string; href: string }[];
}

export const PlaceholderArticle: React.FC<PlaceholderArticleProps> = ({ 
  title, 
  category, 
  categoryHref, 
  content,
  relatedArticles = []
}) => {
  return (
    <HelpArticle
      title={title}
      category={category}
      categoryHref={categoryHref}
      relatedArticles={relatedArticles}
    >
      <div className="space-y-6">
        <section>
          <p className="mb-4">{content}</p>
          <div className="bg-pastel-lilac/20 p-4 rounded-xl border border-pastel-lilac/30">
            <p className="text-sm">
              <strong>Note:</strong> This article is being expanded with more detailed information. 
              For immediate assistance, please <Link to="/contact" className="text-pastel-purple hover:underline">contact our support team</Link>.
            </p>
          </div>
        </section>
      </div>
    </HelpArticle>
  );
};

