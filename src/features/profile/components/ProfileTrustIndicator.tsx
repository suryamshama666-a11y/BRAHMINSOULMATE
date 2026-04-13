import React from 'react';
import { Shield } from 'lucide-react';

const ProfileTrustIndicator: React.FC = () => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-sm text-green-800 flex items-center justify-center">
    <Shield className="h-4 w-4 mr-2" />
    <span className="font-bold">100% Verified Profiles</span>
    <span className="mx-2">•</span>
    <span>Your data is secure & private</span>
  </div>
);

export default ProfileTrustIndicator;