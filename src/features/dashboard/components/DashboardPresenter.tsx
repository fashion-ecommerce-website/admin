'use client';

import React from 'react';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  todayOrders: number;
  todayRevenue: number;
  userGrowth?: number;
  productGrowth?: number;
  orderGrowth?: number;
  revenueGrowth?: number;
  recentActivities?: RecentActivity[];
}

interface RecentActivity {
  id: string;
  type: 'USER_REGISTERED' | 'ORDER_PLACED' | 'PRODUCT_ADDED' | 'PRODUCT_UPDATED';
  description: string;
  timestamp: string;
}

interface DashboardPresenterProps {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const DashboardPresenter: React.FC<DashboardPresenterProps> = ({
  stats,
  loading,
  error,
  onRefresh,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin animation-delay-150"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-8 text-center shadow-lg">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">An error occurred</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={onRefresh}
          className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Welcome back! Here is an overview of your system.</p>
        </div>
        <button
          onClick={onRefresh}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </div>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard
          title="Total users"
          value={stats?.totalUsers || 0}
          icon={(
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          )}
          trend={stats?.userGrowth}
          gradient="from-blue-500 to-cyan-500"
          bgGradient="from-blue-50 to-cyan-50"
        />
        <StatsCard
          title="Total products"
          value={stats?.totalProducts || 0}
          icon={(
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          )}
          trend={stats?.productGrowth}
          gradient="from-emerald-500 to-teal-500"
          bgGradient="from-emerald-50 to-teal-50"
        />
        <StatsCard
          title="Today's orders"
          value={stats?.todayOrders || 0}
          icon={(
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          )}
          trend={stats?.orderGrowth}
          gradient="from-orange-500 to-red-500"
          bgGradient="from-orange-50 to-red-50"
        />
        <StatsCard
          title="Today's revenue"
          value={`${(stats?.todayRevenue || 0).toLocaleString('en-US')} VND`}
          icon={(
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          )}
          trend={stats?.revenueGrowth}
          gradient="from-purple-500 to-pink-500"
          bgGradient="from-purple-50 to-pink-50"
        />
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recent activities</h3>
              <p className="text-gray-600 text-sm mt-1">Track the latest activities across the system</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="space-y-4">
            {stats?.recentActivities?.map((activity, index) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 group">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${getActivityStyles(activity.type).bg}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString('en-US')}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${getActivityStyles(activity.type).dot}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  gradient: string;
  bgGradient: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, gradient, bgGradient }) => {
  return (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50 overflow-hidden group`}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            {trend !== undefined && (
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                trend >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <svg className={`w-4 h-4 ${trend >= 0 ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
                <span>{Math.abs(trend)}%</span>
                <span className="text-gray-500">vs last month</span>
              </div>
            )}
          </div>
          <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        </div>
      </div>
      <div className={`h-2 bg-gradient-to-r ${gradient} opacity-60 group-hover:opacity-80 transition-opacity duration-300`}></div>
    </div>
  );
};

const getActivityStyles = (type: string) => {
  switch (type) {
    case 'ORDER_PLACED':
      return { bg: 'bg-blue-100', dot: 'bg-blue-500' };
    case 'USER_REGISTERED':
      return { bg: 'bg-green-100', dot: 'bg-green-500' };
    case 'PRODUCT_ADDED':
      return { bg: 'bg-purple-100', dot: 'bg-purple-500' };
    case 'PRODUCT_UPDATED':
      return { bg: 'bg-orange-100', dot: 'bg-orange-500' };
    default:
      return { bg: 'bg-gray-100', dot: 'bg-gray-500' };
  }
};

const getActivityIcon = (type: string) => {
  const iconClass = "w-6 h-6";
  
  switch (type) {
    case 'ORDER_PLACED':
      return (
        <svg className={`${iconClass} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      );
    case 'USER_REGISTERED':
      return (
        <svg className={`${iconClass} text-green-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      );
    case 'PRODUCT_ADDED':
      return (
        <svg className={`${iconClass} text-purple-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      );
    case 'PRODUCT_UPDATED':
      return (
        <svg className={`${iconClass} text-orange-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    default:
      return (
        <svg className={`${iconClass} text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};
