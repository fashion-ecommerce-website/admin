"use client";

import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { SystemVariablesContainer } from '@/features/system-variables/containers/SystemVariablesContainer';

export default function SystemVariablesPage() {
  return (
    <AdminLayout>
      <SystemVariablesContainer />
    </AdminLayout>
  );
}