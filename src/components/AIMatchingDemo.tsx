import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Heart, 
  Star, 
  TrendingUp, 
  Users, 
  MapPin, 
  GraduationCap,
  Briefcase,
  Calendar,
  Sparkles,
  Target,
  BarChart3
} from 'lucide-react';

interface AIMatchingDemoProps {
  userId?: string;
  onClose?: () => void;
}

const AIMatchingDemo: React.FC<AIMatchingDemoProps> = ({ userId, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const analysisSteps = [
    {
      title: "Analyzing Your Profile",
      description: "Processing your preferences, interests, and background",
      icon: <Users className="h-6 w-6" />,
      progress: 20,
      details: ["Age preferences", "Height requirements", "Education level", "Location preferences"]
    },
    {
      title: "Behavioral Pattern Recognition",
      description: "Learning from your interactions and viewing patterns",
      icon: <Brain className="h-6 w-6" />,
      progress: 40,
      details: ["Profile viewing history", "Interest patterns", "Message behavior", "Search preferences"]
    },
    {
      title: "Compatibility Calculation",
      description: "Computing multi-dimensional compatibility scores",
      icon: <BarChart3 className="h-6 w-6" />,
      progress: 60,
      details: ["Cultural compatibility", "Lifestyle alignment", "Family background", "Career compatibility"]
    },
    {
      title: "Astrological Analysis",
      description: "Incorporating Vedic astrology and horoscope matching",
      icon: <Star className="h-6 w-6" />,
      progress: 80,
      details: ["Rashi compatibility", "Nakshatra matching", "Guna milan", "Mangal dosha analysis"]
    },
    {
      title: "AI Ranking & Optimization",
      description: "Ranking matches using advanced machine learning",
      icon: <Sparkles className="h-6 w-6" />,
      progress: 100,
      details: ["Neural network scoring", "Preference weighting", "Success prediction", "Quality optimization"]
    }
  ];

  const mockResults = {
    totalProfiles: 1247,
    analyzedProfiles: 856,
    topMatches: 23,
    averageCompatibility: 87,
    factors: [
      { name: "Cultural Compatibility", score: 92, color: "bg-green-500" },
      { name: "Lifestyle Alignment", score: 85, color: "bg-blue-500" },
      { name: "Educational Match", score: 89, color: "bg-purple-500" },
      { name: "Family Background", score: 91, color: "bg-orange-500" },
      { name: "Astrological Match", score: 78, color: "bg-pink-500" },
      { name: "Location Proximity", score: 83, color: "bg-indigo-500" }
    ]
  };

  useEffect(() => {
    if (isAnalyzing && currentStep < analysisSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (isAnalyzing && currentStep === analysisSteps.length - 1) {
      const timer = setTimeout(() => {
        setAnalysisComplete(true);
        setIsAnalyzing(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, currentStep, analysisSteps.length]);

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setCurrentStep(0);
    setAnalysisComplete(false);
  };

  const resetDemo = () => {
    setIsAnalyzing(false);
    setCurrentStep(0);
    setAnalysisComplete(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-3">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-purple-800">AI Matching Engine Demo</CardTitle>
                <p className="text-purple-600">See how our AI finds your perfect matches</p>
              </div>
            </div>
            {onClose && (
              <Button variant="outline" onClick={onClose} size="sm">
                Close Demo
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Analysis Process */}
      {!analysisComplete && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span>AI Analysis Process</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isAnalyzing ? (
              <div className="text-center py-8">
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-4">
                  <Brain className="h-12 w-12 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ready to Analyze Your Matches</h3>
                <p className="text-gray-600 mb-6">Our AI will analyze thousands of profiles to find your best matches</p>
                <Button 
                  onClick={startAnalysis}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start AI Analysis
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Analysis Progress</span>
                    <span className="text-sm text-gray-500">{analysisSteps[currentStep].progress}%</span>
                  </div>
                  <Progress value={analysisSteps[currentStep].progress} className="h-3" />
                </div>

                {/* Current Step */}
                <Card className="border-2 border-purple-200 bg-purple-50">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-purple-600 rounded-full p-2 flex-shrink-0">
                        {analysisSteps[currentStep].icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-purple-800 mb-1">
                          {analysisSteps[currentStep].title}
                        </h3>
                        <p className="text-purple-600 mb-3">
                          {analysisSteps[currentStep].description}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {analysisSteps[currentStep].details.map((detail, index) => (
                            <div key={index} className="flex items-center text-sm text-purple-700">
                              <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                              {detail}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Previous Steps */}
                <div className="space-y-2">
                  {analysisSteps.slice(0, currentStep).map((step, index) => (
                    <div key={index} className="flex items-center space-x-3 text-sm text-gray-600">
                      <div className="bg-green-500 rounded-full p-1">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>✓ {step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {analysisComplete && (
        <div className="space-y-6">
          {/* Results Summary */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <TrendingUp className="h-6 w-6" />
                <span>AI Analysis Complete!</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{mockResults.totalProfiles}</div>
                  <div className="text-sm text-gray-600">Profiles Scanned</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{mockResults.analyzedProfiles}</div>
                  <div className="text-sm text-gray-600">Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{mockResults.topMatches}</div>
                  <div className="text-sm text-gray-600">Top Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{mockResults.averageCompatibility}%</div>
                  <div className="text-sm text-gray-600">Avg Compatibility</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compatibility Factors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span>Compatibility Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockResults.factors.map((factor, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">{factor.name}</span>
                      <Badge variant="secondary">{factor.score}%</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${factor.color} h-2 rounded-full transition-all duration-1000`}
                        style={{ width: `${factor.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-800">
                <Sparkles className="h-5 w-5" />
                <span>AI Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-purple-700">Key Strengths:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center text-green-700">
                      <Heart className="h-4 w-4 mr-2" />
                      Excellent cultural compatibility
                    </li>
                    <li className="flex items-center text-blue-700">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Strong educational alignment
                    </li>
                    <li className="flex items-center text-purple-700">
                      <Star className="h-4 w-4 mr-2" />
                      High astrological compatibility
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-purple-700">Recommendations:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center text-orange-700">
                      <MapPin className="h-4 w-4 mr-2" />
                      Consider expanding location radius
                    </li>
                    <li className="flex items-center text-indigo-700">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Update career preferences
                    </li>
                    <li className="flex items-center text-pink-700">
                      <Calendar className="h-4 w-4 mr-2" />
                      Stay active for better visibility
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={resetDemo}
              variant="outline"
              className="border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              Run Demo Again
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={() => window.location.href = '/matches?tab=ai'}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              View AI Matches
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMatchingDemo;