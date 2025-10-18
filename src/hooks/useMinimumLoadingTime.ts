import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to enforce a minimum display time for loading states
 * This ensures skeleton loaders are visible long enough for users to perceive them
 * 
 * @param actualLoading - The actual loading state from API/Redux
 * @param minDisplayTime - Minimum time in milliseconds to show loading (default: 500ms)
 * @returns Boolean indicating whether to show loading state
 */
export const useMinimumLoadingTime = (
  actualLoading: boolean,
  minDisplayTime: number = 500
): boolean => {
  const [displayLoading, setDisplayLoading] = useState(actualLoading);
  const loadingStartTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // When loading starts
    if (actualLoading && !displayLoading) {
      loadingStartTimeRef.current = Date.now();
      setDisplayLoading(true);
    }

    // When loading ends
    if (!actualLoading && displayLoading) {
      const elapsedTime = loadingStartTimeRef.current
        ? Date.now() - loadingStartTimeRef.current
        : minDisplayTime;

      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

      if (remainingTime > 0) {
        // Keep showing loading for the remaining time
        timeoutRef.current = setTimeout(() => {
          setDisplayLoading(false);
          loadingStartTimeRef.current = null;
        }, remainingTime);
      } else {
        // Minimum time already elapsed
        setDisplayLoading(false);
        loadingStartTimeRef.current = null;
      }
    }

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [actualLoading, displayLoading, minDisplayTime]);

  return displayLoading;
};
