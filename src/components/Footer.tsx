import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-white to-primary-50/30 mt-auto border-t border-primary-100">
      <div className="container mx-auto px-4 py-12">
        {/* Mobile Compact Layout */}
        <div className="block md:hidden">
          {/* Mobile Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-display font-semibold mb-4 text-primary-600">BrahminSoulmate</h3>
            <div className="flex justify-center space-x-6 mb-4">
              <a href="#" className="text-neutral-600 hover:text-primary-500 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-neutral-600 hover:text-primary-500 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-neutral-600 hover:text-primary-500 transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          {/* Mobile Links - Horizontal Layout */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm mb-6">
            <Link to="/search" className="text-neutral-700 hover:text-primary-600 transition-colors font-medium">Search</Link>
            <Link to="/about" className="text-neutral-700 hover:text-primary-600 transition-colors font-medium">About</Link>
            <Link to="/help" className="text-neutral-700 hover:text-primary-600 transition-colors font-medium">Help</Link>
            <Link to="/privacy" className="text-neutral-700 hover:text-primary-600 transition-colors font-medium">Privacy</Link>
            <Link to="/terms" className="text-neutral-700 hover:text-primary-600 transition-colors font-medium">Terms</Link>
          </div>
          
          {/* Mobile Contact */}
          <div className="text-center text-sm text-neutral-600 mb-4">
            <a href="mailto:contact@brahminsoulmate.com" className="hover:text-primary-600 transition-colors">
              contact@brahminsoulmate.com
            </a>
            <span className="mx-2 text-primary-400">•</span>
            <a href="tel:+918001234567" className="hover:text-primary-600 transition-colors">
              +91 800 123 4567
            </a>
          </div>
          
          {/* Mobile Copyright */}
          <div className="text-center text-sm text-neutral-500">
            <p>&copy; {new Date().getFullYear()} BrahminSoulmate. All rights reserved.</p>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          {/* Main Footer Content */}
          <div className="grid grid-cols-4 gap-8 mb-8">
            {/* Column 1 - Brand */}
            <div>
              <h3 className="text-2xl font-display font-semibold mb-4 text-primary-600">BrahminSoulmate</h3>
              <p className="text-neutral-600 text-sm mb-4">
                Trusted matrimonial platform for Brahmin community.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-neutral-600 hover:text-primary-500 transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-neutral-600 hover:text-primary-500 transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-neutral-600 hover:text-primary-500 transition-colors">
                  <Twitter size={20} />
                </a>
              </div>
            </div>
            
            {/* Column 2 - Quick Links */}
            <div>
              <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-neutral-800">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/search" className="text-neutral-600 hover:text-primary-600 transition-colors">
                    Search Profiles
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-neutral-600 hover:text-primary-600 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/success-stories" className="text-neutral-600 hover:text-primary-600 transition-colors">
                    Success Stories
                  </Link>
                </li>
                <li>
                  <Link to="/plans" className="text-neutral-600 hover:text-primary-600 transition-colors">
                    Membership Plans
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Column 3 - Support */}
            <div>
              <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-neutral-800">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/help" className="text-neutral-600 hover:text-primary-600 transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-neutral-600 hover:text-primary-600 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-neutral-600 hover:text-primary-600 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@brahminsoulmate.com" className="text-neutral-600 hover:text-primary-600 transition-colors">
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Column 4 - Contact */}
            <div>
              <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-neutral-800">Contact</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-primary-500" />
                  <a href="mailto:contact@brahminsoulmate.com" className="text-neutral-600 hover:text-primary-600 transition-colors">
                    contact@brahminsoulmate.com
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-primary-500" />
                  <a href="tel:+918001234567" className="text-neutral-600 hover:text-primary-600 transition-colors">
                    +91 800 123 4567
                  </a>
                </div>
                <p className="text-neutral-500 text-sm mt-2 pl-6">
                  Mon-Sat: 10 AM - 7 PM IST
                </p>
              </div>
            </div>
          </div>
          
          {/* Desktop Bottom Bar */}
          <div className="border-t border-primary-100 pt-6 flex justify-between items-center text-sm">
            <p className="text-neutral-500">&copy; {new Date().getFullYear()} BrahminSoulmate. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-neutral-600 hover:text-primary-600 transition-colors">Privacy</Link>
              <Link to="/terms" className="text-neutral-600 hover:text-primary-600 transition-colors">Terms</Link>
              <Link to="/help" className="text-neutral-600 hover:text-primary-600 transition-colors">Help</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
