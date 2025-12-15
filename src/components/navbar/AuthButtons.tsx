import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

const AuthButtons = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isLoginActive = currentPath === '/login';
  const isRegisterActive = currentPath === '/register';

  return (
    <div className="flex items-center space-x-2">
      <Link to="/login">
        <button
          style={{
            backgroundColor: isLoginActive ? '#FF4500' : '#FFFFFF',
            color: isLoginActive ? '#FFFFFF' : '#000000',
            border: '2px solid #FF4500',
            borderRadius: '9999px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          <LogIn 
            className="h-4 w-4 mr-2" 
            style={{ color: isLoginActive ? '#FFFFFF' : '#000000' }}
          />
          <span>Login</span>
        </button>
      </Link>
      
      <Link to="/register">
        <button
          style={{
            backgroundColor: isRegisterActive ? '#FF4500' : '#FFFFFF',
            color: isRegisterActive ? '#FFFFFF' : '#000000',
            border: '2px solid #FF4500',
            borderRadius: '9999px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          <UserPlus 
            className="h-4 w-4 mr-2" 
            style={{ color: isRegisterActive ? '#FFFFFF' : '#000000' }}
          />
          <span>Register</span>
        </button>
      </Link>
    </div>
  );
};

export default AuthButtons;