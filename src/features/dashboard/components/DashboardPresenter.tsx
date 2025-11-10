'use client';

import React from 'react';
import { DashboardCharts } from './DashboardCharts';
import { Skeleton } from '@/components/ui/Skeleton';
import ExportExcelButton from '@/components/ui/ExportExcelButton';
import type { DashboardResponse } from '@/services/api/dashboardApi';

interface DashboardStats {
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
    users: number;
    products: number;
  }>;
  recentActivities?: RecentActivity[];
}

interface RecentActivity {
  id: string;
  type: 'USER_REGISTERED' | 'ORDER_PLACED' | 'PRODUCT_ADDED' | 'PRODUCT_UPDATED';
  description: string;
  timestamp: string;
}

interface DashboardPresenterProps {
  data: DashboardResponse | null;
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  period: string;
  onRefresh: () => void;
  onPeriodChange: (period: 'day' | 'week' | 'month' | 'year') => void;
  onExportExcel?: () => void;
}

export const DashboardPresenter: React.FC<DashboardPresenterProps> = ({
  data,
  stats,
  loading,
  error,
  period,
  onRefresh,
  onPeriodChange,
  onExportExcel,
}) => {
  // Function to aggregate chart data by period
  const aggregateChartData = (chartData: any[], periodType: string): Array<{
    name: string;
    orders: number;
    revenue: number;
    users: number;
    products: number;
    cancelledOrders?: number;
    refundedRevenue?: number;
    completedOrders?: number;
    pendingOrders?: number;
    paidRevenue?: number;
    unpaidRevenue?: number;
    totalOrders?: number;
    totalRevenue?: number;
  }> => {
    if (!chartData || chartData.length === 0) return [];
    
    // For day and week, return data as is (daily)
    if (periodType === 'day' || periodType === 'week') {
      return chartData.map(item => ({
        name: item.label,
        orders: item.totalOrders,
        revenue: item.totalRevenue,
        users: 0,
        products: 0,
        cancelledOrders: item.cancelledOrders || 0,
        refundedRevenue: item.refundedRevenue || 0,
        completedOrders: item.completedOrders || 0,
        pendingOrders: item.pendingOrders || 0,
        paidRevenue: item.paidRevenue || 0,
        unpaidRevenue: item.unpaidRevenue || 0,
        totalOrders: item.totalOrders || 0,
        totalRevenue: item.totalRevenue || 0,
      }));
    }

    // For month, group by week
    if (periodType === 'month') {
      const weeklyData: Record<string, {
        name: string;
        orders: number;
        revenue: number;
        users: number;
        products: number;
        cancelledOrders: number;
        refundedRevenue: number;
        completedOrders: number;
        pendingOrders: number;
        paidRevenue: number;
        unpaidRevenue: number;
        totalOrders: number;
        totalRevenue: number;
      }> = {};
      
      chartData.forEach((item, index) => {
        const weekNumber = Math.floor(index / 7);
        const weekKey = `Week ${weekNumber + 1}`;
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            name: weekKey,
            orders: 0,
            revenue: 0,
            users: 0,
            products: 0,
            cancelledOrders: 0,
            refundedRevenue: 0,
            completedOrders: 0,
            pendingOrders: 0,
            paidRevenue: 0,
            unpaidRevenue: 0,
            totalOrders: 0,
            totalRevenue: 0,
          };
        }
        
        weeklyData[weekKey].orders += item.totalOrders;
        weeklyData[weekKey].revenue += item.totalRevenue;
        weeklyData[weekKey].cancelledOrders += item.cancelledOrders || 0;
        weeklyData[weekKey].refundedRevenue += item.refundedRevenue || 0;
        weeklyData[weekKey].completedOrders += item.completedOrders || 0;
        weeklyData[weekKey].pendingOrders += item.pendingOrders || 0;
        weeklyData[weekKey].paidRevenue += item.paidRevenue || 0;
        weeklyData[weekKey].unpaidRevenue += item.unpaidRevenue || 0;
        weeklyData[weekKey].totalOrders += item.totalOrders || 0;
        weeklyData[weekKey].totalRevenue += item.totalRevenue || 0;
      });
      
      return Object.values(weeklyData);
    }

    // For year, group by month
    if (periodType === 'year') {
      const monthlyData: Map<number, {
        name: string;
        orders: number;
        revenue: number;
        users: number;
        products: number;
        cancelledOrders: number;
        refundedRevenue: number;
        completedOrders: number;
        pendingOrders: number;
        paidRevenue: number;
        unpaidRevenue: number;
        totalOrders: number;
        totalRevenue: number;
      }> = new Map();
      
      const currentYear = new Date().getFullYear();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      chartData.forEach((item) => {
        // Parse the date from item.date or item.label
        const dateStr = item.date || item.label;
        const date = new Date(dateStr);
        
        // Only include data from current year
        if (date.getFullYear() !== currentYear) return;
        
        const monthIndex = date.getMonth();
        
        if (!monthlyData.has(monthIndex)) {
          monthlyData.set(monthIndex, {
            name: monthNames[monthIndex],
            orders: 0,
            revenue: 0,
            users: 0,
            products: 0,
            cancelledOrders: 0,
            refundedRevenue: 0,
            completedOrders: 0,
            pendingOrders: 0,
            paidRevenue: 0,
            unpaidRevenue: 0,
            totalOrders: 0,
            totalRevenue: 0,
          });
        }
        
        const monthData = monthlyData.get(monthIndex)!;
        monthData.orders += item.totalOrders;
        monthData.revenue += item.totalRevenue;
        monthData.cancelledOrders += item.cancelledOrders || 0;
        monthData.refundedRevenue += item.refundedRevenue || 0;
        monthData.completedOrders += item.completedOrders || 0;
        monthData.pendingOrders += item.pendingOrders || 0;
        monthData.paidRevenue += item.paidRevenue || 0;
        monthData.unpaidRevenue += item.unpaidRevenue || 0;
        monthData.totalOrders += item.totalOrders || 0;
        monthData.totalRevenue += item.totalRevenue || 0;
      });
      
      // Sort by month index and return
      return Array.from(monthlyData.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([_, data]) => data);
    }

    return chartData.map(item => ({
      name: item.label,
      orders: item.totalOrders,
      revenue: item.totalRevenue,
      users: 0,
      products: 0,
      cancelledOrders: item.cancelledOrders || 0,
      refundedRevenue: item.refundedRevenue || 0,
      completedOrders: item.completedOrders || 0,
      pendingOrders: item.pendingOrders || 0,
      paidRevenue: item.paidRevenue || 0,
      unpaidRevenue: item.unpaidRevenue || 0,
      totalOrders: item.totalOrders || 0,
      totalRevenue: item.totalRevenue || 0,
    }));
  };

  // Use new API data if available, fallback to legacy stats
  const displayStats = data ? {
    totalUsers: data.summary.totalUsers,
    totalProducts: data.summary.totalProducts,
    todayOrders: data.summary.totalOrders,
    todayRevenue: data.summary.totalRevenue,
    chartData: aggregateChartData(data.chartData, period),
  } : stats;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center shadow-lg">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">An error occurred</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={onRefresh}
          className="cursor-pointer bg-gray-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 text-sm mt-1">Track your business metrics and performance</p>
        </div>
        
        {/* Period Selector & Export */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 border border-gray-200">
            {['day', 'week', 'month', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p as 'day' | 'week' | 'month' | 'year')}
                className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === p
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                {p === 'day' ? 'Day' : p === 'week' ? 'Week' : p === 'month' ? 'Month' : 'Year'}
              </button>
            ))}
          </div>
          <ExportExcelButton onClick={onExportExcel!} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatsCard
          title="Total users"
          value={displayStats?.totalUsers || 0}
          icon={(
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )}
          trend={data ? undefined : stats?.userGrowth}
          accentColor="blue"
        />
        <StatsCard
          title="Total products"
          value={displayStats?.totalProducts || 0}
          icon={(
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          )}
          trend={data ? undefined : stats?.productGrowth}
          accentColor="blue"
        />
        <StatsCard
          title="Total orders"
          value={displayStats?.todayOrders || 0}
          icon={(
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          )}
          trend={data ? undefined : stats?.orderGrowth}
          accentColor="blue"
        />
        <StatsCard
          title="Total revenue"
          value={`${(displayStats?.todayRevenue || 0).toLocaleString('en-US')} VND`}
          icon={(
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          )}
          trend={data ? undefined : stats?.revenueGrowth}
          accentColor="blue"
        />
      </div>

      {/* Charts Section */}
      {loading ? (
        // Skeleton for Charts
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <Skeleton className="w-full h-[450px]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DashboardCharts chartData={displayStats?.chartData} />
      )}
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  accentColor: 'blue' | 'green'; 
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, accentColor, description }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      ring: 'ring-blue-100',
      text: 'text-blue-600',
      borderBottom: 'border-b-blue-500'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-500 to-green-600',
      ring: 'ring-green-100',
      text: 'text-green-600',
      borderBottom: 'border-b-green-500'
    }
  };

  const colors = colorClasses[accentColor];

  return (
    <div className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-t border-x border-gray-100 border-b-4 ${colors.borderBottom} group`}>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            {trend !== undefined && (
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                trend >= 0 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                <svg className={`w-3 h-3 ${trend >= 0 ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
          <div className={`flex-shrink-0 w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};
