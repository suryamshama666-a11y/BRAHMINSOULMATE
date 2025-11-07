import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';

const SimpleNavbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const linkStyle = (path: string) => ({
    textDecoration: 'none',
    color: isActive(path) ? '#dc2626' : '#333',
    fontWeight: isActive(path) ? 'bold' : 'normal',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    backgroundColor: isActive(path) ? '#fef2f2' : 'transparent',
    transition: 'all 0.2s ease'
  });

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-red-600 hover:text-red-700">
            <div className="bg-red-600 p-2 rounded-lg">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">BrahminSoulmate</span>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" style={linkStyle('/')}>Home</Link>
            <Link to="/dashboard" style={linkStyle('/dashboard')}>Dashboard</Link>
            <Link to="/search" style={linkStyle('/search')}>Search</Link>
            <Link to="/matches" style={linkStyle('/matches')}>Matches</Link>
            <Link to="/messages" style={linkStyle('/messages')}>Messages</Link>
          </div>
          
          {/* Auth Links */}
          <div className="flex items-center space-x-2">
            <Link 
              to="/login" 
              className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavbar;