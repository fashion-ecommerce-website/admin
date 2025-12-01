"use client";

import { AdminLayout } from '@/components/layout/AdminLayout';
import { UsersContainer } from '@/features/users';

export default function UsersPage() {
  return (
    <AdminLayout>
      <UsersContainer />
    </AdminLayout>
  );
}


