'use client';

import React, { useState } from 'react';
import { Spinner } from '../ui/Spinner';

// ============ ADD COLOR MODAL ============
interface AddColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; hex?: string }) => Promise<boolean>;
}

export const AddColorModal: React.FC<AddColorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [hex, setHex] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Color name is required');
      return;
    }

    // Validate hex if provided
    if (hex && !/^#([A-Fa-f0-9]{6})$/.test(hex)) {
      setError('Hex code must be in format #XXXXXX (e.g., #FF5733)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await onSubmit({ name: name.trim(), hex: hex || undefined });
      if (success) {
        setName('');
        setHex('');
        onClose();
      }
    } catch {
      setError('Failed to create color. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setHex('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-sm border border-gray-200">
        <h3 className="text-lg font-bold text-black mb-4">Add New Color</h3>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Color Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="e.g., navy blue, beige"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Hex Code <span className="text-gray-400">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => {
                    setHex(e.target.value);
                    setError('');
                  }}
                  placeholder="#FF5733"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
                />
                {hex && /^#([A-Fa-f0-9]{6})$/.test(hex) && (
                  <div
                    className="w-10 h-10 rounded-lg border border-gray-300"
                    style={{ backgroundColor: hex }}
                  />
                )}
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-gray-300 text-black bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Spinner size="xs" color="white" />}
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ============ ADD SIZE MODAL ============
interface AddSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { code: string; label: string }) => Promise<boolean>;
}

export const AddSizeModal: React.FC<AddSizeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Size code is required');
      return;
    }
    if (!label.trim()) {
      setError('Size label is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await onSubmit({ code: code.trim(), label: label.trim() });
      if (success) {
        setCode('');
        setLabel('');
        onClose();
      }
    } catch {
      setError('Failed to create size. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setLabel('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-sm border border-gray-200">
        <h3 className="text-lg font-bold text-black mb-4">Add New Size</h3>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Size Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                placeholder="e.g., XXL, 2XL, 42"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Size Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => {
                  setLabel(e.target.value);
                  setError('');
                }}
                placeholder="e.g., Extra Extra Large, Size 42"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-gray-300 text-black bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Spinner size="xs" color="white" />}
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============ ADD CATEGORY MODAL ============
interface CategoryOption {
  id: number;
  name: string;
  path: string; // Full path like "Men > Tops > T-Shirts"
}

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; slug: string; isActive: boolean; parentId?: number }) => Promise<boolean>;
  parentCategories: CategoryOption[]; // List of possible parent categories
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  parentCategories,
}) => {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Auto-generate slug from name
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    const slug = generateSlug(name);
    if (!slug) {
      setError('Could not generate a valid slug from the name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await onSubmit({
        name: name.trim(),
        slug,
        isActive: true,
        parentId,
      });
      if (success) {
        setName('');
        setParentId(undefined);
        onClose();
      }
    } catch {
      setError('Failed to create category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setParentId(undefined);
    setError('');
    onClose();
  };

  // Get selected parent's path for preview
  const selectedParent = parentCategories.find(c => c.id === parentId);
  const fullPath = selectedParent 
    ? `${selectedParent.path} > ${name || '...'}`
    : name || '...';

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-md border border-gray-200">
        <h3 className="text-lg font-bold text-black mb-4">Add New Category</h3>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Parent Category <span className="text-gray-400">(optional)</span>
              </label>
              <select
                value={parentId ?? ''}
                onChange={(e) => {
                  setParentId(e.target.value ? Number(e.target.value) : undefined);
                  setError('');
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-black bg-white"
              >
                <option value="">-- Root Category (No Parent) --</option>
                {parentCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.path}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Leave empty to create a root category
              </p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="e.g., Jackets, Accessories"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
                autoFocus
              />
            </div>
            {name && (
              <div className="space-y-1">
                <div className="text-xs text-gray-500">
                  Full Path: <span className="font-medium text-black">{fullPath}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Slug: <span className="font-mono bg-gray-100 px-1 rounded">{generateSlug(name) || '...'}</span>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-gray-300 text-black bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Spinner size="xs" color="white" />}
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddColorModal;
