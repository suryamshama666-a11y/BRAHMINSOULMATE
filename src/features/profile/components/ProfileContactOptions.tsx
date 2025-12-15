import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Video, Calendar, Phone, Upload, Trash2 } from 'lucide-react';
import { Profile } from '@/types/profile';
import { useProfileInteractions } from '../hooks/useProfileInteractions';
import { toast } from 'sonner';

type ProfileContactOptionsProps = {
  profile: Profile;
};

export default function ProfileContactOptions({ profile }: ProfileContactOptionsProps) {
  const [liked, setLiked] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { 
    handleMessage, 
    handleVideoCall, 
    handlePhone, 
    handleCalendar 
  } = useProfileInteractions(profile);
  
  const handleLike = () => {
    setLiked(!liked);
    if (!liked) {
      toast.success(`You liked ${profile.name}'s profile!`, {
        position: "top-center",
        duration: 2000,
      });
    } else {
      toast.info(`You unliked ${profile.name}'s profile`, {
        position: "top-center",
        duration: 2000,
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload process
      setTimeout(() => {
        setIsUploading(false);
        toast.success('Image uploaded successfully!');
      }, 2000);
    }
  };

  const handleImageDelete = (imageIndex: number) => {
    toast.success(`Image ${imageIndex + 1} deleted successfully!`);
  };
  
  return (
    <div className="space-y-4">
      <Card className="rounded-2xl bg-gradient-to-br from-white via-red-50/20 to-amber-50/30 border-2 border-red-100/50 shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">Contact Options</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleLike}
              className={`contact-button flex items-center justify-center h-12 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold
                ${liked 
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-red-300/50' 
                  : 'bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-600'}`}
            >
              <Heart className={`h-5 w-5 transition-all duration-300 ${liked ? 'fill-white animate-pulse' : 'fill-red-400'}`} />
              <span className="ml-2">{liked ? 'Liked' : 'Like'}</span>
            </Button>
            
            <Button
              onClick={handleMessage}
              className="contact-button flex items-center justify-center h-12 rounded-full 
                bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white 
                hover:shadow-lg shadow-md shadow-amber-300/50 transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <MessageCircle className="h-5 w-5 fill-white" />
              <span className="ml-2">Message</span>
            </Button>
            
            <Button
              onClick={handleVideoCall}
              className="contact-button flex items-center justify-center h-12 rounded-full 
                bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white 
                hover:shadow-lg shadow-md shadow-red-400/50 transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <Video className="h-5 w-5 fill-white" />
              <span className="ml-2">Video</span>
            </Button>
            
            <Button
              onClick={handlePhone}
              className="contact-button flex items-center justify-center h-12 rounded-full 
                bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white 
                hover:shadow-lg shadow-md shadow-amber-400/50 transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <Phone className="h-5 w-5 fill-white" />
              <span className="ml-2">Call</span>
            </Button>
            
            <Button
              onClick={handleCalendar}
              className="contact-button flex items-center justify-center h-12 col-span-2 rounded-full 
                bg-gradient-to-r from-red-500 via-amber-500 to-red-500 hover:from-red-600 hover:via-amber-600 hover:to-red-600 text-white 
                hover:shadow-lg shadow-md shadow-red-300/50 transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <Calendar className="h-5 w-5 fill-white" />
              <span className="ml-2">Schedule Meeting</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Image Management Card */}
      <Card className="rounded-2xl bg-gradient-to-br from-white via-blue-50/20 to-green-50/30 border-2 border-blue-100/50 shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">View Photos</h3>
          
          {/* Upload Section */}
          <div className="mb-4">
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex items-center justify-center h-12 rounded-full 
                bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white 
                hover:shadow-lg shadow-md transition-all duration-300 transform hover:scale-105 font-semibold">
                <Upload className="h-5 w-5 mr-2" />
                <span>{isUploading ? 'Uploading...' : 'Upload Profile Pic'}</span>
              </div>
            </label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* Current Images */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Current Photos ({profile.images.length})</h4>
            <div className="grid grid-cols-2 gap-2">
              {profile.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image || '/placeholder.svg'}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleImageDelete(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}