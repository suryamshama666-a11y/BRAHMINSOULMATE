
import React from 'react';
import { Heart } from 'lucide-react';

interface LogoProps {
  className?: string;
}

const Logo = ({ className = "h-8 w-8" }: LogoProps) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg transform rotate-45"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Heart className="h-5 w-5 text-white transform -rotate-45" />
      </div>
    </div>
  );
};

export default Logo;
