import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Search, MessageCircle, Calendar, Heart } from 'lucide-react';
import Footer from '@/components/Footer';

export default function HowItWorks() {
  const steps = [
    {
      icon: CheckCircle,
      title: "Create Your Profile",
      description: "Sign up and create a detailed profile including your personal information, family background, and preferences."
    },
    {
      icon: Search,
      title: "Find Matches",
      description: "Use our advanced search filters to find profiles that match your preferences and criteria."
    },
    {
      icon: MessageCircle,
      title: "Connect & Communicate",
      description: "Express interest and start meaningful conversations with potential matches through our secure messaging system."
    },
    {
      icon: Calendar,
      title: "Schedule Meetings",
      description: "Plan virtual or in-person meetings with families you connect with."
    },
    {
      icon: Heart,
      title: "Find Your Life Partner",
      description: "Take the next step towards marriage with someone who shares your values and aspirations."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 
            className="text-4xl font-serif mb-4"
            style={{ color: '#E30613' }}
          >
            How It Works
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your journey to finding the perfect match made simple and meaningful
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <step.icon className="h-6 w-6" style={{ color: '#E30613' }} />
                  <CardTitle className="text-xl" style={{ color: '#E30613' }}>{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
