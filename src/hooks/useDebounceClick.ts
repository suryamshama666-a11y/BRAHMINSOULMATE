/**
 * Debounce click hook to prevent rapid multiple clicks
 * Critical for payment buttons and other sensitive actions
 */

import { useState, useCallback, useRef } from 'react';

export const useDebounceClick = (callback: () => void | Promise<void>, delay = 1000) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      await callback();
    } finally {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout to reset processing state
      timeoutRef.current = setTimeout(() => {
        setIsProcessing(false);
      }, delay);
    }
  }, [callback, delay, isProcessing]);

  return { debouncedCallback, isProcessing };
};

export default useDebounceClick;
