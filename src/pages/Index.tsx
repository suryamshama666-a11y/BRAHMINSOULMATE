import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Simple index page for testing
export default function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-orange-50/30">
      {/* Simple header */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-brahmin-primary">Brahmin Soulmate Connect</h1>
          <div className="space-x-2">
            <Link to="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Simple hero section */}
      <main className="flex-grow flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gray-900">
          Find Your Perfect Match
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mb-8">
          Connect with educated, cultured, and like-minded Brahmin singles for a lifetime of happiness.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" className="bg-brahmin-primary hover:bg-brahmin-dark text-white">
              Register Free
            </Button>
          </Link>
          <Link to="/search">
            <Button size="lg" variant="outline" className="border-brahmin-primary text-brahmin-primary">
              Browse Profiles
            </Button>
          </Link>
        </div>
      </main>
      
      {/* Simple footer */}
      <footer className="bg-brahmin-primary text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Brahmin Soulmate Connect. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <Link to="/about" className="text-white/80 hover:text-white">About</Link>
            <Link to="/privacy" className="text-white/80 hover:text-white">Privacy</Link>
            <Link to="/terms" className="text-white/80 hover:text-white">Terms</Link>
            <Link to="/contact" className="text-white/80 hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
