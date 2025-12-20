
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Unlock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface NameVisibilityToggleProps {
  isFullNameVisible: boolean;
  onToggle: (value: boolean) => void;
}

export default function NameVisibilityToggle({ 
  isFullNameVisible, 
  onToggle 
}: NameVisibilityToggleProps) {
  const { isAuthenticated, isPremium } = useAuth();
  
  const handleToggle = (checked: boolean) => {
    if (!isAuthenticated) {
      toast.error("Please login to change name visibility settings");
      return;
    }
    
    if (!isPremium && checked) {
      toast.error("Full name visibility requires a premium subscription");
      return;
    }
    
    onToggle(checked);
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Name Privacy Settings</CardTitle>
        <CardDescription>
          Control how your name appears to other users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="name-visibility">Show Full Name</Label>
            <div className="text-sm text-muted-foreground flex items-center">
              {isFullNameVisible ? (
                <Unlock className="h-3.5 w-3.5 mr-1 text-green-500" />
              ) : (
                <Lock className="h-3.5 w-3.5 mr-1 text-amber-500" />
              )}
              {isFullNameVisible 
                ? "Your full name is visible to all users" 
                : "Only your first name initial and last name are visible to non-premium users"}
            </div>
          </div>
          <Switch
            id="name-visibility"
            checked={isFullNameVisible}
            onCheckedChange={handleToggle}
            disabled={!isAuthenticated || (!isPremium && !isFullNameVisible)}
          />
        </div>
        
        {!isPremium && (
          <div className="mt-4 pt-4 border-t text-sm">
            <p className="text-muted-foreground">
              <Lock className="h-3.5 w-3.5 inline mr-1" />
              <span className="font-medium">Premium Feature:</span> Full name visibility control is only available to premium subscribers.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
