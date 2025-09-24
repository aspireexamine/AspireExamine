import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from 'framer-motion';
import VariableProximity from '@/components/VariableProximity';

// LinePath component for scroll-based animation
const LinePath = ({
  className,
  scrollYProgress,
  isMobile = false,
}: {
  className: string;
  scrollYProgress: any;
  isMobile?: boolean;
}) => {
  const pathLength = useTransform(scrollYProgress, [0, 1], [0.5, 1]);

  return (
    <svg
      width={isMobile ? "400" : "1278"}
      height={isMobile ? "800" : "2319"}
      viewBox={isMobile ? "0 0 400 800" : "0 0 1278 2319"}
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <motion.path
        d={isMobile 
          ? "M200 100C150 80 100 90 95 120C90 150 180 148 200 130C220 110 218 80 190 70C165 60 140 80 160 90C185 105 210 70 180 50C160 35 140 45 135 60C130 75 150 80 160 75C170 70 172 60 165 50C155 35 130 45 120 60C110 75 105 90 115 110C125 125 140 130 155 125C170 120 175 105 170 90C165 75 170 65 175 60C180 55 185 50 190 55C195 60 195 65 190 70C185 75 180 80 185 85C190 90 195 95 200 100C205 105 210 110 215 115C220 120 225 125 230 130C235 135 240 140 245 145C250 150 255 155 260 160C265 165 270 170 275 175C280 180 285 185 290 190C295 195 300 200 305 205C310 210 315 215 320 220C325 225 330 230 335 235C340 240 345 245 350 250C355 255 360 260 365 265C370 270 375 275 380 280C385 285 390 290 395 295C400 300 400 310 395 320C390 330 380 340 370 350C360 360 350 370 340 380C330 390 320 400 310 410C300 420 290 430 280 440C270 450 260 460 250 470C240 480 230 490 220 500C210 510 200 520 190 530C180 540 170 550 160 560C150 570 140 580 130 590C120 600 110 610 100 620C90 630 80 640 70 650C60 660 50 670 40 680C30 690 20 700 10 710C0 720 0 730 10 740C20 750 30 760 40 770C50 780 60 790 70 800"
          : "M876.605 394.131C788.982 335.917 696.198 358.139 691.836 416.303C685.453 501.424 853.722 498.43 941.95 409.714C1016.1 335.156 1008.64 186.907 906.167 142.846C807.014 100.212 712.699 198.494 789.049 245.127C889.053 306.207 986.062 116.979 840.548 43.3233C743.932 -5.58141 678.027 57.1682 672.279 112.188C666.53 167.208 712.538 172.943 736.353 163.088C760.167 153.234 764.14 120.924 746.651 93.3868C717.461 47.4252 638.894 77.8642 601.018 116.979C568.164 150.908 557 201.079 576.467 246.924C593.342 286.664 630.24 310.55 671.68 302.614C756.114 286.446 729.747 206.546 681.86 186.442C630.54 164.898 492 209.318 495.026 287.644C496.837 334.494 518.402 366.466 582.455 367.287C680.013 368.538 771.538 299.456 898.634 292.434C1007.02 286.446 1192.67 309.384 1242.36 382.258C1266.99 418.39 1273.65 443.108 1247.75 474.477C1217.32 511.33 1149.4 511.259 1096.84 466.093C1044.29 420.928 1029.14 380.576 1033.97 324.172C1038.31 273.428 1069.55 228.986 1117.2 216.384C1152.2 207.128 1188.29 213.629 1194.45 245.127C1201.49 281.062 1132.22 280.104 1100.44 272.673C1065.32 264.464 1044.22 234.837 1032.77 201.413C1019.29 162.061 1029.71 131.126 1056.44 100.965C1086.19 67.4032 1143.96 54.5526 1175.78 86.1513C1207.02 117.17 1186.81 143.379 1156.22 166.691C1112.57 199.959 1052.57 186.238 999.784 155.164C957.312 130.164 899.171 63.7054 931.284 26.3214C952.068 2.12513 996.288 3.87363 1007.22 43.58C1018.15 83.2749 1003.56 122.644 975.969 163.376C948.377 204.107 907.272 255.122 913.558 321.045C919.727 385.734 990.968 497.068 1063.84 503.35C1111.46 507.456 1166.79 511.984 1175.68 464.527C1191.52 379.956 1101.26 334.985 1030.29 377.017C971.109 412.064 956.297 483.647 953.797 561.655C947.587 755.413 1197.56 941.828 936.039 1140.66C745.771 1285.32 321.926 950.737 134.536 1202.19C-6.68295 1391.68 -53.4837 1655.38 131.935 1760.5C478.381 1956.91 1124.19 1515 1201.28 1997.83C1273.66 2451.23 100.805 1864.7 303.794 2668.89"
        }
        stroke="#1E90FF"
        strokeWidth={isMobile ? "8" : "20"}
        style={{
          pathLength,
          strokeDashoffset: useTransform(pathLength, (value) => 1 - value),
        }}
      />
    </svg>
  );
};

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onSignup: () => void;
}

