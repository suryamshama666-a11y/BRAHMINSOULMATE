
import { useState, useCallback } from 'react';
import { Profile } from '@/data/profiles';

export function useImageGallery(profile: Profile) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleImageChange = useCallback((index: number) => {
    if (index >= 0 && index < profile.images.length) {
      setActiveImageIndex(index);
    }
  }, [profile.images.length]);

  const nextImage = useCallback(() => {
    const nextIndex = (activeImageIndex + 1) % profile.images.length;
    handleImageChange(nextIndex);
  }, [activeImageIndex, profile.images.length, handleImageChange]);

  const prevImage = useCallback(() => {
    const prevIndex = activeImageIndex === 0 ? profile.images.length - 1 : activeImageIndex - 1;
    handleImageChange(prevIndex);
  }, [activeImageIndex, profile.images.length, handleImageChange]);

  // Reset to first image when profile changes
  const resetGallery = useCallback(() => {
    setActiveImageIndex(0);
  }, []);

  return {
    activeImageIndex,
    handleImageChange,
    nextImage,
    prevImage,
    resetGallery
  };
}
