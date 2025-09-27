import { combineReducers } from '@reduxjs/toolkit';
import { adminAuthReducer } from '../features/auth/login';
import { dashboardReducer } from '../features/dashboard';
import userReducer from '../features/users/redux/userSlice';
import productReducer from '../features/products/redux/productSlice';

export const rootReducer = combineReducers({
  adminAuth: adminAuthReducer,
  dashboard: dashboardReducer,
  users: userReducer,
  product: productReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
