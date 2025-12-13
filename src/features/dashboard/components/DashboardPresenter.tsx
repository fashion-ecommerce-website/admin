'use client';

import React from 'react';
import { DashboardCharts } from './DashboardCharts';
import { Skeleton } from '@/components/ui/Skeleton';
import ExportExcelButton from '@/components/ui/ExportExcelButton';
import type { DashboardResponse, PeriodType } from '@/services/api/dashboardApi';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface DashboardPresenterProps {
  data: DashboardResponse | null;
  loading: boolean;
  error: string | null;
  period: PeriodType;
  onRefresh: () => void;
  onPeriodChange: (period: PeriodType) => void;
  onExportExcel?: () => void;
}

export const DashboardPresenter: React.FC<DashboardPresenterProps> = ({
  data,
  loading,
  error,
  period,
  onRefresh,
  onPeriodChange,
  onExportExcel,
}) => {
  // Transform chart data for display
  const transformedChartData = React.useMemo(() => {
    if (!data?.chartData) return [];
    
    // For YEAR period, reverse to show from oldest to newest (2014 → 2025)
    const chartData = period === 'YEAR' 
      ? [...data.chartData].reverse() 
      : data.chartData;
    
    return chartData.map(item => {
      let label: string;
      if (period === 'MONTH') {
        const monthIndex = parseInt(item.target, 10) - 1;
        label = MONTH_NAMES[monthIndex] || item.target;
      } else {
        label = item.target;
      }
      
      return {
        name: label,
        orders: item.totalOrders,
        revenue: item.totalRevenue,
        completedOrders: item.completedOrders,
        pendingOrders: item.pendingOrders,
        cancelledOrders: item.cancelledOrders,
        paidRevenue: item.paidRevenue,
        unpaidRevenue: item.unpaidRevenue,
        refundedRevenue: item.refundedRevenue,
      };
    });
  }, [data?.chartData, period]);

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
          className="cursor-pointer bg-gray-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-900 transition-all duration-200"
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 text-sm mt-1">Track your business metrics and performance</p>
        </div>
        
        {/* Period Selector & Export */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 border border-gray-200">
            {(['MONTH', 'YEAR'] as PeriodType[]).map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === p
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                {p === 'MONTH' ? 'Monthly' : 'Yearly'}
              </button>
            ))}
          </div>
          {onExportExcel && <ExportExcelButton onClick={onExportExcel} />}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatsCard
          title="Total users"
          value={data?.summary.totalUsers || 0}
          loading={loading}
          icon={<UsersIcon />}
        />
        <StatsCard
          title="Total products"
          value={data?.summary.totalProducts || 0}
          loading={loading}
          icon={<ProductsIcon />}
        />
        <StatsCard
          title="Total orders"
          value={data?.summary.totalOrders || 0}
          loading={loading}
          icon={<OrdersIcon />}
        />
        <StatsCard
          title="Total revenue"
          value={`${(data?.summary.totalRevenue || 0).toLocaleString('en-US')} VND`}
          loading={loading}
          icon={<RevenueIcon />}
        />
      </div>

      {/* Charts Section */}
      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56 mt-2" />
              </div>
              <div className="p-4 sm:p-6">
                <Skeleton className="w-full h-[450px]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DashboardCharts chartData={transformedChartData} />
      )}
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, loading }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-t border-x border-gray-100 border-b-4 border-b-blue-500 group">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            )}
          </div>
          <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ProductsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const OrdersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const RevenueIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);
