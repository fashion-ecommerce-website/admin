'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchEnumsRequest } from '@/features/common';

export function EnumProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useAppSelector((state) => state.common);
  const { isAuthenticated, accessToken } = useAppSelector((state) => state.adminAuth);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (isAuthenticated && accessToken && !hasInitialized.current && !data && !isLoading) {
      hasInitialized.current = true;
      dispatch(fetchEnumsRequest());
    }
  }, [isAuthenticated, accessToken, data, isLoading, dispatch]);

  return <>{children}</>;
}
