import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

interface TestimonialCardProps {
  name: string;
  role: string;
  text: string;
  image: string;
  align: 'left' | 'right';
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, role, text, image, align }) => (
  <motion.div 
    initial={{ opacity: 0, x: align === 'right' ? 30 : -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className={`bg-white p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] shadow-soft border border-gray-100 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-start text-center sm:text-left max-w-xl w-full mb-4 sm:mb-6 lg:mb-0 ${align === 'right' ? 'lg:ml-auto' : 'lg:mr-auto'} hover:-translate-y-1 transition-transform duration-300`}
  >
    <img 
      src={image} 
      alt={name} 
      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-pastel-lilac shrink-0" 
      loading="lazy"
      decoding="async"
    />
    <div>
      <h4 className="font-bold text-pastel-dark text-xs sm:text-sm">{name}</h4>
      <span className="text-[10px] sm:text-xs text-pastel-purple font-semibold mb-1 block">{role}</span>
      <p className="text-gray-500 text-[10px] sm:text-xs leading-relaxed">{text}</p>
    </div>
  </motion.div>
);

interface TestimonialsProps {
  onGetStarted?: () => void;
}

const Testimonials: React.FC<TestimonialsProps> = ({ onGetStarted }) => {
  const testimonials = useMemo(() => [
    {
      name: "Rahul Kumar",
      role: "Class 12th, NEET Aspirant",
      text: "The practice tests are amazing! The AI assistant helped me understand difficult concepts, and I improved my score by 40% in just 3 months. Perfect for my NEET preparation!",
      image: "https://randomuser.me/api/portraits/men/18.jpg",
      align: "right" as const
    },
    {
      name: "Priya Sharma",
      role: "Class 11th, JEE Aspirant",
      text: "I love how I can generate study materials from YouTube videos. The Smart Study Hub saved me hours of note-taking. Highly recommended for all JEE students!",
      image: "https://randomuser.me/api/portraits/women/28.jpg",
      align: "left" as const
    },
    {
      name: "Arjun Patel",
      role: "Class 12th, JEE & NEET",
      text: "The performance analytics helped me identify my weak areas. The platform is completely free and has everything I need for exam preparation. Best study platform ever!",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
      align: "right" as const
    }
  ], []);

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-cream overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <div className="flex flex-col-reverse lg:flex-row gap-8 sm:gap-12 lg:gap-16 items-center">
          
          <div className="flex-1 w-full">
            <div className="relative w-full lg:h-[500px] flex flex-col justify-center">
                {/* Decorative Blob Background */}
                <div className="absolute inset-0 bg-pastel-purple/10 rounded-full filter blur-3xl transform scale-75 -z-10 hidden lg:block pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col gap-3 sm:gap-4 lg:gap-6 justify-center w-full">
                    {testimonials.map((testimonial, idx) => (
                      <TestimonialCard key={idx} {...testimonial} />
                    ))}
                </div>
            </div>
          </div>

          <motion.div 
            className="flex-1 lg:pl-10 text-center lg:text-left"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-heading font-extrabold text-pastel-dark mb-4 sm:mb-6">
              What Our Students Say
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto lg:mx-0">
              Join thousands of students who are acing their competitive exams with AspireExamine. Real success stories from real students.
            </p>
            <Button variant="secondary" onClick={onGetStarted} className="w-full sm:w-auto text-sm sm:text-base !py-2.5 sm:!py-3">Join Now</Button>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default React.memo(Testimonials);
