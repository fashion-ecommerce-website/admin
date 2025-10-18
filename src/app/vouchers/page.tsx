'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { VouchersContainer } from '@/features/vouchers/containers/VouchersContainer';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function VouchersPage() {
  return (
    <AuthGuard>
      <AdminLayout>
        <VouchersContainer />
      </AdminLayout>
    </AuthGuard>
  );
}