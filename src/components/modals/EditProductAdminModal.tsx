"use client";

import React, { useEffect, useState } from "react";
import { useToast } from "@/providers/ToastProvider";
import { useDispatch, useSelector } from 'react-redux';
import { updateProductSuccess, fetchProductsSilentRequest } from '@/features/products/redux/productSlice';
import { RootState } from '@/store';
import { categoryApi } from "@/services/api/categoryApi";
import { productApi } from "@/services/api/productApi";
import type { UpdateProductRequest } from "@/types/product.types";
import type { CategoryBackend } from "@/services/api/categoryApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  initial?: {
    title?: string;
    description?: string;
    categoryIds?: number[];
  };
}

export const EditProductAdminModal: React.FC<Props> = ({
  isOpen,
  onClose,
  productId,
  initial,
}) => {
  const { showSuccess, showError } = useToast();
  const dispatch = useDispatch();
  const { pagination, filters } = useSelector((s: RootState) => s.product);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryBackend[]>([]);
  const [categoryLabels, setCategoryLabels] = useState<Record<number, string>>({});
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [categoryId, setCategoryId] = useState<number | undefined>(
    initial?.categoryIds && initial.categoryIds.length > 0 ? initial.categoryIds[0] : undefined
  );

  useEffect(() => {
    if (isOpen) {
      setTitle(initial?.title || "");
      setDescription(initial?.description || "");
      setCategoryId(initial?.categoryIds && initial.categoryIds.length > 0 ? initial.categoryIds[0] : undefined);
      loadCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      // Use the tree endpoint to get nested category structure reliably
      const res = await categoryApi.getTree();
      if (res.success && res.data && Array.isArray(res.data)) {
        const items: CategoryBackend[] = res.data as CategoryBackend[];

        // Build labels for leaves like "Áo Quần > Áo > Áo thun"
        const leafItemsWithLabels: Array<{ node: CategoryBackend; label: string }> = [];
        const traverse = (nodes: CategoryBackend[] = [], parents: string[] = []) => {
          for (const n of nodes) {
            const currentPath = [...parents, n.name];
            // Treat nodes with children === null OR empty-array children as leaves
            const isLeaf = n.children === null || (Array.isArray(n.children) && n.children.length === 0);
            if (isLeaf) {
              leafItemsWithLabels.push({ node: n, label: currentPath.join(' > ') });
            } else if (Array.isArray(n.children) && n.children.length > 0) {
              traverse(n.children, currentPath);
            }
          }
        };
        traverse(items);

        const leafItems = leafItemsWithLabels.map((x) => x.node);
        const labelsMap: Record<number, string> = {};
        for (const it of leafItemsWithLabels) labelsMap[it.node.id] = it.label;

        setCategories(leafItems);
        setCategoryLabels(labelsMap);

        // If an initial categoryId was provided, prefer it but only if it's a leaf.
        const initialId = initial?.categoryIds && initial.categoryIds.length > 0 ? initial.categoryIds[0] : undefined;
        if (initialId !== undefined) {
          const exists = leafItems.some((c) => c.id === initialId);
          if (exists) {
            setCategoryId(initialId);
          } else if (leafItems.length > 0) {
            // fallback to first leaf if initial is not selectable
            setCategoryId(leafItems[0].id);
          }
        } else {
          if (leafItems.length > 0) setCategoryId(leafItems[0].id);
        }
      } else {
        showError("Failed to load categories");
      }
    } catch {
      showError("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const validate = (): boolean => {
    if (!title || title.trim().length === 0) {
      showError("Title is required");
      return false;
    }
    if (title.length > 500) {
      showError("Title must be 500 characters or less");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const body = {
        title: title.trim(),
        description: description?.trim(),
        categoryIds: categoryId !== undefined ? [categoryId] : [],
      };

      // Use the new admin update endpoint which accepts JSON body at /products/admin/{id}
      // Local type that includes categoryIds for the admin JSON endpoint
      type AdminUpdateBody = Partial<UpdateProductRequest> & { categoryIds?: number[] };
      const reqBody: AdminUpdateBody = {
        title: body.title,
        description: body.description,
        categoryIds: body.categoryIds,
      };

      const res = await productApi.updateProductAdmin(productId, reqBody as Partial<UpdateProductRequest> & { categoryIds?: number[] });
      if (res.success) {
  // After update, fetch full product from server to ensure derived/related fields
  // (like categoryId, variant arrays) are populated as the admin update response
  // may be partial. If fetching fails, fall back to the response data.
        try {
          const full = await productApi.getProductById(productId);
          if (full.success && full.data) {
            dispatch(updateProductSuccess({ product: full.data }));
          } else if (res.data) {
            dispatch(updateProductSuccess({ product: res.data }));
          }
          // Also re-fetch current product list page to keep pagination/ordering consistent
          try {
            dispatch(fetchProductsSilentRequest({
              page: pagination.page,
              pageSize: pagination.pageSize,
              title: filters.title || undefined,
              categorySlug: filters.categorySlug || undefined,
              isActive: filters.isActive ?? undefined,
              sortBy: filters.sortBy,
              sortDirection: filters.sortDirection,
            }));
          } catch {
            // ignore
          }
        } catch {
          if (res.data) dispatch(updateProductSuccess({ product: res.data }));
        }
        showSuccess("Product updated successfully");
        onClose();
      } else {
        showError(res.message || "Failed to update product");
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-black px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Edit Product</h3>
            <button onClick={onClose} className="text-white">
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Category</label>
            <select
              value={categoryId !== undefined ? String(categoryId) : ''}
              onChange={(e) => {
                const v = e.target.value;
                setCategoryId(v ? parseInt(v, 10) : undefined);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
              disabled={categoriesLoading}
            >
              <option value="" disabled>
                {categoriesLoading ? 'Loading...' : 'Select a category'}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>{categoryLabels[c.id] ?? c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-black text-white rounded-lg">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductAdminModal;
