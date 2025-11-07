
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Link, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  placeholder?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  placeholder = "Upload image",
  className = ""
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
      toast.success('Image URL added successfully!');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);

    try {
      // For now, we'll use a placeholder service
      // In a real app, you'd upload to your storage service
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange(result);
        toast.success('Image uploaded successfully!');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload image');
      setIsUploading(false);
    }
  };

  if (value) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="relative">
            <img
              src={value}
              alt="Uploaded image"
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
                toast.error('Failed to load image');
              }}
            />
            {onRemove && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 w-8 h-8 p-0"
                onClick={onRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {showUrlInput ? (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <Input
                placeholder="Enter image URL..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <div className="flex gap-2">
                <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
                  Add Image
                </Button>
                <Button variant="outline" onClick={() => setShowUrlInput(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">{placeholder}</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload File'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUrlInput(true)}
                className="flex items-center gap-2"
              >
                <Link className="h-4 w-4" />
                Add URL
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
