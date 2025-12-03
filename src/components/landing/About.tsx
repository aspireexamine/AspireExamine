import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from './Button';
import { Check } from 'lucide-react';

interface AboutProps {
  onGetStarted?: () => void;
}

const About: React.FC<AboutProps> = ({ onGetStarted }) => {
  const navigate = useNavigate();
  const features = useMemo(() => [
    "Comprehensive practice tests for NEET, JEE, and competitive exams",
    "AI-powered study assistant for personalized learning guidance",
    "Smart content generation from YouTube videos and PDFs",
    "Real-time performance analytics and progress tracking"
  ], []);

  return (
    <section id="about" className="py-12 sm:py-16 md:py-24 bg-cream overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16">
          
          {/* Left Text */}
          <motion.div 
            className="flex-1 order-2 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm sm:text-base md:text-lg font-bold text-gray-700 mb-2 uppercase tracking-wider block">About AspireExamine</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-heading font-extrabold text-pastel-dark mb-4 sm:mb-6 leading-tight">
              YOUR COMPLETE <br/>
              <span className="text-pastel-purple">EXAM PREPARATION</span> <br/>
              PLATFORM
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-6 sm:mb-8 leading-relaxed">
              AspireExamine is an AI-powered educational platform designed specifically for competitive exam preparation. We help students master NEET, JEE, and other competitive exams through comprehensive practice tests, smart study materials, and personalized AI assistance.
            </p>

            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-10">
              {features.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 sm:gap-3">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-pastel-green flex items-center justify-center text-pastel-dark flex-shrink-0 mt-0.5">
                    <Check size={12} className="sm:w-[14px] sm:h-[14px]" strokeWidth={3} />
                  </span>
                  <span className="text-xs sm:text-sm md:text-base text-gray-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <Button variant="secondary" onClick={() => navigate('/help')} className="w-full sm:w-auto text-sm sm:text-base !py-2.5 sm:!py-3">Learn More</Button>
          </motion.div>

          {/* Right Image */}
          <motion.div 
            className="flex-1 relative w-full order-1 lg:order-2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Background ZigZag/Shape */}
            <div className="absolute top-0 right-0 w-full h-full bg-pastel-lilac/30 rounded-[30px] sm:rounded-[40px] transform rotate-2 sm:rotate-3 scale-95 -z-10 border-2 border-pastel-dark/5"></div>
            
            <div className="relative z-10">
               {/* Main Card */}
               <div className="bg-white rounded-t-[30px] sm:rounded-t-[40px] rounded-b-[120px] sm:rounded-b-[150px] md:rounded-t-full md:rounded-b-[200px] overflow-hidden border-[2px] sm:border-[3px] border-pastel-dark shadow-soft max-w-xs sm:max-w-sm md:max-w-md mx-auto relative">
                 <img 
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1632&auto=format&fit=crop" 
                  alt="Group of students collaborating on exam preparation, discussing study materials for NEET and JEE" 
                  className="w-full h-[280px] sm:h-[350px] md:h-[500px] object-cover"
                  loading="lazy"
                  decoding="async"
                  width={1632}
                  height={1088}
                 />
                 
                 {/* Floating Overlay Card */}
                 <div className="absolute bottom-4 sm:bottom-6 md:bottom-10 left-0 right-0 px-3 sm:px-4 md:px-6">
                   <div className="bg-pastel-pink/95 backdrop-blur-sm p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-white">
                      <h3 className="font-bold text-pastel-dark mb-1 text-xs sm:text-sm md:text-base">100% Free Platform</h3>
                      <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-700 leading-tight">Access all features, practice tests, and AI tools completely free. Start your exam preparation journey today.</p>
                   </div>
                 </div>
               </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 md:-top-10 md:-left-10 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-pastel-yellow rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob pointer-events-none"></div>
            <div className="absolute bottom-4 -right-4 sm:bottom-6 sm:-right-6 md:bottom-10 md:-right-10 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-pastel-green rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default React.memo(About);
