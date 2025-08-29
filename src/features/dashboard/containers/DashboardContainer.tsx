'use client';

import React, { useEffect, useState } from 'react';
import { DashboardPresenter } from '../components/DashboardPresenter';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  todayOrders: number;
  todayRevenue: number;
  userGrowth?: number;
  productGrowth?: number;
  orderGrowth?: number;
  revenueGrowth?: number;
  recentActivities?: any[];
}

export const DashboardContainer: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call - replace with real API later
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockStats: DashboardStats = {
        totalUsers: 1250,
        totalProducts: 89,
        todayOrders: 25,
        todayRevenue: 2750000,
        userGrowth: 8.2,
        productGrowth: 12.5,
        orderGrowth: -3.1,
        revenueGrowth: 15.7,
        recentActivities: [
          {
            id: '1',
            type: 'ORDER_PLACED',
            description: 'Đơn hàng #12345 được đặt bởi Nguyễn Văn A',
            timestamp: new Date().toISOString(),
          },
          {
            id: '2',
            type: 'USER_REGISTERED',
            description: 'Người dùng mới đăng ký: user@example.com',
            timestamp: new Date(Date.now() - 300000).toISOString(),
          },
          {
            id: '3',
            type: 'PRODUCT_ADDED',
            description: 'Sản phẩm "Áo thun nam" được thêm vào hệ thống',
            timestamp: new Date(Date.now() - 600000).toISOString(),
          },
        ],
      };
      
      setStats(mockStats);
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    fetchStats();
  };

  return (
    <DashboardPresenter
      stats={stats}
      loading={loading}
      error={error}
      onRefresh={handleRefresh}
    />
  );
};
