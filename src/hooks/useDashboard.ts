import { useAppDispatch, useAppSelector } from './redux';
import { fetchDashboardRequest } from '@/features/dashboard';
import { useEffect } from 'react';

/**
 * Custom hook to access dashboard data
 * Automatically fetches dashboard data when period changes
 */
export function useDashboard(period: 'day' | 'week' | 'month' | 'year' = 'week') {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardRequest(period));
  }, [dispatch, period]);

  return {
    data,
    loading,
    error,
    summary: data?.summary || null,
    chartData: data?.chartData || [],
    period: data?.period || period,
  };
}
