'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiClient } from '../../../services/api/baseApi';
import { useToast } from '../../../providers/ToastProvider';
import ImportCSVPresenter from '../components/ImportCSVPresenter';

interface UploadedFile {
  name: string;
  size: number;
  file: File;
}

interface EditForm {
  title: string;
  category: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  imageUrls: string[];
}

interface ProductDetail {
  productTitle?: string;
  title?: string;
  description?: string;
  category?: string;
  color?: string;
  size?: string;
  price: number;
  quantity: number;
  imageUrls?: string[];
  isError?: boolean;
  error?: boolean;
  errorMessage?: string | null;
}

interface ProductGroup {
  productTitle?: string;
  title?: string;
  description?: string;
  category?: string;
  imageUrls?: string[];
  productDetails?: ProductDetail[];
}

interface CategoryNode {
  name: string;
  children?: CategoryNode[];
}

const ImportCSVContainer: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  // State
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [previewData, setPreviewData] = useState<ProductGroup[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [allowedCategories, setAllowedCategories] = useState<string[]>([]);
  const [editForm, setEditForm] = useState<EditForm>({
    title: '',
    category: '',
    color: '',
    size: '',
    price: 0,
    quantity: 0,
    imageUrls: [],
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  // Constants
  const allowedColors = ['black', 'white', 'dark blue', 'red', 'pink', 'orange', 'mint', 'brown', 'yellow'];
  const allowedSizes = ['S', 'M', 'L', 'XL', 'F'];

  // Fetch categories on mount
  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const res = await adminApiClient.get<CategoryNode[]>('/categories/active-tree');
        if (!res.success || !res.data || !mounted) return;

        const leafCategoriesWithLabels: { name: string; label: string }[] = [];
        const traverse = (nodes: CategoryNode[] = [], parents: string[] = []) => {
          for (const n of nodes || []) {
            if (!n || typeof n.name !== 'string') continue;
            const currentPath = [...parents, n.name];
            const isLeaf = !n.children || (Array.isArray(n.children) && n.children.length === 0);
            if (isLeaf) {
              leafCategoriesWithLabels.push({
                name: n.name,
                label: currentPath.join(' > '),
              });
            } else if (Array.isArray(n.children) && n.children.length > 0) {
              traverse(n.children, currentPath);
            }
          }
        };
        traverse(res.data);

        leafCategoriesWithLabels.sort((a, b) =>
          a.label.localeCompare(b.label, 'vi', { sensitivity: 'base' })
        );

        if (mounted) {
          setAllowedCategories(leafCategoriesWithLabels.map(c => c.label));
        }
      } catch {
        // Silently ignore
      }
    };
    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);

  const handlePreview = useCallback(async (file: File | Blob) => {
    setPreviewLoading(true);
    setError(null);
    setPreviewData([]);
    try {
      const formData = new FormData();
      const toSend = file instanceof File ? file : new File([file], uploadedFile?.name || 'import.csv', { type: 'text/csv' });
      formData.append('file', toSend);
      const res = await adminApiClient.post<ProductGroup[]>('/products/import/preview', formData as unknown as FormData);
      if (!res.success) throw new Error(res.message || 'Failed to preview CSV');
      setPreviewData(res.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Preview failed';
      setError(message);
    } finally {
      setPreviewLoading(false);
    }
  }, [uploadedFile?.name]);

  const handleFileChange = useCallback((file: File) => {
    setUploadedFile({ name: file.name, size: file.size, file });
    handlePreview(file);
  }, [handlePreview]);



  const handleDeleteProduct = useCallback((idx: number) => {
    setPreviewData((prev) => {
      let currentIndex = 0;
      const newGroups = prev.map((group) => {
        const details = group.productDetails || [];
        const updatedDetails = details.filter(() => {
          const match = currentIndex === idx;
          currentIndex += 1;
          return !match;
        });
        return { ...group, productDetails: updatedDetails };
      }).filter((g) => (g.productDetails || []).length > 0);
      return newGroups;
    });
  }, []);

  const handleEditProduct = useCallback((idx: number) => {
    let currentIndex = 0;
    let found: ProductDetail | null = null;
    let foundGroup: ProductGroup | null = null;
    for (const group of previewData) {
      const details = group.productDetails || [];
      for (const row of details) {
        if (currentIndex === idx) {
          found = row;
          foundGroup = group;
          break;
        }
        currentIndex += 1;
      }
      if (found) break;
    }
    if (!found) return;
    setEditingIndex(idx);
    setEditForm({
      title: found.productTitle ?? found.title ?? foundGroup?.productTitle ?? foundGroup?.title ?? '',
      category: found.category ?? foundGroup?.category ?? '',
      color: found.color ?? '',
      size: found.size ?? '',
      price: Number(found.price ?? 0),
      quantity: Number(found.quantity ?? 0),
      imageUrls: found.imageUrls ?? foundGroup?.imageUrls ?? [],
    });
    setIsEditOpen(true);
  }, [previewData]);

  const closeEditModal = useCallback(() => {
    setIsEditOpen(false);
    setEditingIndex(null);
    setNewImageUrl('');
  }, []);

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    setEditForm(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, idx) => idx !== indexToRemove)
    }));
  }, []);

  const handleAddImageUrl = useCallback(() => {
    if (!newImageUrl.trim()) return;

    if (editForm.imageUrls.length >= 5) {
      showError('Maximum images reached', 'You can only add up to 5 images per product');
      return;
    }

    try {
      new URL(newImageUrl.trim());
      setEditForm(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    } catch {
      showError('Invalid URL', 'Please enter a valid image URL');
    }
  }, [newImageUrl, editForm.imageUrls, showError]);

  const handleImageFileUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    const currentCount = editForm.imageUrls.length;
    const newCount = files.length;

    if (currentCount + newCount > 5) {
      const remaining = 5 - currentCount;
      if (remaining <= 0) {
        showError('Maximum images reached', 'You can only have up to 5 images per product');
      } else {
        showError('Too many images', `You can only add ${remaining} more image(s). Maximum is 5 images per product`);
      }
      return;
    }

    const newUrls = files.map(file => URL.createObjectURL(file));
    setEditForm(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ...newUrls]
    }));
  }, [editForm.imageUrls, showError]);

  const saveEdit = useCallback(() => {
    if (editingIndex === null) return;

    if (!editForm.title || !editForm.color || !editForm.size) {
      setError('Please fill Title, Color, Size.');
      return;
    }
    if (isNaN(editForm.price) || editForm.price < 0 || isNaN(editForm.quantity) || editForm.quantity < 0) {
      setError('Price and Quantity must be non-negative numbers.');
      return;
    }
    setError(null);
    setPreviewData((prev) => {
      let currentIndex = 0;
      return prev.map((group) => {
        const details = group.productDetails || [];
        let touchedThisGroup = false;
        const updatedDetails = details.map((row) => {
          const isTarget = currentIndex === editingIndex;
          currentIndex += 1;
          if (!isTarget) return row;
          const next: ProductDetail = { ...row };
          if ('productTitle' in next) {
            next.productTitle = editForm.title;
          } else {
            next.title = editForm.title;
          }
          next.category = editForm.category;
          next.color = editForm.color;
          next.size = editForm.size;
          next.price = editForm.price;
          next.quantity = editForm.quantity;
          next.imageUrls = editForm.imageUrls;
          next.isError = false;
          next.error = false;
          next.errorMessage = null;
          touchedThisGroup = true;
          return next;
        });
        const updatedGroup = touchedThisGroup ? { ...group, productTitle: editForm.title, category: editForm.category, imageUrls: editForm.imageUrls } : group;
        return { ...updatedGroup, productDetails: updatedDetails };
      });
    });
    closeEditModal();
  }, [editingIndex, editForm, closeEditModal]);

  const handleSave = useCallback(async () => {
    setError(null);

    const hasErrors = previewData.some(group =>
      (group.productDetails || []).some((detail) => detail.error || detail.isError)
    );

    if (hasErrors) {
      showError('Cannot Save', 'There are still products with errors. Please fix or delete them before saving.');
      return;
    }

    if (previewData.length === 0) {
      showError('No products', 'No products to save. Please upload a CSV file.');
      return;
    }

    try {
      const res = await adminApiClient.post<{ imported: number; failed?: number }>('/products/import/save', previewData);
      if (!res.success) throw new Error(res.message || 'Failed to save products');

      const totalProducts = previewData.reduce((sum, group) => sum + (group.productDetails?.length || 0), 0);
      showSuccess('Import Successful', `Imported ${totalProducts} products successfully.`);
      setPreviewData([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed';
      showError('Save Failed', message);
    }
  }, [previewData, showSuccess, showError]);

  const handleBack = useCallback(() => {
    router.push('/products');
  }, [router]);

  return (
    <ImportCSVPresenter
      uploadedFile={uploadedFile}
      previewData={previewData}
      previewLoading={previewLoading}
      error={error}
      isEditOpen={isEditOpen}
      editForm={editForm}
      newImageUrl={newImageUrl}
      allowedColors={allowedColors}
      allowedSizes={allowedSizes}
      allowedCategories={allowedCategories}
      onFileChange={handleFileChange}
      onDeleteProduct={handleDeleteProduct}
      onEditProduct={handleEditProduct}
      onSave={handleSave}
      onBack={handleBack}
      onCloseEditModal={closeEditModal}
      onRemoveImage={handleRemoveImage}
      onAddImageUrl={handleAddImageUrl}
      onImageFileUpload={handleImageFileUpload}
      onSaveEdit={saveEdit}
      onEditFormChange={setEditForm}
      onNewImageUrlChange={setNewImageUrl}
    />
  );
};

export default ImportCSVContainer;
