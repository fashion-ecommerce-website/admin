'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { DashboardContainer } from '@/features/dashboard';

export default function DashboardPage() {
  return (
    <AdminLayout>
      <DashboardContainer />
    </AdminLayout>
  );
}
