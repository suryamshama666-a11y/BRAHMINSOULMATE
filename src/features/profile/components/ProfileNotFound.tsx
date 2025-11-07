import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserX, Home, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

export default function ProfileNotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-red-50">
      <main className="flex-grow container mx-auto px-4 py-20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <div className="mb-6">
              <UserX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
              <p className="text-gray-600">
                The profile you're looking for doesn't exist or may have been removed.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/search')}
                className="w-full bg-primary text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Browse Profiles
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
