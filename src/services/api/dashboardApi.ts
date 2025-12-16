import { adminApiClient } from './baseApi';

// Period type matching backend PeriodType enum
export type PeriodType = 'MONTH' | 'YEAR';

// Dashboard Response Types matching backend exactly
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

// Matches backend DashboardResponse.ChartDataDto exactly
export interface ChartDataDto {
  target: string;  // month (1-12) or year (2025, 2024, ...)
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  unpaidRevenue: number;
  paidRevenue: number;
  refundedRevenue: number;
}

class DashboardApi {
  /**
   * Get dashboard data with period filter
   * @param period - 'MONTH' | 'YEAR' (matches backend PeriodType enum)
   */
  async getDashboard(period: PeriodType = 'MONTH'): Promise<DashboardResponse> {
    const response = await adminApiClient.get<DashboardResponse>(`/reports/dashboard?period=${period}`);
    return response.data as DashboardResponse;
  }
}

export const dashboardApi = new DashboardApi();
export default dashboardApi;
