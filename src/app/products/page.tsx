'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProductsContainer } from '@/features/products';

export default function ProductsPage() {
  return (
    <AdminLayout>
      <ProductsContainer />
    </AdminLayout>
  );
}
