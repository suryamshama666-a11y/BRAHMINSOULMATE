import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface SuccessStory {
  id: number;
  couple: string;
  story: string;
  image: string;
  weddingDate: string;
}

const successStories: SuccessStory[] = [
  {
    id: 1,
    couple: "Priya & Rahul",
    story: "We met through Brahmin Soulmate Connect and instantly connected over our shared values and interests. After 6 months of getting to know each other, we decided to tie the knot. Thank you for helping us find our perfect match!",
    image: "https://images.unsplash.com/photo-1622192309470-ba53a8d15aa8?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    weddingDate: "January 15, 2023"
  },
  {
    id: 2,
    couple: "Karthik & Anjali",
    story: "Finding each other on this platform was truly a blessing. We connected over our shared interest in classical music and our traditional values. Our families met and it was a perfect match. We are forever grateful!",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    weddingDate: "March 22, 2023"
  },
  {
    id: 3,
    couple: "Aditya & Sneha",
    story: "What started as a simple message on Brahmin Soulmate Connect blossomed into a beautiful relationship. We were from different states but our shared cultural background helped us connect deeply. We're now happily married!",
    image: "https://images.unsplash.com/photo-1610173827043-9db5c815ae47?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    weddingDate: "November 5, 2022"
  }
];

const SuccessStoriesSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? successStories.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === successStories.length - 1 ? 0 : prevIndex + 1
    );
  };

  const currentStory = successStories[currentIndex];

  return (
    <section className="py-16 bg-orange-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 
            className="text-3xl font-serif font-bold mb-3"
            style={{ color: '#E30613' }}
          >
            Success Stories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from couples who found their perfect match through our platform
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-none shadow-lg overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="md:w-2/5 h-64 md:h-auto relative">
                <img 
                  src={currentStory.image} 
                  alt={currentStory.couple} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              
              {/* Content */}
              <CardContent className="md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                <div className="text-brahmin-primary/20 mb-4">
                  <Quote size={48} />
                </div>
                <p className="text-gray-700 italic mb-6">{currentStory.story}</p>
                <div>
                  <h3 className="text-xl font-medium text-brahmin-primary">{currentStory.couple}</h3>
                  <p className="text-gray-500">Married on {currentStory.weddingDate}</p>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Navigation buttons */}
          <div className="flex justify-center mt-8 space-x-4">
            <button 
              onClick={handlePrev}
              className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
              aria-label="Previous story"
            >
              <ChevronLeft size={24} className="text-brahmin-primary" />
            </button>
            <div className="flex space-x-2 items-center">
              {successStories.map((_, index) => (
                <span 
                  key={index}
                  className={`block w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-brahmin-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <button 
              onClick={handleNext}
              className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
              aria-label="Next story"
            >
              <ChevronRight size={24} className="text-brahmin-primary" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessStoriesSlider; 