import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '',
  fullWidth = false
}) => {
  const baseStyles = "px-6 py-3 rounded-full font-heading font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden select-none";
  
  const variants = {
    primary: "bg-[#DDFCE5] text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)]",
    secondary: "bg-[#FFF279] text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)]",
    outline: "bg-transparent border-2 border-[#111111] text-[#111111] hover:bg-[#F9F9F9]",
    ghost: "bg-transparent text-[#111111] hover:bg-gray-100/50"
  };

  const hoverAnimations = {
    primary: {
      y: -2,
      x: -2,
      boxShadow: "5px 5px 0px 0px rgba(17,17,17,1)",
      transition: { type: "spring", stiffness: 400, damping: 15 }
    },
    secondary: {
      y: -2,
      x: -2,
      boxShadow: "5px 5px 0px 0px rgba(17,17,17,1)",
      transition: { type: "spring", stiffness: 400, damping: 15 }
    },
    outline: {
      scale: 1.02,
      transition: { type: "spring", stiffness: 400, damping: 15 }
    },
    ghost: {
      x: 3,
      transition: { type: "spring", stiffness: 400, damping: 15 }
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={hoverAnimations[variant]}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
};

export default React.memo(Button);
