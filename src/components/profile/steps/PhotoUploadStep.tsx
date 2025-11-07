
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';
import { ImageGallery } from '@/components/ui/image-gallery';

interface PhotoUploadStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
  loading: boolean;
}

export const PhotoUploadStep: React.FC<PhotoUploadStepProps> = ({
  data,
  onNext,
  onBack,
  canGoBack,
  isLastStep,
  loading
}) => {
  const [formData, setFormData] = useState({
    profile_picture_url: data.profile_picture_url || '',
    gallery_images: data.gallery_images || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <FormField 
          label="Profile Picture" 
          description="Your main profile photo that will be displayed to other users"
        >
          <ImageUpload
            value={formData.profile_picture_url}
            onChange={(url) => updateField('profile_picture_url', url)}
            onRemove={() => updateField('profile_picture_url', '')}
            placeholder="Upload your profile picture"
            className="max-w-sm"
          />
        </FormField>
      </div>

      <div>
        <FormField
          label="Photo Gallery"
          description="Add up to 6 additional photos to showcase your personality and interests"
        >
          <ImageGallery
            images={formData.gallery_images}
            onChange={(images) => updateField('gallery_images', images)}
            maxImages={6}
          />
        </FormField>
      </div>

      {/* Photo Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">Photo Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use clear, recent photos that show your face clearly</li>
            <li>• Include a variety of photos: formal, casual, hobbies, travel</li>
            <li>• Avoid group photos where you're hard to identify</li>
            <li>• Natural lighting works best for photos</li>
            <li>• Smile! It makes you more approachable</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={!canGoBack}
        >
          Back
        </Button>
        <Button type="submit" disabled={loading}>
          {isLastStep ? 'Complete Profile' : 'Next'}
        </Button>
      </div>
    </form>
  );
};
