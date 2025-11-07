
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';
import { ImageUpload } from './image-upload';

interface ImageGalleryProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onChange,
  maxImages = 6,
  className = ""
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);

  const addImage = (url: string) => {
    if (images.length < maxImages) {
      onChange([...images, url]);
      setShowUpload(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    if (activeIndex >= newImages.length && newImages.length > 0) {
      setActiveIndex(newImages.length - 1);
    }
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0 && !showUpload) {
    return (
      <div className={className}>
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">No images added yet</p>
            <Button onClick={() => setShowUpload(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Image
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showUpload) {
    return (
      <div className={className}>
        <ImageUpload
          onChange={addImage}
          placeholder="Add image to gallery"
        />
        <Button
          variant="outline"
          onClick={() => setShowUpload(false)}
          className="mt-2"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Main Image Display */}
      <Card className="mb-4">
        <CardContent className="p-0 relative">
          <div className="relative pb-[66.67%]"> {/* 3:2 aspect ratio */}
            <img
              src={images[activeIndex]}
              alt={`Image ${activeIndex + 1}`}
              className="absolute inset-0 w-full h-full object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            
            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Remove button */}
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 w-8 h-8 p-0"
              onClick={() => removeImage(activeIndex)}
            >
              <X className="h-3 w-3" />
            </Button>

            {/* Image counter */}
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {activeIndex + 1} of {images.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-16 h-16 shrink-0 rounded-md overflow-hidden border-2 transition-all ${
              activeIndex === index ? 'border-red-500' : 'border-transparent'
            }`}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </button>
        ))}
        
        {/* Add more button */}
        {images.length < maxImages && (
          <button
            onClick={() => setShowUpload(true)}
            className="w-16 h-16 shrink-0 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
          >
            <Plus className="h-6 w-6 text-gray-400" />
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500 mt-2">
        {images.length} of {maxImages} images
      </p>
    </div>
  );
};
