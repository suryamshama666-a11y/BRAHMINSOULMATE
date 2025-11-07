
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Book, Info, DollarSign, Star } from 'lucide-react';

export default function PublicNavLinks() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <Link 
        to="/success-stories"
        className={`nav-link ${isActive('/success-stories') ? 'active' : ''}`}
      >
        <Star className="h-4 w-4 mr-2" />
        Success Stories
      </Link>
      
      <Link 
        to="/how-it-works"
        className={`nav-link ${isActive('/how-it-works') ? 'active' : ''}`}
      >
        <Info className="h-4 w-4 mr-2" />
        How it Works
      </Link>
      
      <Link 
        to="/free-vs-paid"
        className={`nav-link ${isActive('/free-vs-paid') ? 'active' : ''}`}
      >
        <DollarSign className="h-4 w-4 mr-2" />
        Free vs Paid
      </Link>
    </>
  );
}
