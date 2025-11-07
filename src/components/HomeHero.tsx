import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, UserPlus, Search, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const HomeHero: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <section className="relative py-16 md:py-24 bg-primary overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="hero-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-pattern)" />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Hero Content */}
          <div className="text-white md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">
              Find Your Perfect <span className="text-yellow-300">Brahmin</span> Match
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-lg">
              Connect with educated, cultured, and like-minded Brahmin singles for a lifetime of happiness and compatibility.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg" ripple={true} className="bg-white text-brahmin-primary hover:bg-gray-100">
                  Register Free <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/search">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Search className="mr-2 h-4 w-4" /> Search Profiles
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Hero Image/Stats */}
          <div className="md:w-1/2 flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <h2 className="text-2xl font-serif font-medium mb-4 text-center">Why Choose Us</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-md bg-white/5">
                  <p className="text-3xl font-bold text-yellow-300">10K+</p>
                  <p className="text-sm">Verified Profiles</p>
                </div>
                <div className="text-center p-4 rounded-md bg-white/5">
                  <p className="text-3xl font-bold text-yellow-300">5K+</p>
                  <p className="text-sm">Success Stories</p>
                </div>
                <div className="text-center p-4 rounded-md bg-white/5">
                  <p className="text-3xl font-bold text-yellow-300">100%</p>
                  <p className="text-sm">Privacy Control</p>
                </div>
                <div className="text-center p-4 rounded-md bg-white/5">
                  <p className="text-3xl font-bold text-yellow-300">24/7</p>
                  <p className="text-sm">Customer Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
