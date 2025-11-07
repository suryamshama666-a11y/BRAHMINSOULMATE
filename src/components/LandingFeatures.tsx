import React from 'react';
import { Shield, Users, Search, Award, Star, AlertTriangle } from 'lucide-react';

const LandingFeatures: React.FC = () => {
  const features = [
    {
      icon: <Shield className="h-8 w-8 text-brahmin-primary" />,
      title: "100% Verified Profiles",
      description: "All profiles undergo strict verification to ensure authenticity and safety for our members."
    },
    {
      icon: <Users className="h-8 w-8 text-brahmin-primary" />,
      title: "Exclusive Brahmin Community",
      description: "Connect with educated, cultured Brahmin singles who share your values and traditions."
    },
    {
      icon: <Search className="h-8 w-8 text-brahmin-primary" />,
      title: "Advanced Matching",
      description: "Our sophisticated algorithm finds compatible matches based on your preferences and horoscope."
    },
    {
      icon: <Award className="h-8 w-8 text-brahmin-primary" />,
      title: "Premium Experience",
      description: "Enjoy a seamless, ad-free experience with our elegant and easy-to-use platform."
    },
    {
      icon: <Star className="h-8 w-8 text-brahmin-primary" />,
      title: "Success Stories",
      description: "Join thousands of happy couples who found their perfect match through our service."
    },
    {
      icon: <AlertTriangle className="h-8 w-8 text-brahmin-primary" />,
      title: "Privacy Control",
      description: "You control who sees your information with our advanced privacy settings."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl font-serif font-bold mb-3"
            style={{ color: '#E30613' }}
          >
            Why Choose Brahmin Soulmate Connect
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're dedicated to helping Brahmin singles find meaningful relationships with these exclusive features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow border border-gray-100">
              <div className="bg-brahmin-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 
                className="text-xl font-medium mb-2"
                style={{ color: '#E30613' }}
              >
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
