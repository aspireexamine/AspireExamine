import React, { useMemo, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Play, ArrowRight, Star, Zap } from 'lucide-react';
import Button from './Button';

interface HeroProps {
  onGetStarted?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  // Detect actual mobile device (not just screen width) for performance optimizations
  useEffect(() => {
    const checkMobileDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobileDevice(isMobileUA);
    };
    checkMobileDevice();
  }, []);

  // Detect mobile screen width
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Conditionally enable scroll animations only on desktop and when motion is not reduced
  const shouldAnimateScroll = !isMobile && !prefersReducedMotion;
  const { scrollY } = useScroll();
  const y1 = shouldAnimateScroll 
    ? useTransform(scrollY, [0, 500], [0, 200], { clamp: true })
    : useTransform(scrollY, [0, 500], [0, 0], { clamp: true });
  const y2 = shouldAnimateScroll
    ? useTransform(scrollY, [0, 500], [0, -150], { clamp: true })
    : useTransform(scrollY, [0, 500], [0, 0], { clamp: true });

  // Student avatars for trust indicators
  const userAvatars = useMemo(() => [
    { id: 1, src: 'https://randomuser.me/api/portraits/thumb/men/32.jpg', name: 'Rahul' },
    { id: 2, src: 'https://randomuser.me/api/portraits/thumb/women/44.jpg', name: 'Priya' },
    { id: 3, src: 'https://randomuser.me/api/portraits/thumb/men/67.jpg', name: 'Arjun' },
    { id: 4, src: 'https://randomuser.me/api/portraits/thumb/women/68.jpg', name: 'Sneha' }
  ], []);
  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  return (
    <section id="home" className="relative pt-16 pb-8 md:pt-20 md:pb-12 lg:pt-32 lg:pb-20 overflow-hidden bg-cream min-h-[75vh] md:min-h-[85vh] flex items-center">
      
      {/* Dynamic Background Noise Texture - Disabled on mobile for performance */}
      {!isMobile && (
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none z-0" />
      )}

      {/* Abstract Background Shapes - Optimized with reduced blur on mobile devices (even in desktop mode) */}
      <motion.div 
        style={{ 
          y: y1, 
          willChange: shouldAnimateScroll ? 'transform' : 'auto',
          transform: 'translateZ(0)' // Force GPU acceleration
        }}
        className={`absolute top-0 right-0 w-[150px] sm:w-[250px] md:w-[600px] h-[150px] sm:h-[250px] md:h-[600px] bg-gradient-to-b from-pastel-purple/20 to-pastel-pink/20 rounded-full -z-10 ${
          isMobileDevice 
            ? 'blur-[15px]' // Reduced blur on mobile devices (even in desktop mode)
            : isMobile 
              ? 'blur-[15px]' 
              : 'blur-[30px] sm:blur-[50px] md:blur-[80px] mix-blend-multiply'
        }`}
      />
      <motion.div 
        style={{ 
          y: y2, 
          willChange: shouldAnimateScroll ? 'transform' : 'auto',
          transform: 'translateZ(0)' // Force GPU acceleration
        }}
        className={`absolute bottom-0 left-0 w-[120px] sm:w-[200px] md:w-[450px] h-[120px] sm:h-[200px] md:h-[450px] bg-gradient-to-t from-pastel-yellow/30 to-pastel-green/20 rounded-full -z-10 ${
          isMobileDevice 
            ? 'blur-[12px]' // Reduced blur on mobile devices (even in desktop mode)
            : isMobile 
              ? 'blur-[12px]' 
              : 'blur-[25px] sm:blur-[40px] md:blur-[60px] mix-blend-multiply'
        }`}
      />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-16">
          
          {/* Left Content: Typography-focused design */}
          <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8 relative text-center lg:text-left">
            
            {/* Creative Tag */}
            <motion.div 
              initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-1 sm:gap-1.5 pl-1 pr-2.5 sm:pr-3 py-0.5 rounded-full bg-white border border-pastel-dark/10 shadow-sm mx-auto lg:mx-0"
            >
              <span className="bg-pastel-dark text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">New</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-pastel-dark tracking-wide">AI-Powered Exam Preparation</span>
            </motion.div>

            {/* Main Headline - Responsive Font Sizes */}
            <motion.div 
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="relative"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-heading font-extrabold leading-[1.1] text-pastel-dark tracking-tighter">
                ACE YOUR <br/>
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-pastel-purple via-purple-400 to-pink-400 py-0.5">
                  COMPETITIVE
                  <motion.div 
                    initial={prefersReducedMotion ? { width: "100%" } : { width: 0 }}
                    animate={{ width: "100%" }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, delay: 0.5 }}
                    className={`absolute bottom-0 lg:-bottom-1 left-0 h-1 sm:h-1.5 lg:h-2.5 bg-pastel-yellow/60 -z-10 -rotate-1 rounded-full ${
                      isMobile ? '' : 'mix-blend-multiply'
                    }`}
                  />
                </span> <br/>
                EXAMS WITH <br/>
                <span className="inline-flex items-center gap-1 sm:gap-1.5 md:gap-3 flex-wrap justify-center lg:justify-start">
                  SMART
                  <motion.div 
                    animate={prefersReducedMotion || isMobile ? {} : { rotate: 360 }}
                    transition={prefersReducedMotion || isMobile ? {} : { duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 sm:w-8 sm:h-8 md:w-14 md:h-14 rounded-full border-2 border-pastel-dark border-dashed flex items-center justify-center relative"
                  >
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-pastel-dark rounded-full"></div>
                  </motion.div>
                </span>
              </h1>
            </motion.div>
            
            <motion.p 
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.3 }}
              className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 max-w-lg font-medium leading-relaxed mx-auto lg:mx-0 px-2 sm:px-0"
            >
              Master NEET, JEE, and competitive exams with AI-powered practice tests, smart study materials, and personalized learning guidance.
            </motion.p>

            {/* Action Buttons */}
            <motion.div 
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 md:gap-4 px-2 sm:px-0"
            >
              <Button 
                variant="primary" 
                onClick={onGetStarted}
                className="!w-full sm:!w-auto !py-2.5 sm:!py-3 !px-5 sm:!px-6 text-xs sm:text-sm shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] hover:shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] hover:-translate-y-0.5"
              >
                Start Practicing <ArrowRight size={14} className="sm:w-4 sm:h-4" />
              </Button>
              
              <button 
                onClick={() => {
                  const featuresSection = document.getElementById('courses');
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="group flex items-center gap-2 sm:gap-3 text-pastel-dark font-bold font-heading transition-all p-2 sm:p-1.5 rounded-xl hover:bg-white/50 text-xs sm:text-sm min-h-[48px]"
              >
                <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-pastel-dark flex items-center justify-center group-hover:bg-pastel-dark group-hover:text-white transition-colors duration-300">
                  <Play size={12} className="sm:w-4 sm:h-4" fill="currentColor" />
                </span>
                <span className="group-hover:translate-x-1 transition-transform">See How It Works</span>
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.6 }}
              className="pt-2 sm:pt-3 md:pt-4 flex items-center justify-center lg:justify-start gap-2 sm:gap-3 px-2 sm:px-0"
            >
              <div className="flex -space-x-1.5 sm:-space-x-2">
                {userAvatars.map((avatar) => (
                  <div 
                    key={avatar.id} 
                    className="w-5 h-5 sm:w-7 sm:h-7 md:w-9 md:h-9 rounded-full border-2 border-cream bg-gray-200 overflow-hidden"
                  >
                    <img 
                      src={avatar.src}
                      alt={`${avatar.name} - AspireExamine student`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      width={50}
                      height={50}
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-start">
                <div className="flex items-center text-yellow-400 text-[10px] sm:text-xs">
                  {stars.map(s => <Star key={s} size={10} className="sm:w-3 sm:h-3" fill="currentColor" />)}
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-gray-700">Trusted by 10k+ Aspiring Students</span>
              </div>
            </motion.div>
          </div>

          {/* Right Content: Composition/Collage */}
          <div className="flex-1 relative w-full h-[250px] sm:h-[320px] md:h-[500px] lg:h-[600px] flex items-center justify-center mt-2 sm:mt-4 lg:mt-0">
            
            {/* Main Image Container with Creative Mask */}
            <motion.div
              initial={prefersReducedMotion ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
              className="relative z-10 w-[85%] sm:w-[90%] md:w-[85%] h-[85%] sm:h-[90%] md:h-[85%]"
            >
              <div className="absolute inset-0 bg-pastel-lilac rounded-[24px] sm:rounded-[32px] md:rounded-[48px] rotate-2 sm:rotate-3 translate-x-1.5 sm:translate-x-2.5 md:translate-x-3 translate-y-1.5 sm:translate-y-2.5 md:translate-y-3 border-2 border-pastel-dark"></div>
              <div className="absolute inset-0 bg-white rounded-[24px] sm:rounded-[32px] md:rounded-[48px] border-2 border-pastel-dark overflow-hidden shadow-xl relative">
                <img 
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=75&w=600&auto=format&fit=crop" 
                  srcSet="https://images.unsplash.com/photo-1544717305-2782549b5136?q=70&w=400&auto=format&fit=crop 400w, https://images.unsplash.com/photo-1544717305-2782549b5136?q=75&w=600&auto=format&fit=crop 600w, https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop 800w, https://images.unsplash.com/photo-1544717305-2782549b5136?q=85&w=1200&auto=format&fit=crop 1200w"
                  sizes="(max-width: 480px) 85vw, (max-width: 768px) 80vw, (max-width: 1024px) 50vw, 40vw"
                  alt="Female student with headphones studying at desk with laptop, preparing for NEET and JEE competitive exams" 
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  width={600}
                  height={900}
                />
                
                {/* Gradient Overlay for text readability at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Floating Element 1: Top Left Badge - Reduced animation on mobile */}
              <motion.div 
                animate={prefersReducedMotion || isMobile ? {} : { y: [0, -4, 0] }}
                transition={prefersReducedMotion || isMobile ? {} : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-1.5 -left-1 sm:-top-3 sm:-left-2 md:-top-5 md:-left-5 bg-white border-2 border-pastel-dark p-1.5 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] flex items-center gap-1.5 sm:gap-2.5 md:gap-3 max-w-[110px] sm:max-w-[140px] md:max-w-[180px]"
              >
                <div className="w-5 h-5 sm:w-7 sm:h-7 md:w-9 md:h-9 bg-pastel-pink rounded-full flex items-center justify-center border border-pastel-dark font-bold text-[10px] sm:text-xs md:text-base">A+</div>
                <div>
                  <p className="font-heading font-bold text-[9px] sm:text-[10px] md:text-xs leading-tight">Top Rated</p>
                  <p className="text-[7px] sm:text-[8px] md:text-[9px] text-gray-700">Best exam prep platform</p>
                </div>
              </motion.div>

              {/* Floating Element 2: Bottom Right Stats - Reduced animation on mobile */}
              <motion.div 
                animate={prefersReducedMotion || isMobile ? {} : { y: [0, 4, 0] }}
                transition={prefersReducedMotion || isMobile ? {} : { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-3 -right-1 sm:-bottom-5 sm:-right-2 md:-bottom-7 md:-right-4 bg-pastel-yellow border-2 border-pastel-dark p-1.5 sm:p-2.5 md:p-4 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] scale-70 sm:scale-85 md:scale-100 origin-bottom-right"
              >
                 <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2.5 mb-1 sm:mb-1.5">
                    <div className="bg-white p-0.5 sm:p-1 md:p-1.5 rounded-full border border-black"><Zap size={10} className="sm:w-3 sm:h-3 md:w-4 md:h-4 text-pastel-purple fill-current" /></div>
                    <span className="font-heading font-bold text-[9px] sm:text-[10px] md:text-sm">Study Streak</span>
                 </div>
                 <div className="h-1 sm:h-1.5 md:h-2 w-12 sm:w-20 md:w-28 bg-white rounded-full border border-black overflow-hidden">
                    <motion.div 
                      initial={prefersReducedMotion ? { width: "80%" } : { width: 0 }}
                      animate={{ width: "80%" }}
                      transition={prefersReducedMotion ? { duration: 0 } : { duration: 1, delay: 0.5 }}
                      className="h-full bg-pastel-purple"
                    />
                 </div>
              </motion.div>

            </motion.div>

             <svg className="absolute bottom-4 sm:bottom-8 right-0 md:right-8 w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 text-pastel-purple -z-20 opacity-40 hidden sm:block" viewBox="0 0 200 200" aria-hidden="true">
               <path fill="currentColor" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.6,31.7C59,41.9,47.1,49.5,35.4,56.7C23.7,63.9,12.2,70.7,-0.9,72.2C-13.9,73.8,-29.3,70,-42.1,62.3C-54.9,54.6,-65,42.9,-72.6,29.3C-80.2,15.7,-85.2,0.2,-81.9,-13.8C-78.6,-27.8,-67,-40.3,-54.2,-48.1C-41.5,-55.9,-27.6,-59,-14.2,-61.2C-0.8,-63.3,13.6,-64.5,30.5,-83.6" transform="translate(100 100)" />
             </svg>

          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(Hero);
