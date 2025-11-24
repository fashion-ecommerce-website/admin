import { AdminLayout } from '@/components/layout/AdminLayout';
import ImportCSVContainer from '@/features/products/containers/ImportCSVContainer';

export default function ImportCSVRoutePage() {
  return (
    <AdminLayout>
      <ImportCSVContainer />
    </AdminLayout>
  );
}
