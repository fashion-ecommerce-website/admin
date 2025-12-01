"use client";

import React from "react";
import { CategoriesContainer } from "../../features/categories";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function CategoriesPage() {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <CategoriesContainer />
      </div>
    </AdminLayout>
  );
}
