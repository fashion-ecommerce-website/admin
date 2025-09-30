'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProductsContainer } from '@/features/products';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function ProductsPage() {
  return (
    <AuthGuard>
      <AdminLayout>
        <ProductsContainer />
      </AdminLayout>
    </AuthGuard>
  );
}
