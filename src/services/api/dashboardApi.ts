import { adminApiClient, ApiResponse } from './baseApi';

// Dashboard Response Types matching backend
export interface DashboardResponse {
  period: string;
  summary: SummaryDto;
  chartData: ChartDataDto[];
}

export interface SummaryDto {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface ChartDataDto {
  date: string;
  label: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  unpaidRevenue: number;
  paidRevenue: number;
  refundedRevenue: number;
}

// Legacy types for backward compatibility
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
   * Get dashboard data with period filter
   * @param period - 'day' | 'week' | 'month' | 'year'
   */
  async getDashboard(period: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<DashboardResponse> {
    const response = await adminApiClient.get<DashboardResponse>(`/reports/dashboard?period=${period}`);
    return response.data as DashboardResponse;
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
