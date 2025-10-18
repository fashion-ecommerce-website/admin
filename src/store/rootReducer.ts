import { combineReducers } from '@reduxjs/toolkit';
import { adminAuthReducer } from '../features/auth/login';
import { dashboardReducer } from '../features/dashboard';
import userReducer from '../features/users/redux/userSlice';
import productReducer from '../features/products/redux/productSlice';
import voucherReducer from '../features/vouchers/redux/voucherSlice';
import promotionReducer from '../features/promotions/redux/promotionSlice';
import categoryReducer from '../features/categories/redux/categorySlice';

export const rootReducer = combineReducers({
  adminAuth: adminAuthReducer,
  dashboard: dashboardReducer,
  users: userReducer,
  product: productReducer,
  voucher: voucherReducer,
  promotion: promotionReducer,
  category: categoryReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
