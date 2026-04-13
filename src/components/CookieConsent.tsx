/**
 * Cookie consent banner for GDPR compliance
 */

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Analytics } from '@/utils/analytics';
import { logger } from '@/utils/logger';

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  // effect:audited — Initialize from localStorage for cookie consent
  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    } else if (consent === 'accepted') {
      Analytics.enable();
    } else {
      Analytics.disable();
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowBanner(false);
    Analytics.enable();
    logger.info('Cookies accepted');
  };

  const rejectCookies = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowBanner(false);
    Analytics.disable();
    logger.info('Cookies rejected');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50 border-t border-gray-700">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm">
            We use cookies to improve your experience and analyze site usage. 
            By clicking "Accept", you consent to our use of cookies.
            <a 
              href="/privacy-policy" 
              className="underline ml-2 hover:text-gray-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </a>
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button 
            onClick={rejectCookies} 
            variant="outline"
            className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900"
          >
            Reject
          </Button>
          <Button 
            onClick={acceptCookies}
            className="bg-white text-gray-900 hover:bg-gray-100"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
