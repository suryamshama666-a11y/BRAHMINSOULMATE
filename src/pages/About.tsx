import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, Users, Calendar, Gem, Star, Shield } from "lucide-react";
import SEO from '@/components/SEO';

export default function About() {
  const features = [
    {
      icon: <Heart className="h-8 w-8 text-pink-500" />,
      title: "Meaningful Connections",
      description: "Our matching algorithm helps you find partners who share your values, interests, and life goals."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "Community Trust",
      description: "All profiles are verified by our team to ensure a safe and authentic community."
    },
    {
      icon: <Calendar className="h-8 w-8 text-green-500" />,
      title: "Astrological Compatibility",
      description: "Optional astrological matching helps those who value traditional compatibility metrics."
    },
    {
      icon: <Gem className="h-8 w-8 text-purple-500" />,
      title: "Premium Experience",
      description: "Enjoy a clutter-free experience with no ads and focus on what matters - finding your partner."
    },
    {
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      title: "Personalized Matchmaking",
      description: "Our expert matchmakers can provide personalized recommendations based on your preferences."
    },
    {
      icon: <Shield className="h-8 w-8 text-red-500" />,
      title: "Privacy First",
      description: "Your privacy is our priority. You control who sees your information and how you connect."
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <SEO 
        title="About Our Community"
        description="Learn about the mission, values, and technology behind Brahmin Soulmate Connect. The trusted matrimonial platform dedicated to the Brahmin community worldwide."
        keywords="Brahmin matrimony about, marriage platform mission, Brahmin community values"
      />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: '#E30613' }}
          >
            About Brahmin Matrimony
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We are dedicated to helping members of the Brahmin community find their perfect life partner
            through a blend of traditional values and modern technology.
          </p>
        </div>
        
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
            <CardDescription>
              Creating meaningful connections that last a lifetime
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Founded in 2022, Brahmin Matrimony has quickly become the premier platform for the Brahmin 
              community to find suitable life partners. Our platform combines traditional values with 
              modern technology to create a seamless matchmaking experience.
            </p>
            <p className="text-muted-foreground">
              We understand the importance of cultural compatibility, family values, and personal 
              aspirations in a successful marriage. Our sophisticated matching algorithm takes into 
              account not just basic preferences but deeper compatibility factors including education, 
              professional goals, family backgrounds, and optional astrological compatibility.
            </p>
          </CardContent>
        </Card>
        
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-center mb-8">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-medium text-center mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Join Our Community</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Whether you're looking for yourself or for a family member, Brahmin Matrimony provides 
              a respectful and efficient platform to find the perfect match. Our growing community 
              includes professionals, academics, and traditionally minded individuals from across 
              the country and abroad.
            </p>
            <div className="flex justify-center mt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/register">
                  <Button className="bg-brahmin-primary hover:bg-brahmin-dark">
                    Create Your Profile
                  </Button>
                </a>
                <a href="/search">
                  <Button variant="outline">
                    Browse Profiles
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Add the Button component for rendering purposes
const Button = ({ children, className, variant }: { children: React.ReactNode, className?: string, variant?: string }) => {
  const baseClass = "px-4 py-2 rounded font-medium";
  const variantClass = variant === "outline" ? "border border-gray-300 hover:bg-gray-50" : "bg-blue-600 text-white hover:bg-blue-700";
  
  return (
    <button className={`${baseClass} ${variantClass} ${className || ""}`}>
      {children}
    </button>
  );
};
