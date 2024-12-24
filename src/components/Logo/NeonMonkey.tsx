import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface NeonMonkeyProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-24 h-24',
  xl: 'w-48 h-48',
};

export const NeonMonkey: React.FC<NeonMonkeyProps> = ({
  className,
  size = 'md',
  animated = true,
}) => {
  const Component = animated ? motion.div : 'div';

  return (
    <Component
      className={cn(
        'relative flex items-center justify-center',
        sizeMap[size],
        className
      )}
      initial={animated ? { opacity: 0, scale: 0.5 } : undefined}
      animate={animated ? { opacity: 1, scale: 1 } : undefined}
      transition={animated ? { duration: 0.5, ease: 'easeOut' } : undefined}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 0 10px rgba(255, 0, 128, 0.5))' }}
      >
        {/* Outer Circle */}
        <motion.path
          d="M50 10 A40 40 0 1 1 50 90 A40 40 0 1 1 50 10"
          fill="none"
          stroke="url(#gradientStroke)"
          strokeWidth="2"
          initial={animated ? { pathLength: 0 } : undefined}
          animate={animated ? { pathLength: 1 } : undefined}
          transition={animated ? { duration: 1.5, ease: "easeInOut" } : undefined}
        />
        
        {/* Eyes */}
        <motion.circle
          cx="35"
          cy="45"
          r="5"
          fill="url(#gradientFill)"
          initial={animated ? { scale: 0 } : undefined}
          animate={animated ? { scale: 1 } : undefined}
          transition={animated ? { delay: 0.5, duration: 0.3 } : undefined}
        />
        <motion.circle
          cx="65"
          cy="45"
          r="5"
          fill="url(#gradientFill)"
          initial={animated ? { scale: 0 } : undefined}
          animate={animated ? { scale: 1 } : undefined}
          transition={animated ? { delay: 0.5, duration: 0.3 } : undefined}
        />
        
        {/* Smile */}
        <motion.path
          d="M35 60 Q50 70 65 60"
          fill="none"
          stroke="url(#gradientStroke)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={animated ? { pathLength: 0 } : undefined}
          animate={animated ? { pathLength: 1 } : undefined}
          transition={animated ? { delay: 0.8, duration: 0.5 } : undefined}
        />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(255, 0, 128)" />
            <stop offset="50%" stopColor="rgb(187, 0, 255)" />
            <stop offset="100%" stopColor="rgb(0, 191, 255)" />
          </linearGradient>
          <linearGradient id="gradientFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(255, 0, 128)" />
            <stop offset="100%" stopColor="rgb(187, 0, 255)" />
          </linearGradient>
        </defs>
      </svg>
    </Component>
  );
};

export default NeonMonkey;
