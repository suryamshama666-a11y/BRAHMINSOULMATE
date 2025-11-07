import React from "react";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heart, MessageCircle, Users, Star, Shield, BookOpen } from "lucide-react";

const Etiquette = () => {
  return (
    <div className="min-h-screen flex flex-col bg-orange-50/30">
      <div className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 
            className="text-4xl md:text-5xl font-serif font-bold mb-4"
            style={{ color: '#E30613' }}
          >
            Brahmin Etiquette Guidelines
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Honoring our traditions while building meaningful relationships in the modern world
          </p>
        </div>
        
        <Card className="mb-8 border-2 border-primary/20 bg-white shadow-lg">
          <CardHeader className="bg-orange-50 border-b border-primary/20">
            <CardTitle className="text-2xl font-bold text-primary flex items-center">
              <Heart className="h-6 w-6 mr-3 text-primary" />
              Welcome to Our Community
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-gray-700 mb-6 text-lg leading-relaxed">
              At BrahminSoulmate, we respect and honor the traditions and values of the Brahmin community.
              We encourage respectful communication and adherence to traditional etiquette while using our platform.
              Here are some guidelines to help you navigate your matrimonial journey with dignity and respect.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-primary/20">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-primary">Communication</h3>
                <p className="text-sm text-gray-600">Respectful dialogue</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-primary/20">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-primary">Community</h3>
                <p className="text-sm text-gray-600">Family involvement</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-primary/20">
                <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-primary">Traditions</h3>
                <p className="text-sm text-gray-600">Cultural values</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-primary/20">
                <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-primary">Privacy</h3>
                <p className="text-sm text-gray-600">Safe interactions</p>
              </div>
            </div>
            
            <Card className="mb-6 border border-primary/20 bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-primary flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Communication Etiquette
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 text-gray-700 space-y-3">
                  <li>Begin conversations with a respectful greeting and introduction</li>
                  <li>Use polite and respectful language at all times</li>
                  <li>Avoid slang, abbreviations, or overly informal language during initial interactions</li>
                  <li>Respect boundaries and privacy of other members</li>
                  <li>Be honest and transparent in your communications</li>
                  <li>Respond to messages in a timely manner showing genuine interest</li>
                  <li>Ask thoughtful questions about family background, education, and values</li>
                </ul>
              </CardContent>
            </Card>
            
            <Separator className="my-8 bg-primary/20" />
            
            <Card className="mb-6 border border-primary/20 bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-primary flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Profile Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 text-gray-700 space-y-3">
                  <li>Provide accurate information about yourself, family, education, and profession</li>
                  <li>Upload clear and recent photographs that portray you respectfully</li>
                  <li>Accurately state your gotra, rashi, and other traditional details</li>
                  <li>Be honest about your expectations and preferences for a life partner</li>
                  <li>Include information about your family's background and traditions</li>
                  <li>Mention your involvement in community activities and cultural practices</li>
                </ul>
              </CardContent>
            </Card>
            
            <Separator className="my-8 bg-primary/20" />
            
            <Card className="mb-6 border border-primary/20 bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-primary flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Meeting Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 text-gray-700 space-y-3">
                  <li>Consider including family members in initial meetings as per tradition</li>
                  <li>Choose appropriate venues for meetings that are public and respectable</li>
                  <li>Dress modestly and appropriately for meetings, reflecting cultural values</li>
                  <li>Be punctual for scheduled meetings, whether virtual or in-person</li>
                  <li>Approach discussions about dowry with sensitivity and legal awareness</li>
                  <li>Respect the decision-making process of both families involved</li>
                </ul>
              </CardContent>
            </Card>
            
            <Separator className="my-8 bg-primary/20" />
            
            <Card className="mb-6 border border-primary/20 bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-primary flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Traditional Values
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 text-gray-700 space-y-3">
                  <li>Respect the importance of gotra considerations in matrimonial matches</li>
                  <li>Honor traditional customs and rituals in the matchmaking process</li>
                  <li>Acknowledge the value of horoscope matching while balancing modern perspectives</li>
                  <li>Respect family involvement in the decision-making process</li>
                  <li>Balance traditional values with contemporary views on equality and mutual respect</li>
                  <li>Maintain the sanctity of our cultural heritage while embracing progress</li>
                </ul>
              </CardContent>
            </Card>
            
            <div className="mt-8 p-6 bg-orange-50 rounded-lg border border-primary/20">
              <div className="flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary mr-2" />
                <h3 className="text-lg font-bold text-primary">Our Promise</h3>
                <Heart className="h-6 w-6 text-primary ml-2" />
              </div>
              <p className="text-gray-700 text-center leading-relaxed">
                Remember, the journey to finding your life partner should be approached with dignity, respect, and mindfulness
                of our rich cultural heritage. We encourage meaningful connections based on shared values, mutual respect,
                and the blessings of both families. May your journey lead to a blessed and harmonious union.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Etiquette;
