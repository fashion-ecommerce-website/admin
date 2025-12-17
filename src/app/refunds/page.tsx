'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { RefundsContainer } from '@/features/refunds';

export default function RefundsPage() {
  return (
    <AdminLayout>
      <RefundsContainer />
    </AdminLayout>
  );
}
