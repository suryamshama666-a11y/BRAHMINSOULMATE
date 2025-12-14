import React, { useState, useEffect } from 'react';
import { X, Star, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(photos[0] || null);
  const [localPhotos, setLocalPhotos] = useState(photos);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Hide navbar and other elements
      const navbar = document.querySelector('nav');
      if (navbar) {
        (navbar as HTMLElement).style.display = 'none';
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
      // Restore navbar
      const navbar = document.querySelector('nav');
      if (navbar) {
        (navbar as HTMLElement).style.display = '';
      }
    };
  }, [isOpen]);

  useEffect(() => {
    setLocalPhotos(photos);
    if (photos.length > 0 && !selectedPhoto) {
      setSelectedPhoto(photos[0]);
    }
  }, [photos]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onUpload(files);
      toast.success(`${files.length} photo(s) uploaded!`);
    }
  };

  const handleSetProfilePic = (photoId: string) => {
    setLocalPhotos(prev => 
      prev.map(p => ({ ...p, isProfilePicture: p.id === photoId }))
    );
    onSetProfilePicture(photoId);
    toast.success('Profile picture updated!');
  };

  const handleDelete = (photoId: string) => {
    onDelete(photoId);
    const remaining = localPhotos.filter(p => p.id !== photoId);
    if (selectedPhoto?.id === photoId && remaining.length > 0) {
      setSelectedPhoto(remaining[0]);
    }
    toast.success('Photo deleted');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-amber-600 px-6 py-4 flex items-center justify-between shadow-md relative">
        <div>
          <h2 className="text-xl font-semibold text-white">{profileName}'s Photo Gallery</h2>
          <p className="text-sm text-white/90">{localPhotos.length} Photos</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium cursor-pointer flex items-center gap-2 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="h-4 w-4" />
            Add Photos
          </label>
        </div>
        <button
          onClick={onClose}
          className="absolute -bottom-4 right-6 bg-white text-gray-700 hover:bg-gray-100 rounded-full p-2 shadow-lg z-10"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Photo Grid Sidebar */}
        <div className="w-72 bg-gray-50 border-r overflow-y-auto p-4">
          <div className="space-y-3">
            {localPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className={`relative rounded-lg overflow-hidden cursor-pointer border-2 ${
                  selectedPhoto?.id === photo.id
                    ? 'border-red-500 shadow-lg'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="aspect-square">
                  <img
                    src={photo.url}
                    alt="Photo"
                    className="w-full h-full object-cover"
                  />
                </div>
                {photo.isProfilePicture && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Profile
                  </div>
                )}
              </div>
            ))}
            
            {/* Upload Button */}
            <label className="block aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-red-400 cursor-pointer bg-white hover:bg-red-50 flex flex-col items-center justify-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600 font-medium">Add Photos</span>
            </label>
          </div>
        </div>

        {/* Main Display Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-100 relative">
          {selectedPhoto ? (
            <>
              {/* Carousel Navigation */}
              {localPhotos.length > 1 && (
                <>
                  {/* Navigation arrows removed as per request */}
                  {/* 
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = localPhotos.findIndex(p => p.id === selectedPhoto.id);
                      const prevIndex = currentIndex === 0 ? localPhotos.length - 1 : currentIndex - 1;
                      setSelectedPhoto(localPhotos[prevIndex]);
                    }}
                    className="absolute left-8 top-1/2 w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-50 rounded-full shadow-lg z-10"
                    style={{ transform: 'translateY(-50%)' }}
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = localPhotos.findIndex(p => p.id === selectedPhoto.id);
                      const nextIndex = currentIndex === localPhotos.length - 1 ? 0 : currentIndex + 1;
                      setSelectedPhoto(localPhotos[nextIndex]);
                    }}
                    className="absolute right-8 top-1/2 w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-50 rounded-full shadow-lg z-10"
                    style={{ transform: 'translateY(-50%)' }}
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  */}
                </>
              )}
              
              <div className="w-full max-w-md mb-6">
                <div className="relative pb-[120%] rounded-lg overflow-hidden shadow-2xl">
                  <img
                    src={selectedPhoto.url}
                    alt={profileName}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleSetProfilePic(selectedPhoto.id)}
                  className={selectedPhoto.isProfilePicture ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}
                  disabled={selectedPhoto.isProfilePicture}
                >
                  <Star className="h-4 w-4 mr-2" />
                  {selectedPhoto.isProfilePicture ? 'Current Profile Picture' : 'Set as Profile Picture'}
                </Button>
                <Button
                  onClick={() => handleDelete(selectedPhoto.id)}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Photo
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">
              <p>No photos to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}