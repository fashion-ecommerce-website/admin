'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { OrdersContainer } from '@/features/orders';

export default function OrdersPage() {
  return (
    <AuthGuard>
      <AdminLayout>
        <OrdersContainer />
      </AdminLayout>
    </AuthGuard>
  );
}
