import React from 'react';
import Footer from '@/components/Footer';
import { InterestManager } from '@/components/interests/InterestManager';
import { Button } from '@/components/ui/button';

const Interests = () => {
  return (
    <div className="min-h-screen flex flex-col bg-orange-50/30">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">
            Interests & Connections
          </h1>
          <p className="text-gray-600">Manage your matrimonial interests and connections</p>
        </div>

        <InterestManager />

        <Button className="bg-primary text-white hover:bg-primary-dark">
          {/* ...button content... */}
        </Button>
      </main>
      
      <Footer />
    </div>
  );
};

export default Interests;
