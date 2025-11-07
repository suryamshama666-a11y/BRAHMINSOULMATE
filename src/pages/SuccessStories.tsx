import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Star, Calendar } from 'lucide-react';
import Footer from '@/components/Footer';

export default function SuccessStories() {
  const stories = [
    {
      couple: "Aditya & Priya",
      location: "Bangalore",
      date: "December 2023",
      story: "We connected through BrahminSoulmate and instantly felt a deep connection. Our shared values and aspirations made it clear we were meant for each other.",
      image: "/couples/couple1.jpg"
    },
    {
      couple: "Rahul & Sneha",
      location: "Mumbai",
      date: "November 2023",
      story: "Thanks to the platform's advanced matching system, we found each other despite living in different cities. Our first video call lasted 3 hours!",
      image: "/couples/couple2.jpg"
    },
    {
      couple: "Karthik & Divya",
      location: "Chennai",
      date: "October 2023",
      story: "The detailed profiles and horoscope matching feature helped us find our perfect match. We're grateful to BrahminSoulmate for bringing us together.",
      image: "/couples/couple3.jpg"
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
            Success Stories
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real couples who found their soulmates through our platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-w-16 aspect-h-9 relative">
                <img
                  src={story.image}
                  alt={story.couple}
                  className="object-cover w-full h-48"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Happy+Couple';
                  }}
                />
                <div className="absolute top-4 right-4">
                  <Heart className="h-6 w-6 text-[#FF4500] fill-current" />
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl font-serif">{story.couple}</span>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {story.date}
                  </div>
                </CardTitle>
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="h-4 w-4 mr-1 text-[#FF4500]" />
                  {story.location}
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600">{story.story}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-serif text-gray-800 mb-4">
            Ready to Write Your Own Success Story?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of happy couples who found their perfect match on BrahminSoulmate
          </p>
          <button
            onClick={() => window.location.href = '/register'}
            className="bg-[#FF4500] text-white px-8 py-3 rounded-lg hover:bg-[#FF4500]/90 transition-colors"
          >
            Start Your Journey
          </button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
