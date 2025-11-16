import dynamic from 'next/dynamic';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';

const ImportCSVPage = dynamic(() => import('@/features/products/components/ImportCSVPage'));

export default function ImportCSVRoutePage() {
  return (
    <AuthGuard>
      <AdminLayout>
        <ImportCSVPage />
      </AdminLayout>
    </AuthGuard>
  );
}
