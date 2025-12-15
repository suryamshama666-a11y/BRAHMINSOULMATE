import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

const AuthButtons = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex items-center space-x-2">
      <Link to="/login">
        <Button
          variant="outline"
          size="sm"
          className={`
            transition-all duration-200 rounded-full border-2 border-[#FF4500]
            ${currentPath === '/login'
              ? 'bg-[#FF4500] text-white'
              : 'bg-white text-black hover:bg-[#FF4500] hover:text-white'
            }
          `}
        >
          <LogIn className={`h-4 w-4 mr-2 ${
            currentPath === '/login' 
              ? 'text-white' 
              : 'text-black group-hover:text-white'
          }`} />
          <span>Login</span>
        </Button>
      </Link>
      
      <Link to="/register">
        <Button
          variant="outline"
          size="sm"
          className={`
            transition-all duration-200 rounded-full border-2 border-[#FF4500]
            ${currentPath === '/register'
              ? 'bg-[#FF4500] text-white'
              : 'bg-white text-black hover:bg-[#FF4500] hover:text-white'
            }
          `}
        >
          <UserPlus className={`h-4 w-4 mr-2 ${
            currentPath === '/register' 
              ? 'text-white' 
              : 'text-black group-hover:text-white'
          }`} />
          <span>Register</span>
        </Button>
      </Link>
    </div>
  );
};

export default AuthButtons;