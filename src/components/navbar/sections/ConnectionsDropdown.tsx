
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, UserPlus, Users } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";

interface ConnectionsDropdownProps {
  currentPath?: string;
}

export default function ConnectionsDropdown({ currentPath }: ConnectionsDropdownProps) {
  const location = useLocation();
  const path = currentPath || location.pathname;
  const isActive = (route: string) => path.startsWith(route);
  
  return (
    <NavigationMenu>
      <NavigationMenuItem>
        <NavigationMenuTrigger className={isActive('/connections') ? 'active' : ''}>
          Connections
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <div className="w-56 p-2 bg-white rounded-md shadow-md">
            <Link to="/connections/favorites" className="nav-dropdown-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100">
              <Heart className="h-4 w-4 mr-2 text-brahmin-primary" />
              My Favorites
            </Link>
            <Link to="/connections/interests" className="nav-dropdown-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100">
              <UserPlus className="h-4 w-4 mr-2 text-brahmin-primary" />
              My Interests
            </Link>
            <Link to="/connections/interested" className="nav-dropdown-item flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100">
              <Users className="h-4 w-4 mr-2 text-brahmin-primary" />
              Interested in You
            </Link>
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenu>
  );
}
