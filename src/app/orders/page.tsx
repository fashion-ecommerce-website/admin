'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { OrdersContainer } from '@/features/orders';

export default function OrdersPage() {
  return (
    <AdminLayout>
      <OrdersContainer />
    </AdminLayout>
  );
}
