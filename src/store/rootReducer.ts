import { combineReducers } from '@reduxjs/toolkit';
import { adminAuthReducer } from '../features/auth/login';
import { dashboardReducer } from '../features/dashboard';

export const rootReducer = combineReducers({
  adminAuth: adminAuthReducer,
  dashboard: dashboardReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
