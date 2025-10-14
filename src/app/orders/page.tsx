'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function OrdersPage() {
  return (
    <AuthGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <button className="bg-black text-white px-4 py-2 rounded-lg ">
              Export report
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Orders list</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-500">This feature is under development...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
