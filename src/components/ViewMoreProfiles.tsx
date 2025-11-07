import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const ViewMoreProfiles: React.FC = () => {
  return (
    <section className="py-12 bg-brahmin-primary/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
          Find Your Perfect Match
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Our database has thousands of verified Brahmin profiles. 
          Register now to discover more profiles that match your preferences.
        </p>
        <Link to="/search">
          <Button className="bg-brahmin-primary text-white hover:bg-brahmin-dark">
            View More Profiles <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default ViewMoreProfiles;
