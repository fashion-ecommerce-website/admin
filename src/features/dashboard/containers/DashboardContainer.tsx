'use client';

import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DashboardPresenter } from '../components/DashboardPresenter';
import { fetchStatsRequest } from '../redux/dashboardSlice';
import type { RootState } from '@/store';

export const DashboardContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state: RootState) => state.dashboard);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial load
    dispatch(fetchStatsRequest());

    // Set up auto-refresh every 5 minutes
    intervalRef.current = setInterval(() => {
      dispatch(fetchStatsRequest());
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchStatsRequest());
  };

  return (
    <DashboardPresenter
      stats={stats}
      loading={loading}
      error={error}
      onRefresh={handleRefresh}
    />
  );
};
