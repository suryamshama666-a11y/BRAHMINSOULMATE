
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSocialFeatures } from '@/hooks/useSocialFeatures';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose
}) => {
  const { createCommunityGroup } = useSocialFeatures();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_private: false
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    
    const result = await createCommunityGroup({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      is_private: formData.is_private
    });
    
    if (result.success) {
      // Reset form
      setFormData({
        name: '',
        description: '',
        is_private: false
      });
      onClose();
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Community Group</DialogTitle>
          <DialogDescription>
            Start a new community group to connect with like-minded people.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter group name..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what this group is about..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_private"
              checked={!formData.is_private}
              onCheckedChange={(checked) => handleInputChange('is_private', !checked)}
            />
            <Label htmlFor="is_private">Public Group</Label>
            <span className="text-sm text-gray-500">
              {!formData.is_private ? 'Anyone can find and join' : 'Invite only'}
            </span>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.name.trim() || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
