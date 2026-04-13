import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Trash2, Upload, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

type Photo = {
  id: string;
  url: string;
  isProfilePicture: boolean;
  uploadedAt: Date;
};

export default function PhotoManagement() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Mock photos - in real app, this would come from profile data
  const photos: Photo[] = profile?.images?.map((url, index) => ({
    id: `photo-${index}`,
    url,
    isProfilePicture: index === 0,
    uploadedAt: new Date()
  })) || [
    {
      id: 'photo-1',
      url: 'https://randomuser.me/api/portraits/women/1.jpg',
      isProfilePicture: true,
      uploadedAt: new Date()
    },
    {
      id: 'photo-2',
      url: 'https://randomuser.me/api/portraits/women/2.jpg',
      isProfilePicture: false,
      uploadedAt: new Date()
    }
  ];

  // effect:audited — Keyboard event listener for photo navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          navigate('/profile');
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleDelete = (photoId: string) => {
    logger.log('Deleting photo:', photoId);
    toast.success('Photo deleted successfully');
  };

  const handleUpload = (files: FileList) => {
    logger.log('Uploading photos:', files);
    toast.success('Photos uploaded successfully');
  };

  const handleSetProfilePicture = (photoId: string) => {
    logger.log('Setting profile picture:', photoId);
    toast.success('Profile picture updated');
  };

  if (photos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        {/* Close Button */}
        <Button
          onClick={() => navigate('/profile')}
          className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/30 text-white border-white/30"
          size="icon"
        >
          <X className="h-6 w-6" />
        </Button>

        <div className="text-center text-white">
          <h2 className="text-2xl font-semibold mb-4">No Photos Yet</h2>
          <p className="mb-6">Upload your first photo to get started</p>
          
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
            />
            <div className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Profile Pics
            </div>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">View Photos</h2>
            <p className="text-sm text-white/70">
              {currentImageIndex + 1} of {photos.length} photos
            </p>
          </div>
          
          <Button
            onClick={() => navigate('/profile')}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            size="icon"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Main Image Display */}
      <div className="flex items-center justify-center h-full">
        {/* Previous Button */}
        {photos.length > 1 && (
          <Button
            onClick={goToPrevious}
            className="absolute left-4 z-10 bg-white/20 hover:bg-white/30 text-white border-white/30"
            size="icon"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}

        {/* Current Image */}
        <div className="max-w-4xl max-h-full p-8">
          <img
            src={photos[currentImageIndex]?.url}
            alt={`Photo ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>

        {/* Next Button */}
        {photos.length > 1 && (
          <Button
            onClick={goToNext}
            className="absolute right-4 z-10 bg-white/20 hover:bg-white/30 text-white border-white/30"
            size="icon"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between">
          {/* Photo Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleSetProfilePicture(photos[currentImageIndex].id)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              Set as Profile Pic
            </Button>
            
            <Button
              onClick={() => handleDelete(photos[currentImageIndex].id)}
              className="bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>

          {/* Upload Button */}
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
            />
            <div className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm">
              <Plus className="h-4 w-4" />
              Add Photos
            </div>
          </label>
        </div>

        {/* Thumbnail Strip */}
        {photos.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 overflow-x-auto">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentImageIndex
                    ? 'border-white'
                    : 'border-white/30 hover:border-white/60'
                }`}
              >
                <img
                  src={photo.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}