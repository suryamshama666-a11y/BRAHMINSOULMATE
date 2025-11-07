
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, Plus } from 'lucide-react';
import { useSuccessStories } from '@/hooks/useSuccessStories';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { format } from 'date-fns';

interface SuccessStoriesTabProps {
  onSubmitStory: () => void;
}

export const SuccessStoriesTab: React.FC<SuccessStoriesTabProps> = ({ onSubmitStory }) => {
  const { user } = useSupabaseAuth();
  const { stories, loading } = useSuccessStories();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 
            className="text-2xl font-semibold"
            style={{ color: '#E30613' }}
          >
            Success Stories
          </h2>
          <p className="text-gray-600">Celebrate love stories from our community</p>
        </div>
        {user && (
          <Button 
            onClick={onSubmitStory}
            style={{ backgroundColor: '#E30613' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Share Your Story
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading success stories...</div>
        ) : stories.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">
              No success stories yet. Be the first to share!
            </p>
          </div>
        ) : (
          stories.map((story) => (
            <Card key={story.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{story.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">{story.story}</p>

                <div className="space-y-2 text-sm text-gray-600">
                  {story.wedding_date && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Wedding: {format(new Date(story.wedding_date), 'MMMM yyyy')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
