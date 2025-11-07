import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lightbulb, User, Heart, Target } from 'lucide-react';

type AboutMeStepProps = {
  data: {
    introduction: string;
    hobbies: string[];
    interests: string[];
    lifeGoals: string;
    personalityTraits: string[];
  };
  onUpdate: (data: any) => void;
  onComplete: (isCompleted: boolean) => void;
};

const SUGGESTED_HOBBIES = [
  'Reading', 'Traveling', 'Cooking', 'Music', 'Dancing', 'Photography', 
  'Yoga', 'Meditation', 'Sports', 'Movies', 'Art', 'Gardening',
  'Writing', 'Swimming', 'Hiking', 'Painting', 'Singing', 'Chess'
];

const PERSONALITY_TRAITS = [
  'Caring', 'Ambitious', 'Funny', 'Intelligent', 'Spiritual', 'Family-oriented',
  'Traditional', 'Modern', 'Adventurous', 'Calm', 'Outgoing', 'Introverted',
  'Optimistic', 'Practical', 'Creative', 'Honest', 'Loyal', 'Independent'
];

export default function AboutMeStep({ data, onUpdate, onComplete }: AboutMeStepProps) {
  const [introduction, setIntroduction] = useState(data.introduction || '');
  const [hobbies, setHobbies] = useState<string[]>(data.hobbies || []);
  const [interests, setInterests] = useState<string[]>(data.interests || []);
  const [lifeGoals, setLifeGoals] = useState(data.lifeGoals || '');
  const [personalityTraits, setPersonalityTraits] = useState<string[]>(data.personalityTraits || []);
  const [customHobby, setCustomHobby] = useState('');

  const handleIntroductionChange = (value: string) => {
    setIntroduction(value);
    updateData({ introduction: value });
  };

  const handleLifeGoalsChange = (value: string) => {
    setLifeGoals(value);
    updateData({ lifeGoals: value });
  };

  const toggleHobby = (hobby: string) => {
    const newHobbies = hobbies.includes(hobby)
      ? hobbies.filter(h => h !== hobby)
      : [...hobbies, hobby];
    setHobbies(newHobbies);
    updateData({ hobbies: newHobbies });
  };

  const togglePersonalityTrait = (trait: string) => {
    const newTraits = personalityTraits.includes(trait)
      ? personalityTraits.filter(t => t !== trait)
      : [...personalityTraits, trait];
    setPersonalityTraits(newTraits);
    updateData({ personalityTraits: newTraits });
  };

  const addCustomHobby = () => {
    if (customHobby.trim() && !hobbies.includes(customHobby.trim())) {
      const newHobbies = [...hobbies, customHobby.trim()];
      setHobbies(newHobbies);
      updateData({ hobbies: newHobbies });
      setCustomHobby('');
    }
  };

  const updateData = (updates: any) => {
    const newData = { introduction, hobbies, interests, lifeGoals, personalityTraits, ...updates };
    onUpdate(newData);
    
    // Check completion
    const isCompleted = newData.introduction.length >= 100 && 
                       newData.hobbies.length >= 3 && 
                       newData.personalityTraits.length >= 3;
    onComplete(isCompleted);
  };

  const characterCount = introduction.length;
  const maxCharacters = 1000;
  const minCharacters = 100;

  return (
    <div className="space-y-6">
      {/* Introduction Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">Tell Us About Yourself</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="introduction">Introduction *</Label>
              <Textarea
                id="introduction"
                placeholder="Write a compelling introduction about yourself. Share your values, what makes you unique, your background, and what you're passionate about..."
                value={introduction}
                onChange={(e) => handleIntroductionChange(e.target.value)}
                className="min-h-[120px] mt-2"
                maxLength={maxCharacters}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  Minimum {minCharacters} characters required
                </p>
                <p className={`text-sm ${characterCount < minCharacters ? 'text-red-500' : 'text-gray-500'}`}>
                  {characterCount}/{maxCharacters}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Writing Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Share your values and what's important to you</li>
                    <li>• Mention your cultural background and traditions</li>
                    <li>• Talk about your career and aspirations</li>
                    <li>• Include what makes you happy and fulfilled</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hobbies & Interests */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">Hobbies & Interests</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Select Your Hobbies * (Choose at least 3)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SUGGESTED_HOBBIES.map((hobby) => (
                  <Badge
                    key={hobby}
                    variant={hobbies.includes(hobby) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      hobbies.includes(hobby) 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'hover:border-red-600 hover:text-red-600'
                    }`}
                    onClick={() => toggleHobby(hobby)}
                  >
                    {hobby}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add custom hobby"
                value={customHobby}
                onChange={(e) => setCustomHobby(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomHobby()}
              />
              <Button onClick={addCustomHobby} variant="outline">
                Add
              </Button>
            </div>

            {hobbies.length > 0 && (
              <div>
                <Label>Selected Hobbies ({hobbies.length})</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {hobbies.map((hobby) => (
                    <Badge key={hobby} className="bg-red-600">
                      {hobby}
                      <button
                        onClick={() => toggleHobby(hobby)}
                        className="ml-2 hover:text-red-200"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personality Traits */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">Personality Traits</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label>How would you describe yourself? * (Choose at least 3)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PERSONALITY_TRAITS.map((trait) => (
                  <Badge
                    key={trait}
                    variant={personalityTraits.includes(trait) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      personalityTraits.includes(trait) 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'hover:border-red-600 hover:text-red-600'
                    }`}
                    onClick={() => togglePersonalityTrait(trait)}
                  >
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>

            {personalityTraits.length > 0 && (
              <div>
                <Label>Selected Traits ({personalityTraits.length})</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {personalityTraits.map((trait) => (
                    <Badge key={trait} className="bg-red-600">
                      {trait}
                      <button
                        onClick={() => togglePersonalityTrait(trait)}
                        className="ml-2 hover:text-red-200"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Life Goals */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="lifeGoals">Life Goals & Aspirations</Label>
              <Textarea
                id="lifeGoals"
                placeholder="Share your dreams, aspirations, and what you hope to achieve in life..."
                value={lifeGoals}
                onChange={(e) => handleLifeGoalsChange(e.target.value)}
                className="min-h-[80px] mt-2"
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-1">
                {lifeGoals.length}/500 characters
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Status */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h4 className="font-medium mb-2">Section Completion</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${introduction.length >= minCharacters ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">Introduction ({characterCount >= minCharacters ? 'Complete' : 'Incomplete'})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${hobbies.length >= 3 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">Hobbies ({hobbies.length >= 3 ? 'Complete' : `${hobbies.length}/3`})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${personalityTraits.length >= 3 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">Personality Traits ({personalityTraits.length >= 3 ? 'Complete' : `${personalityTraits.length}/3`})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
