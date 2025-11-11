import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DashboardResponse } from '@/services/api/dashboardApi';

// Legacy types for backward compatibility
export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  todayOrders: number;
  todayRevenue: number;
  userGrowth?: number;
  productGrowth?: number;
  orderGrowth?: number;
  revenueGrowth?: number;
  chartData?: ChartPoint[];
  recentActivities?: RecentActivity[];
}

export interface ChartPoint {
  name: string;
  orders: number;
  revenue: number;
  users: number;
  products: number;
}

export interface RecentActivity {
  id: string;
  type: 'USER_REGISTERED' | 'ORDER_PLACED' | 'PRODUCT_ADDED' | 'PRODUCT_UPDATED';
  description: string;
  timestamp: string;
}

export interface DashboardState {
  data: DashboardResponse | null;
  period: 'day' | 'week' | 'month' | 'year';
  loading: boolean;
  error: string | null;
  // Legacy stats for backward compatibility
  stats: DashboardStats | null;
}

const initialState: DashboardState = {
  data: null,
  period: 'week',
  loading: false,
  error: null,
  stats: null,
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // New actions for /reports/dashboard API
    fetchDashboardRequest: (state, action: PayloadAction<'day' | 'week' | 'month' | 'year'>) => {
      state.loading = true;
      state.error = null;
      state.period = action.payload;
    },
    fetchDashboardSuccess: (state, action: PayloadAction<DashboardResponse>) => {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    },
    fetchDashboardFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setPeriod: (state, action: PayloadAction<'day' | 'week' | 'month' | 'year'>) => {
      state.period = action.payload;
    },
    // Legacy actions for backward compatibility
    fetchStatsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchStatsSuccess: (state, action: PayloadAction<DashboardStats>) => {
      state.loading = false;
      state.stats = action.payload;
      state.error = null;
    },
    fetchStatsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  fetchDashboardRequest,
  fetchDashboardSuccess,
  fetchDashboardFailure,
  setPeriod,
  fetchStatsRequest, 
  fetchStatsSuccess, 
  fetchStatsFailure, 
  clearError 
} = dashboardSlice.actions;

export const dashboardReducer = dashboardSlice.reducer;
