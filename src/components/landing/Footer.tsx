import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import Button from './Button';

interface FooterProps {
  onGetStarted?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onGetStarted }) => {
  const socialIcons = useMemo(() => [Facebook, Twitter, Linkedin, Instagram], []);
  const socialLinks = useMemo(() => [
    '#', // Facebook
    'https://x.com/mirtariq2006', // Twitter
    '#', // LinkedIn
    'https://www.instagram.com/whos.tariqq/' // Instagram
  ], []);
  const resourcesLinks = useMemo(() => [
    { name: 'Practice Tests', href: '/login' },
    { name: 'Study Materials', href: '/login' },
    { name: 'AI Assistant', href: '/login' },
    { name: 'Performance Analytics', href: '/login' }
  ], []);
  const supportLinks = useMemo(() => [
    { name: 'Help Center', href: '/help' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' }
  ], []);

  return (
    <footer className="bg-cream pt-8 sm:pt-10 pb-8 sm:pb-10 border-t border-gray-100 overflow-x-hidden">
      
      {/* CTA Box */}
      <div className="container mx-auto px-4 sm:px-6 md:px-12 mb-8 sm:mb-12 md:mb-20 relative z-10 -mt-12 sm:-mt-16 md:-mt-24 lg:-mt-32">
        <div className="bg-gradient-to-r from-[#DCCBFF] to-[#FFDBEB] rounded-[24px] sm:rounded-[30px] md:rounded-[40px] p-6 sm:p-8 md:p-20 text-center shadow-lg relative overflow-hidden">
           {/* Decorative circles inside CTA */}
           <div className="absolute top-0 left-0 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white/20 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
           <div className="absolute bottom-0 right-0 w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-white/20 rounded-full blur-xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

           <h2 className="text-xl sm:text-2xl md:text-4xl font-heading font-bold text-white mb-4 sm:mb-6 md:mb-8 drop-shadow-sm leading-tight px-2">
             READY TO ACE YOUR EXAMS? <br className="hidden md:block"/> START YOUR JOURNEY TODAY
           </h2>
           <div className="inline-block bg-white p-1 rounded-full w-full sm:w-auto max-w-full">
             <Button variant="outline" onClick={onGetStarted} fullWidth className="border-none !px-6 sm:!px-8 text-pastel-purple font-bold text-sm sm:text-base !py-2.5 sm:!py-3">Get Started Free</Button>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-8 md:gap-12 mb-6 sm:mb-8 md:mb-16">
          
          {/* Brand */}
          <div className="space-y-3 sm:space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-pastel-lilac rounded flex items-center justify-center border border-black text-[10px] sm:text-xs font-bold">A</div>
              <span className="font-heading font-bold text-base sm:text-lg">AspireExamine</span>
            </Link>
            <p className="text-[10px] sm:text-xs text-gray-700 leading-relaxed">
              Your complete AI-powered platform for competitive exam preparation. Master NEET, JEE, and more.
            </p>
            <div className="flex gap-3 sm:gap-4">
              {socialIcons.map((Icon, i) => (
                <a key={i} href={socialLinks[i]} target="_blank" rel="noopener noreferrer" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-pastel-purple hover:text-white transition-colors" aria-label={`Social media link ${i + 1}`}>
                  <Icon size={12} className="sm:w-[14px] sm:h-[14px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Links - Fixed mobile layout */}
          <div className="flex flex-col sm:grid sm:grid-cols-1 lg:col-span-1 gap-8 sm:gap-8">
              <div>
                <h3 className="font-bold text-pastel-dark mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base">Resources</h3>
                <ul className="space-y-2 sm:space-y-3 text-[10px] sm:text-xs text-gray-700 font-medium">
                  {resourcesLinks.map((link, idx) => (
                    <li key={idx}>
                      <Link to={link.href} className="hover:text-pastel-purple transition-colors">{link.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-pastel-dark mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base">Support</h3>
                <ul className="space-y-2 sm:space-y-3 text-[10px] sm:text-xs text-gray-700 font-medium">
                  {supportLinks.map((link, idx) => (
                    <li key={idx}>
                      <Link to={link.href} className="hover:text-pastel-purple transition-colors">{link.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
          </div>

          <div>
            <h3 className="font-bold text-pastel-dark mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base">Exam Streams</h3>
            <ul className="space-y-2 sm:space-y-3 text-[10px] sm:text-xs text-gray-700 font-medium">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-black rounded-full"></span> NEET Preparation</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-black rounded-full"></span> JEE Main & Advanced</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-black rounded-full"></span> Other Competitive Exams</li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