export const LandingPage = ({ onGetStarted, onLogin, onSignup }: LandingPageProps) => {
  const [activeTab, setActiveTab] = useState('ai');
  const [isMobile, setIsMobile] = useState(false);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
  });

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div ref={scrollRef} className="min-h-screen bg-[#1a1a1a] text-white overflow-hidden font-barberchop" style={{ scrollBehavior: 'smooth' }}>
      {/* New Header Bar */}
      <header className="absolute top-0 left-0 right-0 z-30 px-2 sm:px-4 py-2 sm:py-3">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#FFD700] rounded-full px-3 sm:px-6 py-2 sm:py-3 shadow-lg">
            <div className="flex items-center justify-between">
              {/* Left Side - Logo and Text */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <img 
                  src="/favicon.svg" 
                  alt="Aspire Examine Logo" 
                  className="w-6 h-6 sm:w-8 sm:h-8"
                />
                <span className="text-black font-bold text-sm sm:text-lg md:text-xl">Aspire Examine</span>
              </div>
              
              {/* Right Side - Buttons */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={onLogin} 
                  className="text-black hover:bg-black/10 px-2 sm:px-4 py-1 sm:py-2 rounded-full font-medium text-xs sm:text-sm"
                >
                  Login
                </Button>
                <Button 
                  size="sm" 
                  onClick={onSignup} 
                  className="bg-[#1E90FF] text-white hover:bg-blue-600 px-2 sm:px-4 py-1 sm:py-2 rounded-full font-medium text-xs sm:text-sm"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`relative ${isMobile ? 'min-h-[80vh] py-8 pt-20' : 'min-h-screen pt-24'} flex items-center px-4`}>
        {/* Scroll-based LinePath Animation - Desktop Only */}
        {!isMobile && (
          <LinePath
            className="absolute inset-0 z-10 opacity-50 pointer-events-none"
            scrollYProgress={scrollYProgress}
            isMobile={isMobile}
          />
        )}
        
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-20 z-0">
          <div className={`grid ${isMobile ? 'grid-cols-4 gap-3' : 'grid-cols-8 gap-6'} h-full`}>
            {Array.from({ length: isMobile ? 16 : 64 }).map((_, i) => (
              <div key={i} className="border border-white/30 border-[0.5px]"></div>
            ))}
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20 z-0">
          <div className={`absolute ${isMobile ? 'top-10 left-10' : 'top-20 left-20'} w-2 h-2 bg-white rounded-full animate-pulse`}></div>
          <div className={`absolute ${isMobile ? 'top-20 right-16' : 'top-40 right-32'} w-1 h-1 bg-[#FFD700] rounded-full animate-pulse delay-1000`}></div>
          <div className={`absolute ${isMobile ? 'bottom-16 left-20' : 'bottom-32 left-40'} w-1.5 h-1.5 bg-[#1E90FF] rounded-full animate-pulse delay-2000`}></div>
          <div className={`absolute ${isMobile ? 'top-30 left-30' : 'top-60 left-60'} w-1 h-1 bg-[#FF69B4] rounded-full animate-pulse delay-500`}></div>
        </div>

        {/* Main Content - Left Aligned with Variable Proximity Container */}
        <div 
          ref={heroContainerRef}
          className={`z-20 max-w-4xl ${isMobile ? 'ml-4 px-2' : 'ml-8 sm:ml-16'}`}
          style={{ position: 'relative' }}
        >
          <motion.div
            className="text-left"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Hero Text - Mobile with Brunson Font */}
            {isMobile ? (
              <div className="text-center">
                <h1 
                  className="text-5xl sm:text-6xl font-bold leading-tight"
                  style={{ fontFamily: 'Brunson, sans-serif' }}
                >
                  <div>
                    <span className="text-white">Create new </span>
                    <span 
                      className="text-[#FFD700] drop-shadow-[3px_3px_0px_#B8860B]"
                      style={{ 
                        WebkitTextStroke: '2px black'
                      }}
                    >
                      experience
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-white">with ways of </span>
                    <span 
                      className="text-transparent"
                      style={{ 
                        WebkitTextStroke: '2px white'
                      }}
                    >
                      perfect
                    </span>
                    <span className="text-white"> </span>
                    <span className="text-[#1E90FF] drop-shadow-[3px_3px_0px_#000080]">learning</span>
                    <span className="text-white">.</span>
                  </div>
                </h1>
              </div>
            ) : (
              <>
                {/* Top line: Create New */}
                <div className="mb-4">
                  <VariableProximity
                    label="CREATE NEW"
                    fromFontVariationSettings="'wght' 400, 'opsz' 9"
                    toFontVariationSettings="'wght' 1000, 'opsz' 40"
                    containerRef={heroContainerRef}
                    radius={300}
                    falloff="linear"
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white"
                  />
                </div>

                {/* Second line: Experience With */}
                <div className="mb-4">
                  <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
                    <VariableProximity
                      label="EXPERIENCE"
                      fromFontVariationSettings="'wght' 400, 'opsz' 9"
                      toFontVariationSettings="'wght' 1000, 'opsz' 40"
                      containerRef={heroContainerRef}
                      radius={300}
                      falloff="linear"
                      className="text-[#FFD700] drop-shadow-[3px_3px_0px_#B8860B]"
                    />
                    <VariableProximity
                      label="WITH"
                      fromFontVariationSettings="'wght' 400, 'opsz' 9"
                      toFontVariationSettings="'wght' 1000, 'opsz' 40"
                      containerRef={heroContainerRef}
                      radius={300}
                      falloff="linear"
                      className="text-white ml-4"
                    />
                  </div>
                </div>

                {/* Third line: Ways Of */}
                <div className="mb-4">
                  <VariableProximity
                    label="WAYS OF"
                    fromFontVariationSettings="'wght' 400, 'opsz' 9"
                    toFontVariationSettings="'wght' 1000, 'opsz' 40"
                    containerRef={heroContainerRef}
                    radius={300}
                    falloff="linear"
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white"
                  />
                </div>

                {/* Bottom line: Perfect Learning */}
                <div>
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
                    <VariableProximity
                      label="PERFECT"
                      fromFontVariationSettings="'wght' 400, 'opsz' 9"
                      toFontVariationSettings="'wght' 1000, 'opsz' 40"
                      containerRef={heroContainerRef}
                      radius={300}
                      falloff="linear"
                      className="text-white"
                    />
                    <VariableProximity
                      label="LEARNING"
                      fromFontVariationSettings="'wght' 400, 'opsz' 9"
                      toFontVariationSettings="'wght' 1000, 'opsz' 40"
                      containerRef={heroContainerRef}
                      radius={300}
                      falloff="linear"
                      className="text-[#1E90FF] drop-shadow-[3px_3px_0px_#000080] ml-4"
                    />
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Content Container with Background */}
      <div className="bg-[#242424] rounded-t-[5rem] relative z-5" style={{ willChange: 'auto' }}>
        {/* Special Programs Section */}
        <section className={`${isMobile ? 'py-12 px-4' : 'py-20 px-4'}`}>
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              className={`${isMobile ? 'text-2xl sm:text-3xl font-bold text-center mb-8' : 'text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16'}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-white">OUR SPECIAL PROGRAMS FOR YOUR</span>{' '}
              <span className={`inline-block bg-[#00FF7F] text-black ${isMobile ? 'px-2 py-1 text-sm' : 'px-4 py-2'} rounded-full border-2 border-dashed border-[#00FF7F]`}>
                EDUCATION
              </span>
            </motion.h2>


            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'md:grid-cols-3 gap-8'} ${isMobile ? 'mt-8' : 'mt-16'} relative z-30`}>
              {/* AI-Powered Learning Card */}
              <motion.div 
                className={`bg-[#FFD700] ${isMobile ? 'p-4' : 'p-6 sm:p-8'} rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                whileHover={{ y: -5 }}
                onClick={() => console.log('AI-Powered Learning clicked')}
                style={{ willChange: 'transform' }}
              >
                <div className="flex justify-center mb-4">
                  <img 
                    src="/images/Ai.png" 
                    alt="AI-Powered Learning" 
                    className={`${isMobile ? 'w-32 h-32' : 'w-40 h-40 sm:w-48 sm:h-48'} object-contain`}
                    style={{ willChange: 'auto' }}
                  />
                </div>
                <h3 className={`${isMobile ? 'text-lg' : 'text-xl sm:text-2xl'} font-bold text-black ${isMobile ? 'mb-2' : 'mb-3 sm:mb-4'}`}>AI-Powered Learning</h3>
                <p className={`text-black ${isMobile ? 'text-xs' : 'text-sm sm:text-base'}`}>
                  Advanced AI assistant with multiple model support for personalized study guidance and content generation.
                </p>
              </motion.div>

              {/* Practice Tests Card */}
              <motion.div 
                className={`bg-[#1E90FF] ${isMobile ? 'p-4' : 'p-6 sm:p-8'} rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.4 }}
                whileHover={{ y: -5 }}
                onClick={() => console.log('Practice Tests clicked')}
                style={{ willChange: 'transform' }}
              >
                <div className="flex justify-center mb-4">
                  <img 
                    src="/images/test.png" 
                    alt="Practice Tests" 
                    className={`${isMobile ? 'w-28 h-28' : 'w-32 h-32 sm:w-40 sm:h-40'} object-contain`}
                    style={{ willChange: 'auto' }}
                  />
                </div>
                <h3 className={`${isMobile ? 'text-lg' : 'text-xl sm:text-2xl'} font-bold text-white ${isMobile ? 'mb-2' : 'mb-3 sm:mb-4'}`}>Practice Tests</h3>
                <p className={`text-white ${isMobile ? 'text-xs' : 'text-sm sm:text-base'}`}>
                  Comprehensive test series for NEET, JEE, and competitive exams with real-time analytics and performance tracking.
                </p>
              </motion.div>

              {/* Smart Study Hub Card */}
              <motion.div 
                className={`bg-[#FF69B4] ${isMobile ? 'p-4' : 'p-6 sm:p-8'} rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.6 }}
                whileHover={{ y: -5 }}
                onClick={() => console.log('Smart Study Hub clicked')}
                style={{ willChange: 'transform' }}
              >
                <div className="flex justify-center mb-4">
                  <img 
                    src="/images/smart.png" 
                    alt="Smart Study Hub" 
                    className={`${isMobile ? 'w-28 h-28' : 'w-32 h-32 sm:w-40 sm:h-40'} object-contain`}
                    style={{ willChange: 'auto' }}
                  />
                </div>
                <h3 className={`${isMobile ? 'text-lg' : 'text-xl sm:text-2xl'} font-bold text-black ${isMobile ? 'mb-2' : 'mb-3 sm:mb-4'}`}>Smart Study Hub</h3>
                <p className={`text-black ${isMobile ? 'text-xs' : 'text-sm sm:text-base'}`}>
                  Generate study materials from YouTube videos, PDFs, and create notes, flashcards, and mind maps automatically.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Program Benefits Section */}
        <section className={`${isMobile ? 'py-12 px-4' : 'py-20 px-4'} overflow-visible`}>
          <div className="max-w-7xl mx-auto overflow-visible">
            <motion.h2 
              className={`${isMobile ? 'text-xl sm:text-2xl font-bold text-center mb-8' : 'text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16'}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-white">OUR PROGRAM IS</span>{' '}
              <span className={`inline-block bg-[#00FF7F] text-black ${isMobile ? 'px-2 py-1 text-sm' : 'px-4 py-2'} rounded-full border-2 border-dashed border-[#00FF7F]`}>
                EASY
              </span>{' '}
              <span className="text-white">TO USE AND USEFUL FOR THE FUTURE</span>
            </motion.h2>


            {/* Main Content Block */}
            <motion.div 
              className={`bg-[#FFD700] ${isMobile ? 'p-4' : 'p-6 sm:p-8'} rounded-2xl shadow-2xl relative overflow-visible`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              style={{ willChange: 'transform' }}
            >
              {/* Tabs */}
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} gap-4 ${isMobile ? 'mb-6' : 'mb-8'}`}>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`${isMobile ? 'px-3 py-2 text-xs' : 'px-4 sm:px-6 py-3'} rounded-full font-bold transition-colors ${isMobile ? 'text-xs' : 'text-sm sm:text-base'} ${
                    activeTab === 'ai' ? 'bg-[#FFD700] text-black' : 'bg-[#1E90FF] text-white'
                  }`}
                >
                  AI Assistant
                </button>
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`${isMobile ? 'px-3 py-2 text-xs' : 'px-4 sm:px-6 py-3'} rounded-full font-bold transition-colors ${isMobile ? 'text-xs' : 'text-sm sm:text-base'} ${
                    activeTab === 'tests' ? 'bg-[#FFD700] text-black' : 'bg-[#1E90FF] text-white'
                  }`}
                >
                  Practice Tests
                </button>
                <button
                  onClick={() => setActiveTab('hub')}
                  className={`${isMobile ? 'px-3 py-2 text-xs' : 'px-4 sm:px-6 py-3'} rounded-full font-bold transition-colors ${isMobile ? 'text-xs' : 'text-sm sm:text-base'} ${
                    activeTab === 'hub' ? 'bg-[#FFD700] text-black' : 'bg-[#FF69B4] text-white'
                  }`}
                >
                  Study Hub
                </button>
              </div>

              <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'md:grid-cols-2 gap-8'}`}>
                <div>
                  <h3 className={`${isMobile ? 'text-lg' : 'text-2xl sm:text-3xl'} font-bold text-black ${isMobile ? 'mb-2' : 'mb-4'}`}>LEARNING WITH AI EVERYWHERE.</h3>
                  <p className={`text-black ${isMobile ? 'text-sm' : 'text-base sm:text-lg'}`}>
                    We provide AI-powered learning for students everywhere with smart content generation and personalized study assistance.
                  </p>
                </div>
                <div className={`bg-white ${isMobile ? 'p-3' : 'p-4 sm:p-6'} rounded-xl shadow-lg`}>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6 sm:w-8 sm:h-8'} bg-[#1E90FF] rounded-full`}></div>
                      <div className={`bg-gray-200 ${isMobile ? 'h-2' : 'h-3 sm:h-4'} w-3/4 rounded`}></div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6 sm:w-8 sm:h-8'} bg-[#FF69B4] rounded-full`}></div>
                      <div className={`bg-gray-200 ${isMobile ? 'h-2' : 'h-3 sm:h-4'} w-2/3 rounded`}></div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6 sm:w-8 sm:h-8'} bg-[#00FF7F] rounded-full`}></div>
                      <div className={`bg-gray-200 ${isMobile ? 'h-2' : 'h-3 sm:h-4'} w-4/5 rounded`}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TOTALLY FREE Badge */}
              <div className={`absolute ${isMobile ? '-top-2 -right-2' : '-top-3 sm:-top-6 -right-3 sm:-right-6'} bg-[#FF8C00] text-white ${isMobile ? 'px-2 py-1' : 'px-3 sm:px-4 py-1 sm:py-2'} rounded-full border-2 border-dashed border-[#FF8C00] transform rotate-12 ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} font-bold z-50 shadow-lg`}>
                TOTALLY FREE!
              </div>
            </motion.div>
          </div>
        </section>

         {/* Call to Action Section */}
         <section className={`${isMobile ? 'py-12 px-4' : 'py-20 px-4'} bg-white relative`}>
           <div className="max-w-7xl mx-auto text-center relative z-10">


            <motion.h2 
              className={`${isMobile ? 'text-2xl sm:text-3xl font-bold mb-6' : 'text-4xl sm:text-5xl md:text-6xl font-bold mb-8'}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <span className={`text-[#FF69B4] ${isMobile ? 'drop-shadow-[1px_1px_0px_#C71585]' : 'drop-shadow-[3px_3px_0px_#C71585]'}`}>LET'S UNLOCK</span>{' '}
              <span className={`text-[#1E90FF] ${isMobile ? 'drop-shadow-[1px_1px_0px_#000080]' : 'drop-shadow-[3px_3px_0px_#000080]'}`}>YOUR POTENTIAL</span><br />
              <span className={`text-black ${isMobile ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl md:text-4xl'}`}>WITH</span>{' '}
              <span className={`text-[#FFD700] ${isMobile ? 'drop-shadow-[1px_1px_0px_#B8860B]' : 'drop-shadow-[3px_3px_0px_#B8860B]'}`}>ASPIREEXAMINE</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Button 
                onClick={onGetStarted}
                className={`bg-[#1E90FF] text-white ${isMobile ? 'px-4 py-2 text-base' : 'px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl'} font-bold rounded-full hover:bg-blue-600 transform hover:scale-105 transition-all`}
              >
                Get Started Now
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className={`${isMobile ? 'py-6 px-4' : 'py-8 sm:py-12 px-4'}`}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className={`text-[#1E90FF] ${isMobile ? 'text-lg' : 'text-xl sm:text-2xl'} font-bold ${isMobile ? 'mb-2' : 'mb-4 md:mb-0'}`}>
              ASPIREEXAMINE
            </div>
            <div className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} ${isMobile ? 'mb-2' : 'mb-4 md:mb-0'} text-center`}>
              Copyright all AspireExamine 2024 all rights reserved
            </div>
            <div className={`flex ${isMobile ? 'space-x-2' : 'space-x-3 sm:space-x-4'}`}>
              {/* Social Media Icons */}
              <div className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6 sm:w-8 sm:h-8'} bg-gray-600 rounded-full`}></div>
              <div className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6 sm:w-8 sm:h-8'} bg-gray-600 rounded-full`}></div>
              <div className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6 sm:w-8 sm:h-8'} bg-gray-600 rounded-full`}></div>
              <div className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6 sm:w-8 sm:h-8'} bg-gray-600 rounded-full`}></div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
