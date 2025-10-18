"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/providers/ToastProvider";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  // optional preset parent id when opening modal for adding a child
  presetParentId?: number | null;
  onSubmit: (data: {
    name: string;
    slug: string;
    parentId: number | null;
  }) => Promise<void>;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  presetParentId,
  onSubmit,
}) => {
  const { showError } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parentId: null as number | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-generate slug from name
      if (field === "name") {
        updated.slug = value
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
          .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
          .replace(/\s+/g, "-") // Replace spaces with hyphens
          .replace(/-+/g, "-") // Replace multiple hyphens
          .trim();
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.slug.trim()) {
      showError("Input error", "Please enter a valid name and slug");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ name: "", slug: "", parentId: null });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: "", slug: "", parentId: null });
      onClose();
    }
  };

  // If modal opened with a preset parentId, populate it
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({ ...prev, parentId: presetParentId ?? null }));
    }
    // reset when modal closes
    if (!isOpen) {
      setFormData({ name: "", slug: "", parentId: null });
    }
  }, [isOpen, presetParentId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-black">Add Category</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Category Name
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50"
              placeholder="Enter category name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Slug
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange("slug", e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50"
              placeholder="slug-auto-generated"
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-500 text-black rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting || !formData.name.trim() || !formData.slug.trim()
              }
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                "Add Category"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (data: {
    id: number;
    name: string;
    slug: string;
    parentId: number | null;
  }) => Promise<void>;
  // the category being edited; backend should include parentId if available
  category: {
    id: number;
    name: string;
    slug: string;
    isActive: boolean;
    parentId?: number | null;
    children: any;
  } | null;
  // optional full category tree used to select a parent
  categories?: {
    id: number;
    name: string;
    slug: string;
    children?: any;
  }[];
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSubmit,
  category,
  categories,
}) => {
  const { showError } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parentId: null as number | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when category changes
  useEffect(() => {
    if (category && isOpen) {
      setFormData({
        name: category.name,
        slug: category.slug,
        // initialize parentId from category.parentId if provided, otherwise null
        parentId: category.parentId !== undefined ? category.parentId : null,
      });
    }
  }, [category, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-generate slug from name
      if (field === "name") {
        updated.slug = value
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
          .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
          .replace(/\s+/g, "-") // Replace spaces with hyphens
          .replace(/-+/g, "-") // Replace multiple hyphens
          .trim();
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.slug.trim() || !category) {
      showError("Input error", "Please enter a valid name and slug");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        id: category.id,
        ...formData,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-black">Edit Category</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Category Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border text-gray-800 border-gray-300 rounded-lg "
              placeholder="Enter category name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange("slug", e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg  text-gray-800"
              placeholder="slug-auto-generated"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Slug will be auto-generated from name
            </p>
          </div>

          {/* Parent category selector */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Parent category
            </label>
            <select
              value={formData.parentId ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  parentId: e.target.value === "" ? null : Number(e.target.value),
                }))
              }
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
            >
              <option value="">-- No parent (top level) --</option>
              {/**
               * Render a flat list of provided categories. The caller should pass
               * a tree; here we flatten it but exclude the current category to
               * avoid self-parenting.
               */}
              {categories &&
                (function flatten(nodes: any[] = []) {
                  const list: any[] = [];
                  const walk = (items: any[], prefix = "") => {
                    for (const it of items) {
                      list.push(it);
                      if (it.children && it.children.length) walk(it.children, prefix + "-");
                    }
                  };
                  walk(nodes);
                  return list;
                })(categories)
                  .filter((c) => c.id !== category?.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.name.trim() ||
                !formData.slug.trim()
              }
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
