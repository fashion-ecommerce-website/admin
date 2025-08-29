import { call, put } from 'redux-saga/effects';
import { takeEvery } from '@redux-saga/core/effects';
import { fetchStatsRequest, fetchStatsSuccess, fetchStatsFailure } from './dashboardSlice';

function* handleFetchStats() {
  try {
    // TODO: Implement dashboard API call
    // const response: DashboardStats = yield call(dashboardApi.getStats);
    
    // Mock dashboard stats for now
    const mockStats = {
      totalUsers: 1250,
      totalProducts: 89,
      todayOrders: 25,
      todayRevenue: 2750000,
      userGrowth: 8.2,
      productGrowth: 12.5,
      orderGrowth: -3.1,
      revenueGrowth: 15.7,
      chartData: [
        { name: 'T2', orders: 12, revenue: 1200000 },
        { name: 'T3', orders: 19, revenue: 1900000 },
        { name: 'T4', orders: 15, revenue: 1500000 },
        { name: 'T5', orders: 22, revenue: 2200000 },
        { name: 'T6', orders: 28, revenue: 2800000 },
        { name: 'T7', orders: 25, revenue: 2500000 },
        { name: 'CN', orders: 30, revenue: 3000000 },
      ],
      recentActivities: [
        {
          id: '1',
          type: 'ORDER_PLACED' as const,
          description: 'Đơn hàng #12345 được đặt bởi Nguyễn Văn A',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'USER_REGISTERED' as const,
          description: 'Người dùng mới đăng ký: user@example.com',
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: '3',
          type: 'PRODUCT_ADDED' as const,
          description: 'Sản phẩm "Áo thun nam" được thêm vào hệ thống',
          timestamp: new Date(Date.now() - 600000).toISOString(),
        },
      ],
    };
    
    yield put(fetchStatsSuccess(mockStats));
    
  } catch (error: any) {
    yield put(fetchStatsFailure(error.message || 'Failed to fetch dashboard stats'));
  }
}

export function* dashboardSaga() {
  yield takeEvery(fetchStatsRequest.type, handleFetchStats);
}
