import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  fallback = '',
  className = '',
}) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div 
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gray-100 ${className}`}
      role="img"
      aria-label={alt}
    >
      {!imageError && src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-gray-600 font-medium text-sm">
          {fallback || alt?.charAt(0)?.toUpperCase() || '?'}
        </span>
      )}
    </div>
  );
};

// Add the missing components that are being imported elsewhere
interface AvatarImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  src,
  alt = '',
  className = '',
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`h-full w-full object-cover ${className}`}
    />
  );
};

interface AvatarFallbackProps {
  children: React.ReactNode;
  className?: string;
}

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gray-100 text-gray-600 ${className}`}>
      {children}
    </div>
  );
};
