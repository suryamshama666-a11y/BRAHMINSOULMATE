
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, User, Settings, Book, HelpCircle, Calendar, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MoreDropdownProps {
  currentPath?: string;
}

export default function MoreDropdown({ currentPath }: MoreDropdownProps) {
  const isActive = (path: string) => currentPath === path || (currentPath && currentPath.startsWith(`${path}/`));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>More</DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem asChild>
          <Link to="/online" className="nav-dropdown-item">
            <Users className="h-4 w-4 mr-2" />
            Online
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile" className="nav-dropdown-item">
            <User className="h-4 w-4 mr-2" />
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account" className="nav-dropdown-item">
            <Settings className="h-4 w-4 mr-2" />
            My Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/etiquette" className="nav-dropdown-item">
            <Book className="h-4 w-4 mr-2" />
            Brahmin Etiquette
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/help" className="nav-dropdown-item">
            <HelpCircle className="h-4 w-4 mr-2" />
            Help
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/events" className="nav-dropdown-item">
            <Calendar className="h-4 w-4 mr-2" />
            Events
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/logout" className="nav-dropdown-item">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
