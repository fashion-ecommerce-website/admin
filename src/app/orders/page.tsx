'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';

export default function OrdersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Xuất báo cáo
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Danh sách đơn hàng</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-500">Tính năng đang được phát triển...</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
