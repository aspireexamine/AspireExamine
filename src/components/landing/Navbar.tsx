import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import Button from './Button';

interface NavbarProps {
  onLogin?: () => void;
  onSignup?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogin, onSignup }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('Home');
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle window resize for responsive width logic - throttled
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const checkMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 150);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timeoutId);
    };
  }, []);

  // Hysteresis Scroll Logic to prevent flutter - optimized
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50 && !isScrolled) setIsScrolled(true);
    else if (latest < 30 && isScrolled) setIsScrolled(false);
  });

  const navLinks = useMemo(() => ['Home', 'Features', 'About', 'Contact'], []);

  const handleSignIn = useCallback(() => {
    if (onSignup) {
      onSignup();
    } else if (onLogin) {
      onLogin();
    }
    setIsMobileMenuOpen(false);
  }, [onSignup, onLogin]);

  const handleSectionNavigation = useCallback((sectionId: string) => {
    if (location.pathname === '/') {
      // We're already on the landing page, just scroll
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    } else {
      // Navigate to landing page with hash - LandingPage will handle the scroll
      navigate(`/#${sectionId}`);
    }
  }, [location.pathname, navigate]);

  const navbarVariants = useMemo(() => ({
    top: {
      width: isMobile ? "95%" : "90%",
      y: 10,
      backgroundColor: "rgba(255, 253, 247, 0)",
      backdropFilter: "blur(0px)",
      boxShadow: "0 0 0 0 rgba(0,0,0,0)",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      paddingLeft: "1rem",
      paddingRight: "1rem",
    },
    scrolled: {
      width: isMobile ? "92%" : "65%",
      y: isMobile ? 10 : 20,
      backgroundColor: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(16px)",
      boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      paddingLeft: "1.25rem",
      paddingRight: "1.25rem",
    }
  }), [isMobile]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Smooth spring transition for navbar state changes
  const navbarTransition = useMemo(() => ({
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 0.5,
  }), []);

  // Ultra-smooth transition for mobile menu
  const menuTransition = useMemo(() => ({
    type: "spring" as const,
    stiffness: 400,
    damping: 35,
    mass: 0.3,
  }), []);

  // Smooth backdrop transition
  const backdropTransition = useMemo(() => ({
    duration: 0.25,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number], // Custom cubic-bezier
  }), []);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <motion.nav
          variants={navbarVariants}
          initial="top"
          animate={isScrolled ? "scrolled" : "top"}
          transition={navbarTransition}
          className="pointer-events-auto rounded-full flex items-center justify-between border border-transparent"
          style={{ 
            borderColor: isScrolled ? "rgba(255,255,255,0.5)" : "transparent",
            willChange: 'transform, width, background-color, backdrop-filter'
          }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 cursor-pointer group shrink-0">
            <motion.div 
              layout
              layoutId="navbar-logo"
              transition={navbarTransition}
              className={`flex items-center justify-center rounded-xl border-2 border-pastel-dark shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] ${
                isScrolled ? 'w-8 h-8 bg-pastel-purple text-white' : 'w-9 h-9 md:w-10 md:h-10 bg-pastel-lilac text-pastel-dark'
              }`}
              style={{ willChange: 'transform, width, height' }}
            >
              <motion.span 
                layout
                className={`font-bold ${isScrolled ? 'text-sm' : 'text-base md:text-lg'}`}
                transition={navbarTransition}
              >
                A
              </motion.span>
            </motion.div>
            <motion.span 
              layout
              layoutId="navbar-brand"
              transition={navbarTransition}
              className={`font-heading font-bold tracking-tight text-pastel-dark group-hover:text-pastel-purple transition-colors duration-300 ${
                isScrolled ? 'text-base md:text-lg' : 'text-lg md:text-2xl'
              }`}
              style={{ willChange: 'transform, font-size' }}
            >
              AspireExamine
            </motion.span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a 
                key={link} 
                href={link === 'Home' ? '/' : link === 'Contact' ? '/contact' : `#${link.toLowerCase()}`}
                onClick={(e) => {
                  setActiveLink(link);
                  if (link === 'Home') {
                    e.preventDefault();
                    if (location.pathname === '/') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      navigate('/');
                    }
                  } else if (link === 'Contact') {
                    e.preventDefault();
                    navigate('/contact');
                  } else if (link === 'Features') {
                    e.preventDefault();
                    handleSectionNavigation('courses');
                  } else {
                    e.preventDefault();
                    handleSectionNavigation(link.toLowerCase());
                  }
                }}
                className="relative px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300"
              >
                {activeLink === link && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-pastel-dark/5 rounded-full -z-10"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      mass: 0.3
                    }}
                  />
                )}
                <span className={`relative z-10 transition-colors duration-300 ${activeLink === link ? 'text-pastel-purple font-bold' : 'text-gray-600 hover:text-pastel-dark'}`}>
                  {link}
                </span>
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block shrink-0">
            <Button 
              variant="primary" 
              onClick={handleSignIn}
              className={`!rounded-full transition-all duration-300 ${isScrolled ? '!px-5 !py-2 !text-xs shadow-none hover:shadow-md' : '!px-6 !py-2.5 !text-sm'}`}
            >
              Sign In
            </Button>
          </div>

          {/* Mobile Toggle */}
          <motion.button 
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            className="md:hidden text-pastel-dark p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </motion.div>
          </motion.button>
        </motion.nav>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence mode="wait">
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={backdropTransition}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                onClick={closeMobileMenu}
                style={{ willChange: 'opacity' }}
            />
            
            {/* Menu Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -10, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.92, y: -10, filter: "blur(8px)" }}
              transition={menuTransition}
              className="fixed top-20 left-4 right-4 z-50 bg-white/95 backdrop-blur-xl rounded-[32px] p-6 shadow-2xl border border-white md:hidden overflow-hidden"
              style={{ willChange: 'transform, opacity, filter' }}
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <motion.a 
                    key={link}
                    initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      mass: 0.2,
                      delay: i * 0.04
                    }}
                    href={link === 'Home' ? '/' : link === 'Contact' ? '/contact' : `#${link.toLowerCase()}`}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors group active:bg-gray-100"
                    onClick={(e) => {
                      closeMobileMenu();
                      if (link === 'Home') {
                        e.preventDefault();
                        if (location.pathname === '/') {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          navigate('/');
                        }
                      } else if (link === 'Contact') {
                        e.preventDefault();
                        navigate('/contact');
                      } else if (link === 'Features') {
                        e.preventDefault();
                        handleSectionNavigation('courses');
                      } else {
                        e.preventDefault();
                        handleSectionNavigation(link.toLowerCase());
                      }
                    }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-xl font-heading font-bold text-pastel-dark group-hover:text-pastel-purple transition-colors">{link}</span>
                    <motion.div 
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-pastel-lilac transition-colors"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                        <span className="text-lg">→</span>
                    </motion.div>
                  </motion.a>
                ))}
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    delay: navLinks.length * 0.04 + 0.1
                  }}
                  className="mt-4 pt-6 border-t border-gray-100"
                >
                  <Button fullWidth onClick={handleSignIn}>Sign In</Button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default React.memo(Navbar);
