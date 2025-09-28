"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  categoryApi,
  CategoryBackend,
  CategoryListResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  GetCategoriesRequest,
} from "@/services/api/categoryApi";
import { useToast } from "@/providers/ToastProvider";
import {
  AddCategoryModal,
  EditCategoryModal,
} from "@/components/modals/CategoryModals";

export default function CategoriesPage() {
  const { showError, showSuccess } = useToast();

  const [categories, setCategories] = useState<CategoryBackend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryBackend | null>(null);

  // pagination & filters
  const [pagination, setPagination] = useState<Partial<CategoryListResponse>>({
    page: 0,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [search, setSearch] = useState("");

  const fetchCategories = async (params?: GetCategoriesRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const requestParams: GetCategoriesRequest = params ?? {
        page: pagination.page ?? 0,
        pageSize: pagination.pageSize ?? 10,
        search: search || undefined,
      };

      const res = await categoryApi.getAllCategories(requestParams);
      if (res.success && res.data) {
        const items = Array.isArray(res.data)
          ? res.data
          : (res.data as CategoryListResponse).items || [];
        setCategories(items);
        // update pagination state
        const p = res.data as CategoryListResponse;
        if (p && typeof p.page === "number") {
          setPagination({
            page: p.page,
            pageSize: p.pageSize,
            totalItems: p.totalItems,
            totalPages: p.totalPages,
            hasNext: p.hasNext,
            hasPrevious: p.hasPrevious,
          });
        }
      } else {
        setError(res.message || "Không thể tải danh mục");
        setCategories([]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi kết nối";
      setError(msg);
      showError("Lỗi", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async (categoryData: CreateCategoryRequest) => {
    try {
      const response = await categoryApi.createCategory(categoryData);
      if (response.success && response.data) {
        showSuccess(
          "Tạo loại thành công",
          `Đã tạo loại "${categoryData.name}"`
        );
        // Refresh the list
        await fetchCategories();
      } else {
        showError(
          "Lỗi tạo loại",
          response.message || "Không thể tạo loại sản phẩm"
        );
        throw new Error(response.message || "Failed to create category");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi kết nối";
      showError("Lỗi", msg);
      throw err; // Re-throw to let modal handle the error state
    }
  };

  const handleEditCategory = (category: CategoryBackend) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleUpdateCategory = async (categoryData: UpdateCategoryRequest) => {
    try {
      const response = await categoryApi.updateCategory(categoryData);
      if (response.success && response.data) {
        showSuccess(
          "Cập nhật thành công",
          `Đã cập nhật loại "${categoryData.name}"`
        );
        // Refresh the list
        await fetchCategories();
      } else {
        showError(
          "Lỗi cập nhật",
          response.message || "Không thể cập nhật loại sản phẩm"
        );
        throw new Error(response.message || "Failed to update category");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi kết nối";
      showError("Lỗi", msg);
      throw err; // Re-throw to let modal handle the error state
    }
  };

  useEffect(() => {
    // initial fetch
    fetchCategories({
      page: pagination.page ?? 0,
      pageSize: pagination.pageSize ?? 10,
      search: search || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refetch when pagination or search changes
  useEffect(() => {
    fetchCategories({
      page: pagination.page ?? 0,
      pageSize: pagination.pageSize ?? 10,
      search: search || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.pageSize, search]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black">Category Management</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              Add Category
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-black">Category List</h3>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black" />
              </div>
            ) : error ? (
              <div className="text-center text-black">{error}</div>
            ) : categories.length === 0 ? (
              <div className="text-black">No categories available.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">
                        Slug
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {categories.map((cat) => (
                      <tr key={cat.id}>
                        <td className="px-6 py-3 text-sm text-black">
                          {cat.id}
                        </td>
                        <td className="px-6 py-3 text-sm text-black">
                          {cat.name}
                        </td>
                        <td className="px-6 py-3 text-sm text-black">
                          {cat.slug}
                        </td>
                        <td className="px-6 py-3 text-sm">
                          {cat.isActive ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black text-white">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-black text-black">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditCategory(cat)}
                              className="text-sm px-3 py-1 border border-black rounded text-black bg-white"
                            >
                              Edit
                            </button>
                            <button className="text-sm px-3 py-1 border border-black text-black rounded bg-white">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Pagination controls */}
            {!isLoading && categories.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-black">
                <div className="text-sm text-black">
                  Showing{" "}
                  {(pagination.page ?? 0) * (pagination.pageSize ?? 10) + 1} -{" "}
                  {Math.min(
                    ((pagination.page ?? 0) + 1) * (pagination.pageSize ?? 10),
                    pagination.totalItems ?? 0
                  )}{" "}
                  of {pagination.totalItems ?? 0}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={!pagination.hasPrevious}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.max((prev.page ?? 0) - 1, 0),
                      }))
                    }
                    className="px-3 py-1 border border-black rounded disabled:opacity-50 text-black"
                  >
                    Prev
                  </button>
                  {/* page numbers */}
                  {Array.from({
                    length: Math.max(1, pagination.totalPages ?? 1),
                  }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: idx }))
                      }
                      className={`px-3 py-1 border rounded ${
                        idx === (pagination.page ?? 0)
                          ? "bg-black text-white"
                          : "border-black text-black"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    disabled={!pagination.hasNext}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.min(
                          (prev.page ?? 0) + 1,
                          (prev.totalPages ?? 1) - 1
                        ),
                      }))
                    }
                    className="px-3 py-1 border border-black rounded disabled:opacity-50 text-black"
                  >
                    Next
                  </button>
                  <select
                    value={pagination.pageSize ?? 10}
                    onChange={(e) =>
                      setPagination((prev) => ({
                        ...prev,
                        pageSize: Number(e.target.value),
                        page: 0,
                      }))
                    }
                    className="ml-2 border-black border p-1 rounded text-black"
                  >
                    {[5, 10, 20, 50].map((s) => (
                      <option key={s} value={s}>
                        {s} / page
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
        }}
        onSubmit={handleCreateCategory}
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCategory(null);
        }}
        onSuccess={() => {
          setShowEditModal(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleUpdateCategory}
        category={selectedCategory}
      />
    </AdminLayout>
  );
}
