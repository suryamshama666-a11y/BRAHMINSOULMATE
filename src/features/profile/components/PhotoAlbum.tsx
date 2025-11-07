import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Trash2, Upload, Plus } from 'lucide-react';
import { toast } from 'sonner';

type Photo = {
  id: string;
  url: string;
  isProfilePicture: boolean;
  uploadedAt: Date;
};

type PhotoAlbumProps = {
  photos: Photo[];
  profileName: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (photoId: string) => void;
  onUpload: (files: FileList) => void;
  onSetProfilePicture: (photoId: string) => void;
};

export default function PhotoAlbum({
  photos,
  profileName,
  isOpen,
  onClose,
  onDelete,
  onUpload,
  onSetProfilePicture
}: PhotoAlbumProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [localPhotos, setLocalPhotos] = useState(photos);

  // Handle keyboard navigation and hide navbar
  useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll and hide navbar when modal is open
    document.body.style.overflow = 'hidden';
    document.body.classList.add('photo-modal-open');
    
    // Add CSS to hide navbar and ensure full coverage
    const style = document.createElement('style');
    style.id = 'photo-modal-style';
    style.textContent = `
      .photo-modal-open nav {
        display: none !important;
      }
      .photo-modal-open {
        margin: 0 !important;
        padding: 0 !important;
      }
      .photo-modal-open * {
        box-sizing: border-box;
      }
    `;
    document.head.appendChild(style);
    
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      // Restore body scroll and show navbar when modal closes
      document.body.style.overflow = 'unset';
      document.body.classList.remove('photo-modal-open');
      
      // Remove the style
      const styleElement = document.getElementById('photo-modal-style');
      if (styleElement) {
        styleElement.remove();
      }
      
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentImageIndex]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % localPhotos.length);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + localPhotos.length) % localPhotos.length);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onUpload(files);
      toast.success(`${files.length} photo(s) uploaded successfully!`);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    onDelete(photoId);
    toast.success('Photo deleted successfully');

    // Adjust current index if needed
    if (currentImageIndex >= localPhotos.length - 1) {
      setCurrentImageIndex(Math.max(0, localPhotos.length - 2));
    }
  };

  const handleSetAsProfilePic = (photoId: string) => {
    // Update local state to reflect the new profile picture
    setLocalPhotos(prevPhotos => 
      prevPhotos.map(photo => ({
        ...photo,
        isProfilePicture: photo.id === photoId
      }))
    );
    onSetProfilePicture(photoId);
    toast.success('Profile picture updated!');
  };

  if (!isOpen) return null;

  const currentPhoto = localPhotos[currentImageIndex];
  
  // Update local photos when props change
  React.useEffect(() => {
    setLocalPhotos(photos);
  }, [photos]);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      {/* Hidden file input */}
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        id="album-upload"
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Photo counter */}
      <div className="absolute top-6 left-6 z-50 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium">
        {currentImageIndex + 1} / {localPhotos.length}
      </div>

      {/* Add Photos button */}
      <button
        onClick={() => document.getElementById('album-upload')?.click()}
        className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors"
      >
        <Upload className="h-4 w-4" />
        Add Photos
      </button>

      {/* Navigation arrows */}
      {localPhotos.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 z-40 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 transition-colors"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 z-40 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 transition-colors"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}

      {/* Main image */}
      {currentPhoto && (
        <div className="relative max-w-4xl max-h-[80vh] mx-auto">
          <img
            src={currentPhoto.url}
            alt={`${profileName} - Photo ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          
          {/* Profile picture badge */}
          {currentPhoto.isProfilePicture && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Profile Picture
            </div>
          )}
        </div>
      )}

      {/* Bottom panel with thumbnails and actions */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="max-w-6xl mx-auto">
          {/* Action buttons */}
          <div className="flex justify-center gap-4 mb-6">
            {currentPhoto && !currentPhoto.isProfilePicture && (
              <button
                onClick={() => handleSetAsProfilePic(currentPhoto.id)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
              >
                Set as Profile Picture
              </button>
            )}
            {currentPhoto && (
              <button
                onClick={() => handleDeletePhoto(currentPhoto.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Photo
              </button>
            )}
          </div>

          {/* Thumbnail strip */}
          <div className="flex justify-center gap-3 overflow-x-auto pb-2">
            {localPhotos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                  currentImageIndex === index
                    ? 'border-white scale-110'
                    : 'border-white/30 hover:border-white/60'
                }`}
              >
                <img
                  src={photo.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                {photo.isProfilePicture && (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full border-2 border-white">
                    Main
                  </div>
                )}
              </div>
            ))}
            
            {/* Add photo thumbnail */}
            <div
              onClick={() => document.getElementById('album-upload')?.click()}
              className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-white/50 hover:border-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <Plus className="h-6 w-6 text-white/70" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
