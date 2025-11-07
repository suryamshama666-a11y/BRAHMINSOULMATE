
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/types/profile';
import { Heart, Images } from 'lucide-react';
import PhotoAlbum from './PhotoAlbum';

type ProfileImageGalleryProps = {
  profile: Profile;
};

export default function ProfileImageGallery({ profile }: ProfileImageGalleryProps) {
  const [showPhotoAlbum, setShowPhotoAlbum] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Convert profile images to Photo objects
  const photos = profile.images.map((url, index) => ({
    id: `photo-${index}`,
    url,
    isProfilePicture: index === 0, // First image is the profile picture by default
    uploadedAt: new Date()
  }));

  const handlePhotoUpload = (files: FileList) => {
    // Mock implementation - in real app, this would upload to server
    console.log('Uploading photos:', files);
  };

  const handlePhotoDelete = (photoId: string) => {
    // Mock implementation - in real app, this would delete from server
    console.log('Deleting photo:', photoId);
  };

  const handleSetProfilePicture = (photoId: string) => {
    // Mock implementation - in real app, this would update server
    console.log('Setting profile picture:', photoId);
  };
  
  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            {/* Main Image */}
            <div className="relative pb-[120%]"> {/* 5:6 aspect ratio for portrait */}
              <img
                src={profile.images[0] || '/placeholder.svg'}
                alt={profile.name}
                className="absolute inset-0 w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => setShowPhotoAlbum(true)}
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />

              {/* Verification Badge */}
              {profile.isVerified && (
                <Badge className="absolute top-4 right-4 bg-green-500 hover:bg-green-600">
                  ✓ Verified
                </Badge>
              )}

              {/* Image counter */}
              {profile.images.length > 1 && (
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {profile.images.length} Photos
                </div>
              )}

              {/* Quick action button */}
              <Button
                size="icon"
                className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 shadow-lg transition-all border-2 border-red-500"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`h-4 w-4 transition-all ${
                  isLiked ? 'fill-red-500 text-red-500' : 'fill-white text-red-500'
                }`} />
              </Button>
            </div>
          </div>

          {/* View Album Link - always show for photo management */}
          <div className="p-4 space-y-2">
            <Button
              onClick={() => setShowPhotoAlbum(true)}
              className="w-full flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium py-3"
            >
              <Images className="h-5 w-5" />
              View Photos ({profile.images.length})
            </Button>
            <p className="text-xs text-center text-gray-500">
              View, edit, delete and organize your photos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Photo Album Modal */}
      {showPhotoAlbum && (
        <PhotoAlbum
          photos={photos}
          profileName={profile.name}
          isOpen={showPhotoAlbum}
          onClose={() => setShowPhotoAlbum(false)}
          onDelete={handlePhotoDelete}
          onUpload={handlePhotoUpload}
          onSetProfilePicture={handleSetProfilePicture}
        />
      )}
    </>
  );
}
