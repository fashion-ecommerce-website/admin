"use client";

import React, { useState } from "react";
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../../../types/category.types";
import {
  AddCategoryModal,
  EditCategoryModal,
} from "../../../components/modals/CategoryModals";
import ConfirmModal from "../../../components/modals/ConfirmModal";

interface CategoriesPresenterProps {
  categories: Category[];
  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  toggleLoading: boolean;
  onCreateCategory: (categoryData: CreateCategoryRequest) => void;
  onUpdateCategory: (categoryData: UpdateCategoryRequest) => void;
  onToggleStatus: (id: number) => void;
}

export const CategoriesPresenter: React.FC<CategoriesPresenterProps> = ({
  categories,
  loading,
  toggleLoading,
  onCreateCategory,
  onUpdateCategory,
  onToggleStatus,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [createParentId, setCreateParentId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<(Category & { parentId?: number | null }) | null>(null);

  // Confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const handleEditCategory = (category: Category) => {
    // Find parentId by traversing the tree
    const findParentId = (nodes: Category[], targetId: number): number | null => {
      for (const node of nodes) {
        if (node.children && node.children.some((c) => c.id === targetId)) {
          return node.id;
        }
        if (node.children && node.children.length) {
          const found = findParentId(node.children, targetId);
          if (found !== null) return found;
        }
      }
      return null;
    };

    const parentId = findParentId(categories, category.id);
    setSelectedCategory({ ...category, parentId });
    setShowEditModal(true);
  };

  const handleAddChild = (parentId: number) => {
    setCreateParentId(parentId);
    setShowAddModal(true);
  };

  const handleToggleStatus = (id: number) => {
    setConfirmingId(id);
    setConfirmOpen(true);
  };

  const handleConfirmToggle = () => {
    if (confirmingId !== null) {
      onToggleStatus(confirmingId);
      setConfirmOpen(false);
      setConfirmingId(null);
    }
  };

  const handleCreateCategory = async (categoryData: CreateCategoryRequest) => {
    const payload: CreateCategoryRequest = {
      ...categoryData,
      parentId:
        categoryData.parentId !== undefined && categoryData.parentId !== null
          ? categoryData.parentId
          : createParentId ?? null,
    };
    onCreateCategory(payload);
  };

  // Recursive node renderer
  const CategoryNode: React.FC<{
    node: Category;
    level?: number;
  }> = ({ node, level = 0 }) => {
    const [open, setOpen] = useState(true);

    return (
      <div className="w-full">
        <div
          className="flex items-center justify-between p-5 border border-gray-200 rounded-xl mb-3 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
          style={{ marginLeft: level * 24 }}
        >
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setOpen((s) => !s)}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              {node.children && node.children.length > 0 ? (
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${
                    open ? "rotate-90" : ""
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    d="M9 18l6-6-6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-300"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="12" r="2" />
                </svg>
              )}
            </button>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-lg">
                  {node.name}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <button
                onClick={() => handleToggleStatus(node.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  node.isActive ? "bg-green-500" : "bg-gray-300"
                }`}
                aria-label={`Toggle status - currently ${
                  node.isActive ? "active" : "inactive"
                }`}
                title={`Click to ${
                  node.isActive ? "deactivate" : "activate"
                } category`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    node.isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddChild(node.id)}
                className="p-2.5 border border-gray-200 rounded-lg text-gray-600 hover:text-black hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                aria-label="Add child"
                title="Add child category"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    d="M12 5v14M5 12h14"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                onClick={() => handleEditCategory(node)}
                className="p-2.5 border border-gray-200 rounded-lg text-gray-600 hover:text-black hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                aria-label="Edit"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {open && node.children && node.children.length > 0 && (
          <div className="ml-6">
            {node.children.map((child) => (
              <CategoryNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Category Management
          </h1>
          <p className="text-gray-600 mt-2">
            Organize and manage your product categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCreateParentId(null);
              setShowAddModal(true);
            }}
            className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                d="M12 5v14M5 12h14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Add Category
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-gray-900">
              Category Tree
            </h3>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-black mb-4" />
              <p className="text-gray-600 font-medium">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-gray-900 font-semibold text-lg mb-2">
                No categories available
              </p>
              <p className="text-gray-600">
                Get started by creating your first category
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <CategoryNode key={cat.id} node={cat} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showAddModal}
        presetParentId={createParentId}
        onClose={() => {
          setShowAddModal(false);
          setCreateParentId(null);
        }}
        onSuccess={() => {
          setShowAddModal(false);
          setCreateParentId(null);
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
        onSubmit={async (data) => onUpdateCategory(data)}
        category={selectedCategory}
        categories={categories}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        title="Confirm switch category status"
        description="Are you sure you want to switch the status of this category? This action will activate/deactivate the category and may affect related products."
        confirmLabel="Yes, switch status"
        cancelLabel="Cancel"
        loading={toggleLoading}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmingId(null);
        }}
        onConfirm={handleConfirmToggle}
      />
    </div>
  );
};
