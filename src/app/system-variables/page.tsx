"use client";

import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SystemVariablesContainer } from '@/features/system-variables/containers/SystemVariablesContainer';

export default function SystemVariablesPage() {
  return (
    <AuthGuard>
      <AdminLayout>
        <SystemVariablesContainer />
      </AdminLayout>
    </AuthGuard>
  );
}