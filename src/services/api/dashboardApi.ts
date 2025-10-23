import { adminApiClient, ApiResponse } from './baseApi';
import type { DashboardStats } from '@/features/dashboard/redux/dashboardSlice';

export interface DashboardApiResponse {
  totalUsers: number;
  totalProducts: number;
  todayOrders: number;
  todayRevenue: number;
  userGrowth?: number;
  productGrowth?: number;
  orderGrowth?: number;
  revenueGrowth?: number;
  chartData?: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
  recentActivities?: Array<{
    id: string;
    type: 'USER_REGISTERED' | 'ORDER_PLACED' | 'PRODUCT_ADDED' | 'PRODUCT_UPDATED';
    description: string;
    timestamp: string;
  }>;
}

class DashboardApi {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<ApiResponse<DashboardApiResponse>> {
    return adminApiClient.get<DashboardApiResponse>('/admin/dashboard/stats');
  }

  /**
   * Get dashboard chart data for a specific period
   */
  async getChartData(period: 'week' | 'month' | 'year' = 'week'): Promise<ApiResponse<DashboardApiResponse>> {
    return adminApiClient.get<DashboardApiResponse>(`/admin/dashboard/chart?period=${period}`);
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 10): Promise<ApiResponse<DashboardApiResponse>> {
    return adminApiClient.get<DashboardApiResponse>(`/admin/dashboard/activities?limit=${limit}`);
  }

  /**
   * Get revenue statistics for a specific date range
   */
  async getRevenueStats(startDate: string, endDate: string): Promise<ApiResponse<DashboardApiResponse>> {
    return adminApiClient.get<DashboardApiResponse>(`/admin/dashboard/revenue?startDate=${startDate}&endDate=${endDate}`);
  }

  /**
   * Get order statistics for a specific date range
   */
  async getOrderStats(startDate: string, endDate: string): Promise<ApiResponse<DashboardApiResponse>> {
    return adminApiClient.get<DashboardApiResponse>(`/admin/dashboard/orders?startDate=${startDate}&endDate=${endDate}`);
  }
}

export const dashboardApi = new DashboardApi();
export default dashboardApi;
