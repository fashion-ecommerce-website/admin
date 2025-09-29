"use client";

import { AdminLayout } from '@/components/layout/AdminLayout';
import { UsersContainer } from '@/features/users';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function UsersPage() {
  return (
    <AuthGuard>
        <UsersContainer />
    </AuthGuard>
  );
}


