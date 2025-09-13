import { combineReducers } from '@reduxjs/toolkit';
import { adminAuthReducer } from '../features/auth/login';
import { dashboardReducer } from '../features/dashboard';
import userReducer from '../features/users/redux/userSlice';

export const rootReducer = combineReducers({
  adminAuth: adminAuthReducer,
  dashboard: dashboardReducer,
  users: userReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
