'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchEnumsRequest } from '@/features/common';

/**
 * EnumProvider - Loads common enums on app start
 * This ensures all enum values are available throughout the admin app
 */
export function EnumProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { data, isLoading, error } = useAppSelector((state) => state.common);

  useEffect(() => {
    // Load enums only if not already loaded
    if (!data && !isLoading && !error) {
      dispatch(fetchEnumsRequest());
    }
  }, [dispatch, data, isLoading, error]);

  // You can add a loading state here if needed
  // For now, we let the app render while enums load in the background
  return <>{children}</>;
}
