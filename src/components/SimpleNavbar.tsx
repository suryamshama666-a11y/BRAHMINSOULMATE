import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, LogIn, UserPlus } from 'lucide-react';

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

  const isLoginActive = location.pathname === '/login';
  const isRegisterActive = location.pathname === '/register';

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
            <Link to="/login">
              <button
                style={{
                  backgroundColor: isLoginActive ? '#FF4500' : '#FFFFFF',
                  color: isLoginActive ? '#FFFFFF' : '#FF4500',
                  border: '2px solid #FF4500',
                  borderRadius: '9999px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <LogIn style={{ width: '16px', height: '16px', marginRight: '8px', color: isLoginActive ? '#FFFFFF' : '#FF4500' }} />
                Login
              </button>
            </Link>
            <Link to="/register">
              <button
                style={{
                  backgroundColor: isRegisterActive ? '#FF4500' : '#FFFFFF',
                  color: isRegisterActive ? '#FFFFFF' : '#FF4500',
                  border: '2px solid #FF4500',
                  borderRadius: '9999px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <UserPlus style={{ width: '16px', height: '16px', marginRight: '8px', color: isRegisterActive ? '#FFFFFF' : '#FF4500' }} />
                Register
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavbar;