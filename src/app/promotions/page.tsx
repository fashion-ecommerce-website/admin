"use client";

import React from "react";
import { PromotionsContainer } from "../../features/promotions";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function PromotionsPage() {
  return (
    <AuthGuard>
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <PromotionsContainer />
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
