import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Hero from './Hero';
import Stats from './Stats';
import About from './About';
import Features from './Features';
import Testimonials from './Testimonials';
import Footer from './Footer';
import SEO from '../SEO';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onSignup: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin, onSignup }) => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (pathname === '/') {
      if (hash) {
        // If there's a hash, scroll to that section after a short delay to ensure DOM is ready
        const sectionId = hash.substring(1); // Remove the # symbol
        const scrollToSection = () => {
          const section = document.getElementById(sectionId);
          if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            // If section not found yet, try again after a short delay
            setTimeout(scrollToSection, 100);
          }
        };
        setTimeout(scrollToSection, 150);
      } else {
        // Otherwise scroll to top
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }
    }
  }, [pathname, hash]);

  return (
    <div className="font-sans antialiased text-slate-800 bg-cream">
      <SEO 
        title="AspireExamine - Free AI-Powered NEET & JEE Exam Preparation Platform"
        description="Master NEET, JEE, and competitive exams with free AI-powered practice tests, smart study materials, and personalized learning guidance. 100% free platform for Class 11th and 12th students."
        keywords="NEET preparation, JEE preparation, competitive exams, AI learning, practice tests, study materials, Class 11, Class 12, exam preparation, free online coaching, NEET mock tests, JEE mock tests"
      />
      <Navbar onLogin={onLogin} onSignup={onSignup} />
      <main>
        <Hero onGetStarted={onGetStarted} />
        <Stats />
        <About onGetStarted={onGetStarted} />
        <Features onGetStarted={onGetStarted} />
        <Testimonials onGetStarted={onGetStarted} />
      </main>
      <Footer />
    </div>
  );
};
