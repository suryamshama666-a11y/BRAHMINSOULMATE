/**
 * Network status hook for handling online/offline states
 * Automatically resumes pending operations when connection is restored
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { TransactionRecovery } from '@/utils/transactionRecovery';
import { logger } from '@/utils/logger';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  // effect:audited — Network status listener for online/offline detection
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      
      if (wasOffline) {
        logger.info('Connection restored, resuming pending operations');
        toast.success('Connection restored');
        
        // Resume pending transactions
        try {
          await TransactionRecovery.resumePendingTransactions();
        } catch (error) {
          logger.error('Error resuming transactions:', error);
        }
      }
      
      setWasOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      logger.warn('Connection lost');
      toast.error('Connection lost. Changes will sync when online.', {
        duration: 5000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
};

export default useNetworkStatus;
