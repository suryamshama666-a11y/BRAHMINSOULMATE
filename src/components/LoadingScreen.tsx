import React from 'react';

/**
 * Loading screen component shown during lazy loading of pages
 * Displays a visually appealing loading animation with the brand colors
 */
const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <div className="relative w-24 h-24 mb-4">
        {/* Outer circle */}
        <div className="absolute inset-0 border-4 border-t-brahmin-primary border-r-brahmin-secondary border-b-brahmin-primary border-l-brahmin-secondary rounded-full animate-spin"></div>
        
        {/* Inner circle */}
        <div className="absolute inset-3 border-4 border-t-brahmin-secondary border-r-brahmin-primary border-b-brahmin-secondary border-l-brahmin-primary rounded-full animate-spin-reverse"></div>
        
        {/* Center circle */}
        <div className="absolute inset-8 bg-brahmin-primary rounded-full animate-pulse"></div>
      </div>
      
      <h2 className="text-xl md:text-2xl font-serif font-medium text-primary animate-pulse">
        Loading
      </h2>
      
      <p className="mt-2 text-gray-500 max-w-xs text-center px-4">
        Finding your perfect match...
      </p>
    </div>
  );
};

export default LoadingScreen; 