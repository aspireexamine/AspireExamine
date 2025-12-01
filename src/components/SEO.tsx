import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'AspireExamine - Free AI-Powered NEET & JEE Exam Preparation Platform',
  description = 'Master NEET, JEE, and competitive exams with free AI-powered practice tests, smart study materials, and personalized learning guidance. 100% free platform for Class 11th and 12th students.',
  keywords = 'NEET preparation, JEE preparation, competitive exams, AI learning, practice tests, study materials, Class 11, Class 12, exam preparation, free online coaching, NEET mock tests, JEE mock tests',
  image = 'https://aspireexamine.com/og-image.jpg',
  url,
  type = 'website'
}) => {
  const location = useLocation();
  const currentUrl = url || `https://aspireexamine.com${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Primary meta tags
    updateMetaTag('title', title);
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', image, 'property');
    updateMetaTag('og:url', currentUrl, 'property');
    updateMetaTag('og:type', type, 'property');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', 'property');
    updateMetaTag('twitter:title', title, 'property');
    updateMetaTag('twitter:description', description, 'property');
    updateMetaTag('twitter:image', image, 'property');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // Structured Data (JSON-LD)
    let structuredData = document.querySelector('script[type="application/ld+json"]');
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.setAttribute('type', 'application/ld+json');
      document.head.appendChild(structuredData);
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'AspireExamine',
      description: description,
      url: 'https://aspireexamine.com',
      logo: 'https://aspireexamine.com/logo.png',
      sameAs: [
        // Add your social media links here when available
      ],
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock'
      },
      educationalCredentialAwarded: 'Exam Preparation',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Exam Preparation Courses',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Course',
              name: 'NEET Preparation',
              description: 'Comprehensive NEET exam preparation with AI-powered practice tests'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Course',
              name: 'JEE Preparation',
              description: 'Complete JEE Main and Advanced preparation with smart study materials'
            }
          }
        ]
      }
    };

    structuredData.textContent = JSON.stringify(jsonLd);
  }, [title, description, keywords, image, currentUrl, type]);

  return null;
};

export default SEO;

