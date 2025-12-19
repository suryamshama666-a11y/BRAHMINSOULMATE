
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useCompatibility } from '@/hooks/useCompatibility';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Star, Heart, Calculator, Sparkles } from 'lucide-react';

interface CompatibilityScoreProps {
  targetUserId: string;
  targetUserName: string;
}

export const CompatibilityScore: React.FC<CompatibilityScoreProps> = ({
  targetUserId,
  targetUserName
}) => {
  const { user } = useSupabaseAuth();
  const { calculateCompatibility, getCompatibilityScore, loading } = useCompatibility();
  const [compatibilityData, setCompatibilityData] = useState<any>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  useEffect(() => {
    loadExistingCompatibility();
  }, [targetUserId, user]);

  const loadExistingCompatibility = async () => {
    if (!user) return;
    const existing = await getCompatibilityScore(targetUserId);
    if (existing) {
      setCompatibilityData(existing);
      setHasCalculated(true);
    }
  };

  const handleCalculateCompatibility = async () => {
    if (!user) return;
    const score = await calculateCompatibility(user.id, targetUserId);
    if (score) {
      setCompatibilityData(score);
      setHasCalculated(true);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Average Match';
    return 'Poor Match';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Horoscope Compatibility
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasCalculated ? (
          <div className="text-center py-6">
            <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Calculate your horoscope compatibility with {targetUserName}
            </p>
            <Button 
              onClick={handleCalculateCompatibility} 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Calculating...' : 'Calculate Compatibility'}
            </Button>
          </div>
        ) : compatibilityData ? (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(compatibilityData.overall_score)}`}>
                {compatibilityData.overall_score}%
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {getScoreLabel(compatibilityData.overall_score)}
              </Badge>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Rashi Compatibility</span>
                  <span className="text-sm text-gray-600">{compatibilityData.rashi_compatibility}/25</span>
                </div>
                <Progress value={(compatibilityData.rashi_compatibility / 25) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Nakshatra Compatibility</span>
                  <span className="text-sm text-gray-600">{compatibilityData.nakshatra_compatibility}/25</span>
                </div>
                <Progress value={(compatibilityData.nakshatra_compatibility / 25) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Dosha Compatibility</span>
                  <span className="text-sm text-gray-600">{compatibilityData.dosha_compatibility}/25</span>
                </div>
                <Progress value={(compatibilityData.dosha_compatibility / 25) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Guna Milan Score</span>
                  <span className="text-sm text-gray-600">{compatibilityData.guna_milan_score}/25</span>
                </div>
                <Progress value={(compatibilityData.guna_milan_score / 25) * 100} className="h-2" />
              </div>
            </div>

            {/* Compatibility Details */}
            {compatibilityData.compatibility_details?.calculated_factors && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Key Factors
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Rashi Match:</span>
                    <Badge variant={compatibilityData.compatibility_details.calculated_factors.rashi_match ? "default" : "secondary"}>
                      {compatibilityData.compatibility_details.calculated_factors.rashi_match ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Manglik Compatibility:</span>
                    <Badge variant={compatibilityData.compatibility_details.calculated_factors.manglik_match ? "default" : "secondary"}>
                      {compatibilityData.compatibility_details.calculated_factors.manglik_match ? 'Compatible' : 'Needs Attention'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <Button 
                variant="outline"
                onClick={handleCalculateCompatibility}
                disabled={loading}
                size="sm"
              >
                Recalculate
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600">Unable to load compatibility data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
