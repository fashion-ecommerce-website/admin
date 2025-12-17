import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DashboardResponse, PeriodType } from '@/services/api/dashboardApi';

export interface DashboardState {
  data: DashboardResponse | null;
  period: PeriodType;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  period: 'MONTH',
  loading: false,
  error: null,
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    fetchDashboardRequest: (state, action: PayloadAction<PeriodType>) => {
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
    setPeriod: (state, action: PayloadAction<PeriodType>) => {
      state.period = action.payload;
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
  clearError 
} = dashboardSlice.actions;

export const dashboardReducer = dashboardSlice.reducer;
