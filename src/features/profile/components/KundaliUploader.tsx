
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

type KundaliPermission = 'private' | 'matches' | 'public';

interface KundaliUploaderProps {
  currentPermission?: KundaliPermission;
  onUploadSuccess?: (fileUrl: string, permission: KundaliPermission) => void;
  onClose?: () => void;
}

export default function KundaliUploader({ 
  currentPermission = 'private', 
  onUploadSuccess,
  onClose 
}: KundaliUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [permission, setPermission] = useState<KundaliPermission>(currentPermission);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type (PDF only)
      if (file.type !== 'application/pdf') {
        setUploadError('Only PDF files are accepted');
        setSelectedFile(null);
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setUploadError(null);
    }
  };
  
  const handleUpload = () => {
    if (!isAuthenticated) {
      toast.error("Please login to upload your kundali");
      return;
    }
    
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    
    // Simulate file upload
    setTimeout(() => {
      setIsUploading(false);
      // In a real implementation, this would be the URL returned from the server
      const fileUrl = URL.createObjectURL(selectedFile);
      toast.success('Kundali uploaded successfully!');
      
      if (onUploadSuccess) {
        onUploadSuccess(fileUrl, permission);
      }
    }, 2000);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload Your Kundali</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-4">
          <div className="flex justify-center">
            <Upload className="h-10 w-10 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm mb-2">Drag & drop your kundali PDF here, or</p>
            <div className="relative">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept=".pdf"
              />
              <Button variant="outline" className="w-full">Browse Files</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Max file size: 5MB. Accepted format: PDF
            </p>
          </div>
        </div>
        
        {selectedFile && (
          <div className="flex items-center space-x-2 bg-green-50 p-2 rounded">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <p className="text-sm font-medium">{selectedFile.name}</p>
          </div>
        )}
        
        {uploadError && (
          <div className="flex items-center space-x-2 bg-red-50 p-2 rounded">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-500">{uploadError}</p>
          </div>
        )}
        
        <div className="space-y-2">
          <Label>Privacy Settings</Label>
          <RadioGroup value={permission} onValueChange={(value) => setPermission(value as KundaliPermission)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="private" id="private" />
              <Label htmlFor="private">Private (Only visible to you)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="matches" id="matches" />
              <Label htmlFor="matches">Matches Only (Visible to your matches)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="public" />
              <Label htmlFor="public">Public (Visible to all users)</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Kundali'}
        </Button>
      </CardFooter>
    </Card>
  );
}
