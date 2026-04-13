/**
 * Optimized image component with lazy loading and WebP support
 */

import { useState, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
}

export const OptimizedImage = ({ 
  src, 
  alt, 
  className,
  fallback = '/placeholder-profile.jpg',
  ...props 
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate WebP version URL if possible
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const hasWebP = src !== webpSrc;

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallback);
    }
    setIsLoading(false);
  };

  return (
    <picture>
      {hasWebP && (
        <source srcSet={webpSrc} type="image/webp" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-all duration-300',
          isLoading && 'blur-sm scale-105',
          !isLoading && 'blur-0 scale-100',
          className
        )}
        {...props}
      />
    </picture>
  );
};

export default OptimizedImage;
