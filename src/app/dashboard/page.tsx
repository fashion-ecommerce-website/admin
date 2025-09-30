'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { DashboardContainer } from '@/features/dashboard';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <AdminLayout>
        <DashboardContainer />
      </AdminLayout>
    </AuthGuard>
  );
}
