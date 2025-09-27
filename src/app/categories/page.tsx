'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { categoryApi, CategoryBackend, CreateCategoryRequest, UpdateCategoryRequest } from '@/services/api/categoryApi';
import { useToast } from '@/providers/ToastProvider';
import { AddCategoryModal, EditCategoryModal } from '@/components/modals/CategoryModals';

export default function CategoriesPage() {
  const { showError, showSuccess } = useToast();

  const [categories, setCategories] = useState<CategoryBackend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryBackend | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await categoryApi.getAllCategories();
      if (res.success && res.data) {
        setCategories(res.data);
        showSuccess('Tải danh mục thành công', `Đã tải ${res.data.length} danh mục`);
      } else {
        setError(res.message || 'Không thể tải danh mục');
        showError('Lỗi tải danh mục', res.message || 'Không thể tải danh mục');
        // Fallback: set empty list
        setCategories([]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối';
      setError(msg);
      showError('Lỗi', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async (categoryData: CreateCategoryRequest) => {
    try {
      const response = await categoryApi.createCategory(categoryData);
      if (response.success && response.data) {
        showSuccess('Tạo loại thành công', `Đã tạo loại "${categoryData.name}"`);
        // Refresh the list
        await fetchCategories();
      } else {
        showError('Lỗi tạo loại', response.message || 'Không thể tạo loại sản phẩm');
        throw new Error(response.message || 'Failed to create category');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối';
      showError('Lỗi', msg);
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
        showSuccess('Cập nhật thành công', `Đã cập nhật loại "${categoryData.name}"`);
        // Refresh the list
        await fetchCategories();
      } else {
        showError('Lỗi cập nhật', response.message || 'Không thể cập nhật loại sản phẩm');
        throw new Error(response.message || 'Failed to update category');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối';
      showError('Lỗi', msg);
      throw err; // Re-throw to let modal handle the error state
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
            <button onClick={fetchCategories} className="border border-gray-400 text-gray-600 px-4 py-2 rounded-lg">Reload</button>
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
              <div className="text-center text-red-600">{error}</div>
            ) : categories.length === 0 ? (
              <div className="text-gray-600">No categories available.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Slug</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{cat.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{cat.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{cat.slug}</td>
                        <td className="px-6 py-4 text-sm">
                          {cat.isActive ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black text-white">Active</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-700">Inactive</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleEditCategory(cat)}
                              className="text-sm px-3 py-1 border border-black rounded text-black bg-white"
                            >
                              Edit
                            </button>
                            <button className="text-sm px-3 py-1 border border-gray-400 text-gray-600 rounded bg-white">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
