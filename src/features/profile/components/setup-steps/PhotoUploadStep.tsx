import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Trash2, Star, Camera, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type Photo = {
  id: string;
  url: string;
  file?: File;
  isProfilePicture: boolean;
  uploadedAt: Date;
};

type PhotoUploadStepProps = {
  data: {
    photos: Photo[];
  };
  onUpdate: (data: any) => void;
  onComplete: (isCompleted: boolean) => void;
};

export default function PhotoUploadStep({ data, onUpdate, onComplete }: PhotoUploadStepProps) {
  const [photos, setPhotos] = useState<Photo[]>(data.photos || []);
  const [uploading, setUploading] = useState(false);

  const maxPhotos = 10;
  const minPhotos = 1;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      toast.error(`You can upload maximum ${maxPhotos} photos`);
      return;
    }

    setUploading(true);

    // Convert files to photo objects
    const newPhotos: Photo[] = Array.from(files).map((file, index) => ({
      id: `photo-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      file,
      isProfilePicture: photos.length === 0 && index === 0, // First photo becomes profile picture
      uploadedAt: new Date()
    }));

    const updatedPhotos = [...photos, ...newPhotos];
    setPhotos(updatedPhotos);
    updateData(updatedPhotos);
    setUploading(false);

    toast.success(`${files.length} photo(s) uploaded successfully!`);
  };

  const handleSetProfilePicture = (photoId: string) => {
    const updatedPhotos = photos.map(photo => ({
      ...photo,
      isProfilePicture: photo.id === photoId
    }));
    setPhotos(updatedPhotos);
    updateData(updatedPhotos);
    toast.success('Profile picture updated successfully!');
  };

  const handleDeletePhoto = (photoId: string) => {
    const photoToDelete = photos.find(p => p.id === photoId);
    if (photoToDelete?.isProfilePicture && photos.length > 1) {
      // If deleting profile picture, set the first remaining photo as profile picture
      const updatedPhotos = photos
        .filter(p => p.id !== photoId)
        .map((photo, index) => ({
          ...photo,
          isProfilePicture: index === 0
        }));
      setPhotos(updatedPhotos);
      updateData(updatedPhotos);
    } else {
      const updatedPhotos = photos.filter(p => p.id !== photoId);
      setPhotos(updatedPhotos);
      updateData(updatedPhotos);
    }
    
    toast.success('Photo deleted successfully');
  };

  const updateData = (updatedPhotos: Photo[]) => {
    const newData = { photos: updatedPhotos };
    onUpdate(newData);
    
    // Check completion - at least 1 photo required
    const isCompleted = updatedPhotos.length >= minPhotos;
    onComplete(isCompleted);
  };

  const profilePicture = photos.find(p => p.isProfilePicture) || photos[0];

  return (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      {profilePicture && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold">Profile Picture</h3>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={profilePicture.url}
                  alt="Profile Picture"
                  className="w-32 h-32 rounded-lg object-cover border-2 border-red-500"
                />
                <Badge className="absolute -top-2 -right-2 bg-red-500">
                  <Star className="h-3 w-3" />
                </Badge>
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-2">This is your main profile picture</h4>
                <p className="text-sm text-gray-600 mb-3">
                  This is the first image others will see. Make sure it's a clear, recent photo where your face is clearly visible.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    Change Photo
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">Upload Profile Pics ({photos.length}/{maxPhotos})</h3>
          </div>

          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="photo-upload"
                disabled={photos.length >= maxPhotos || uploading}
              />
              <label
                htmlFor="photo-upload"
                className={`cursor-pointer ${photos.length >= maxPhotos || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Camera className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                <h4 className="text-xl font-semibold mb-2 text-blue-900">
                  {photos.length === 0 ? 'Upload Profile Pictures' : 'Add More Photos'}
                </h4>
                <p className="text-blue-800 mb-4">
                  {photos.length >= maxPhotos
                    ? `Maximum ${maxPhotos} photos reached`
                    : uploading
                      ? 'Uploading...'
                      : 'Take a photo or choose from gallery'
                  }
                </p>
                <div className="flex justify-center gap-4">
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    📷 Camera
                  </div>
                  <div className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                    🖼️ Gallery
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-4">
                  JPG, PNG up to 5MB each • Minimum {minPhotos} photo required
                </p>
              </label>
            </div>

            {/* Photo Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Photo Guidelines
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Upload clear, recent photos where your face is visible</li>
                <li>• Avoid group photos, sunglasses, or heavily filtered images</li>
                <li>• Include a mix of close-up and full-body photos</li>
                <li>• Professional or semi-formal photos work best</li>
                <li>• All photos will be verified before going live</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Photos</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                    <Badge className="absolute top-2 left-2 bg-red-500 text-xs">
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
                    <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">Add Photo</p>
                  </div>
                </label>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Status */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h4 className="font-medium mb-2">Photo Requirements</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${photos.length >= minPhotos ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">
              Minimum {minPhotos} photo ({photos.length >= minPhotos ? 'Complete' : `${photos.length}/${minPhotos}`})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${photos.some(p => p.isProfilePicture) ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">
              Profile picture set ({photos.some(p => p.isProfilePicture) ? 'Complete' : 'Incomplete'})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${photos.length >= 3 ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm">
              Recommended: 3+ photos ({photos.length >= 3 ? 'Complete' : `${photos.length}/3`})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
