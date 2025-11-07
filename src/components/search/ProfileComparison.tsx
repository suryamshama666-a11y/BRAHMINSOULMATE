import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { Profile } from '@/types/profile';

interface ProfileComparisonProps {
  profiles: Profile[];
  onClose: () => void;
  onRemoveProfile: (profileId: string) => void;
  className?: string;
}

export const ProfileComparison: React.FC<ProfileComparisonProps> = ({
  profiles,
  onClose,
  onRemoveProfile,
  className = ''
}) => {
  // Define the attributes to compare
  const attributesToCompare = [
    { label: 'Age', key: 'age' },
    { label: 'Height', key: 'height', formatter: (val: number) => `${val} cm` },
    { label: 'Location', key: 'location', formatter: (val: any) => val?.city || 'N/A' },
    { label: 'Education', key: 'education', formatter: (val: any[]) => val?.[0]?.degree || 'N/A' },
    { label: 'Profession', key: 'employment', formatter: (val: any) => val?.profession || 'N/A' },
    { label: 'Religion', key: 'family', formatter: (val: any) => val?.religion || 'N/A' },
    { label: 'Marital Status', key: 'maritalStatus' },
    { label: 'Verified', key: 'isVerified', formatter: (val: boolean) => val ? 'Yes' : 'No' },
  ];

  // Helper function to get attribute value
  const getAttributeValue = (profile: Profile, attr: { key: string, formatter?: (val: any) => string }) => {
    const value = profile[attr.key as keyof Profile];
    return attr.formatter ? attr.formatter(value) : value;
  };

  if (profiles.length === 0) {
    return null;
  }

  return (
    <Card className={`border-2 border-amber-200 ${className}`}>
      <CardHeader className="bg-orange-50 pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Compare Profiles</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left text-sm font-medium text-gray-500">Attribute</th>
              {profiles.map(profile => (
                <th key={profile.id} className="p-3 text-left min-w-[200px]">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{profile.name}</div>
                      <div className="text-xs text-gray-500">{profile.age} years</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onRemoveProfile(profile.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attributesToCompare.map((attr, index) => (
              <tr key={attr.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-3 text-sm font-medium text-gray-500">{attr.label}</td>
                {profiles.map(profile => {
                  const value = getAttributeValue(profile, attr);
                  return (
                    <td key={`${profile.id}-${attr.key}`} className="p-3">
                      {attr.key === 'isVerified' ? (
                        <div className="flex items-center">
                          {value === 'Yes' ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400 mr-1" />
                          )}
                          {value}
                        </div>
                      ) : (
                        <span>{value}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default ProfileComparison; 