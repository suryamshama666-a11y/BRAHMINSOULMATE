import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Trash2, Star, Camera, Plus } from 'lucide-react';
import { toast } from 'sonner';

type Photo = {
  id: string;
  url: string;
  isProfilePicture: boolean;
  uploadedAt: Date;
};

type PhotoManagerProps = {
  photos: Photo[];
  onUpload: (files: FileList) => void;
  onDelete: (photoId: string) => void;
  onSetProfilePicture: (photoId: string) => void;
  onReorder: (photos: Photo[]) => void;
  maxPhotos?: number;
};

export default function PhotoManager({ 
  photos, 
  onUpload, 
  onDelete, 
  onSetProfilePicture, 
  _onReorder,
  maxPhotos = 10 
}: PhotoManagerProps) {
  const [_draggedPhoto, _setDraggedPhoto] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (photos.length + files.length > maxPhotos) {
        toast.error(`You can upload maximum ${maxPhotos} photos`);
        return;
      }
      onUpload(files);
    }
  };

  const handleSetProfilePicture = (photoId: string) => {
    onSetProfilePicture(photoId);
    toast.success('Profile picture updated successfully!');
  };

  const handleDeletePhoto = (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (photo?.isProfilePicture && photos.length > 1) {
      toast.error('Please set another photo as profile picture before deleting this one');
      return;
    }
    onDelete(photoId);
    toast.success('Photo deleted successfully');
  };

  const profilePicture = photos.find(p => p.isProfilePicture) || photos[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          View Photos ({photos.length}/{maxPhotos})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture Section */}
        {profilePicture && (
          <div>
            <h3 className="font-medium mb-3">Profile Picture</h3>
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={profilePicture.url}
                  alt="Profile Picture"
                  className="w-24 h-24 rounded-lg object-cover border-2 border-red-500"
                />
                <Badge className="absolute -top-2 -right-2 bg-red-500">
                  <Star className="h-3 w-3" />
                </Badge>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  This is your main profile picture that others will see first.
                </p>
                <p className="text-xs text-gray-500">
                  Choose a clear, recent photo where your face is clearly visible.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div>
          <h3 className="font-medium mb-3">Upload New Photos</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="photo-upload"
              disabled={photos.length >= maxPhotos}
            />
            <label
              htmlFor="photo-upload"
              className={`cursor-pointer ${photos.length >= maxPhotos ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                {photos.length >= maxPhotos 
                  ? `Maximum ${maxPhotos} photos reached`
                  : 'Click to upload photos or drag and drop'
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG up to 5MB each
              </p>
            </label>
          </div>
        </div>

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">All Photos</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300"
                >
                  <img
                    src={photo.url}
                    alt="Profile photo"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Profile Picture Badge */}
                  {photo.isProfilePicture && (
                    <Badge className="absolute top-1 left-1 bg-red-500 text-xs">
                      <Star className="h-2 w-2 mr-1" />
                      Main
                    </Badge>
                  )}

                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-1">
                      {!photo.isProfilePicture && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSetProfilePicture(photo.id)}
                          className="h-8 w-8 p-0"
                          title="Set as profile picture"
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="h-8 w-8 p-0"
                        title="Delete photo"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add More Photos Button */}
              {photos.length < maxPhotos && (
                <label
                  htmlFor="photo-upload"
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <div className="text-center">
                    <Plus className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                    <p className="text-xs text-gray-500">Add Photo</p>
                  </div>
                </label>
              )}
            </div>
          </div>
        )}

        {/* Photo Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Photo Guidelines</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload clear, recent photos where your face is visible</li>
            <li>• Avoid group photos, sunglasses, or heavily filtered images</li>
            <li>• Include a mix of close-up and full-body photos</li>
            <li>• Professional or semi-formal photos work best</li>
            <li>• All photos will be verified before going live</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
