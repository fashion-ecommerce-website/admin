'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { VouchersContainer } from '@/features/vouchers/containers/VouchersContainer';

export default function VouchersPage() {
  return (
    <AdminLayout>
      <VouchersContainer />
    </AdminLayout>
  );
}