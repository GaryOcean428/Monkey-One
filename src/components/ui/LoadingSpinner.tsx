import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * A reusable loading spinner component
 * @param {LoadingSpinnerProps} props - Component props
 * @returns {JSX.Element} Rendered loading spinner
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-4 border-solid border-current 
                 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]
                 ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
};