import React from 'react';
import Footer from '@/components/Footer';
import { ProfileCreationWizard } from '@/components/profile/ProfileCreationWizard';

const ProfileSetup = () => {
  return (
    <div className="min-h-screen flex flex-col bg-orange-50/30">
      <main className="flex-grow py-8">
        <ProfileCreationWizard />
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfileSetup;
