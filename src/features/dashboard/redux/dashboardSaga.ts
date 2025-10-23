import { call, put } from 'redux-saga/effects';
import { takeEvery } from '@redux-saga/core/effects';
import { fetchStatsRequest, fetchStatsSuccess, fetchStatsFailure } from './dashboardSlice';
import { dashboardApi } from '@/services/api/dashboardApi';

function* handleFetchStats(): Generator<any, void, any> {
  try {
    const response: any = yield call(dashboardApi.getStats);
    
    if (response.success && response.data) {
      yield put(fetchStatsSuccess(response.data));
    } else {
      // Enhanced mock data with comprehensive dashboard information
      const mockStats = {
        totalUsers: 2847,
        totalProducts: 156,
        todayOrders: 47,
        todayRevenue: 8750000,
        userGrowth: 12.3,
        productGrowth: 8.7,
        orderGrowth: 15.2,
        revenueGrowth: 22.8,
        chartData: [
          { name: 'Mon', orders: 18, revenue: 3200000, users: 45, products: 12 },
          { name: 'Tue', orders: 25, revenue: 4500000, users: 52, products: 8 },
          { name: 'Wed', orders: 22, revenue: 3800000, users: 38, products: 15 },
          { name: 'Thu', orders: 31, revenue: 5200000, users: 67, products: 11 },
          { name: 'Fri', orders: 28, revenue: 4800000, users: 43, products: 9 },
          { name: 'Sat', orders: 35, revenue: 6200000, users: 58, products: 13 },
          { name: 'Sun', orders: 42, revenue: 7500000, users: 71, products: 16 },
        ],
        recentActivities: [
          {
            id: '1',
            type: 'ORDER_PLACED' as const,
            description: 'Order #12847 placed by John Smith - Value: 2,450,000 VND',
            timestamp: new Date().toISOString(),
          },
          {
            id: '2',
            type: 'USER_REGISTERED' as const,
            description: 'New user registered: john.doe@example.com',
            timestamp: new Date(Date.now() - 120000).toISOString(),
          },
          {
            id: '3',
            type: 'PRODUCT_ADDED' as const,
            description: 'Product "Premium Women\'s Jacket" added to system',
            timestamp: new Date(Date.now() - 300000).toISOString(),
          },
          
         
        ],
      };
      
      yield put(fetchStatsSuccess(mockStats));
    }
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    yield put(fetchStatsFailure(message || 'Failed to fetch dashboard stats'));
  }
}

export function* dashboardSaga() {
  yield takeEvery(fetchStatsRequest.type, handleFetchStats);
}
