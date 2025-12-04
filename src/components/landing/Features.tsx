import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

interface CourseCardProps {
  image: string;
  category: string;
  title: string;
  description: string;
  ctaText: string;
  accentColor: string;
  delay: number;
}

interface FeatureCardProps extends CourseCardProps {
  onGetStarted?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ image, category, title, description, ctaText, accentColor, delay, onGetStarted }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: isMobile ? 20 : 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: isMobile ? 0.3 : 0.5, delay: isMobile ? 0 : delay, type: isMobile ? "tween" : "spring", stiffness: isMobile ? undefined : 100, damping: isMobile ? undefined : 15 }}
      whileHover={isMobile ? {} : { y: -8, transition: { duration: 0.2 } }}
      className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-5 shadow-soft hover:shadow-card border border-gray-100 flex flex-col h-full group"
    >
      <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] h-48 sm:h-60 mb-4 sm:mb-6">
        <img 
          src={image} 
          alt={`${title} - ${description.substring(0, 50)}...`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          loading="lazy"
          decoding="async"
          width={600}
          height={400}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-sm" style={{ color: accentColor }}>
          {category}
        </div>
      </div>
      
      <div className="px-1 sm:px-2 flex flex-col flex-grow">
        <h3 className="text-xl sm:text-2xl font-heading font-bold text-pastel-dark mb-2 sm:mb-3 group-hover:text-pastel-purple transition-colors">{title}</h3>
        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 flex-grow">{description}</p>
        
        <motion.button 
          whileHover={isMobile ? {} : { scale: 1.02 }}
          whileTap={isMobile ? {} : { scale: 0.98 }}
          onClick={onGetStarted}
          className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 relative overflow-hidden cursor-pointer"
          style={{ backgroundColor: accentColor, color: '#111' }}
        >
          <span className="relative z-10">{ctaText}</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </motion.button>
      </div>
    </motion.div>
  );
};

interface FeaturesProps {
  onGetStarted?: () => void;
}

const Features: React.FC<FeaturesProps> = ({ onGetStarted }) => {
  const features = useMemo(() => [
    {
      category: "AI Learning",
      image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=70&w=600&auto=format&fit=crop",
      title: "AI-Powered Learning",
      description: "Get instant help with your study questions using our advanced AI assistant. Supports multiple AI models for personalized study guidance and content generation.",
      ctaText: "Try AI Assistant",
      accentColor: "#DDFCE5"
    },
    {
      category: "Practice Tests",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=70&w=600&auto=format&fit=crop",
      title: "Comprehensive Practice Tests",
      description: "Access thousands of practice questions for NEET, JEE, and competitive exams. Real-time analytics, performance tracking, and detailed solutions included.",
      ctaText: "Start Practicing",
      accentColor: "#FFF279"
    },
    {
      category: "Study Hub",
      image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=70&w=600&auto=format&fit=crop",
      title: "Smart Study Hub",
      description: "Generate study materials from YouTube videos and PDFs. Automatically create notes, flashcards, mind maps, and practice questions to boost your preparation.",
      ctaText: "Explore Study Hub",
      accentColor: "#DCCBFF"
    }
  ], []);

  return (
    <section id="courses" className="py-20 sm:py-24 md:py-32 bg-cream relative">
      {/* Decorative dots background */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16 gap-4 sm:gap-6">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-pastel-purple font-bold tracking-wider uppercase text-xs sm:text-sm mb-2 block"
            >
              Our Features
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-pastel-dark leading-tight"
            >
              Everything You Need <br/> To Ace Your Exams
            </motion.h2>
          </div>
          <motion.div
             initial={{ opacity: 0, x: 15 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5, delay: 0.1 }}
          >
             <Button variant="outline" onClick={onGetStarted} className="hidden md:flex text-sm">Explore All Features</Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} delay={idx * 0.1} onGetStarted={onGetStarted} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(Features);
