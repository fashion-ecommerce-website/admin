import { combineReducers } from '@reduxjs/toolkit';
import { adminAuthReducer } from '../features/auth/login';
import { dashboardReducer } from '../features/dashboard';
import { commonReducer } from '../features/common';
import userReducer from '../features/users/redux/userSlice';
import productReducer from '../features/products/redux/productSlice';
import voucherReducer from '../features/vouchers/redux/voucherSlice';
import promotionReducer from '../features/promotions/redux/promotionSlice';
import categoryReducer from '../features/categories/redux/categorySlice';
import orderReducer from '../features/orders/redux/orderSlice';
import refundReducer from '../features/refunds/redux/refundSlice';

export const rootReducer = combineReducers({
  adminAuth: adminAuthReducer,
  dashboard: dashboardReducer,
  common: commonReducer,
  users: userReducer,
  product: productReducer,
  voucher: voucherReducer,
  promotion: promotionReducer,
  category: categoryReducer,
  orders: orderReducer,
  refunds: refundReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
