'use client';

import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';

interface ChartData {
  name: string;
  orders: number;
  revenue: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  paidRevenue: number;
  unpaidRevenue: number;
  refundedRevenue: number;
}

interface DashboardChartsProps {
  chartData?: ChartData[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ chartData = [] }) => {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>No chart data available</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue Area Chart */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Revenue Chart</h3>
                <p className="text-gray-600 text-sm mt-1">Revenue breakdown by period</p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <Legend color="bg-blue-500" label="Total" />
                <Legend color="bg-green-500" label="Paid" />
                <Legend color="bg-orange-500" label="Unpaid" />
                <Legend color="bg-red-500" label="Refunded" />
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="unpaidGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="refundGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number) => [`${value.toLocaleString('en-US')} VND`]}
                  labelStyle={{ color: '#374151', fontWeight: '600' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fill="url(#revenueGradient)" name="Total Revenue" />
                <Area type="monotone" dataKey="paidRevenue" stroke="#10b981" strokeWidth={2} fill="url(#paidGradient)" name="Paid" />
                <Area type="monotone" dataKey="unpaidRevenue" stroke="#f59e0b" strokeWidth={2} fill="url(#unpaidGradient)" name="Unpaid" />
                <Area type="monotone" dataKey="refundedRevenue" stroke="#ef4444" strokeWidth={2} fill="url(#refundGradient)" name="Refunded" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Orders Chart</h3>
                <p className="text-gray-600 text-sm mt-1">Orders breakdown by period</p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <Legend color="bg-green-500" label="Completed" />
                <Legend color="bg-yellow-500" label="Pending" />
                <Legend color="bg-red-500" label="Cancelled" />
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ color: '#374151', fontWeight: '600' }}
                />
                <Bar dataKey="completedOrders" stackId="orders" fill="#10b981" name="Completed" />
                <Bar dataKey="pendingOrders" stackId="orders" fill="#f59e0b" name="Pending" />
                <Bar dataKey="cancelledOrders" stackId="orders" fill="#ef4444" radius={[8, 8, 0, 0]} name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const Legend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center space-x-2">
    <div className={`w-3 h-3 ${color} rounded-full`}></div>
    <span className="text-sm text-gray-600">{label}</span>
  </div>
);
