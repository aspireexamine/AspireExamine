import React, { useMemo } from 'react';
import { Bot, FileCheck, Library } from 'lucide-react';
import { motion } from 'framer-motion';

const Stats: React.FC = () => {
  const stats = useMemo(() => [
    { icon: Bot, label: "AI Assistant", sub: "Personalized Help" },
    { icon: FileCheck, label: "Practice Tests", sub: "Exam Readiness" },
    { icon: Library, label: "Study Hub", sub: "Smart Materials" },
  ], []);

  return (
    <section className="bg-pastel-pink py-12 sm:py-16 border-y-2 border-white">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-white/50">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="flex items-center justify-center gap-3 sm:gap-4 py-4 md:py-0"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-pastel-dark transition-transform hover:scale-110 duration-300">
                <stat.icon size={22} className="sm:w-[28px] sm:h-[28px]" strokeWidth={1.5} />
              </div>
              <div className="text-pastel-dark">
                <h3 className="text-xl sm:text-2xl font-heading font-bold">{stat.label}</h3>
                <p className="text-xs sm:text-sm font-medium opacity-70">{stat.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(Stats);
