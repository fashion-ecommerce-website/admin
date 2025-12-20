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

interface UploadedZipFile {
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
  errorMessage?: string;
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
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  children: CategoryNode[] | null;
}

interface ParentCategoryOption {
  id: number;
  name: string;
  path: string;
}

const ImportCSVContainer: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  // State
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploadedZips, setUploadedZips] = useState<UploadedZipFile[]>([]);
  const [previewData, setPreviewData] = useState<ProductGroup[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [allowedCategories, setAllowedCategories] = useState<string[]>([]);
  const [parentCategories, setParentCategories] = useState<ParentCategoryOption[]>([]);
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

  // State for colors and sizes
  const [allowedColors, setAllowedColors] = useState<string[]>([]);
  const [allowedSizes, setAllowedSizes] = useState<string[]>([]);

  // Fetch categories, colors, sizes on mount
  useEffect(() => {
    let mounted = true;
    
    const fetchCategories = async () => {
      try {
        const res = await adminApiClient.get<CategoryNode[]>('/categories/active-tree');
        if (!res.success || !res.data || !mounted) return;

        const leafCategoriesWithLabels: { name: string; label: string }[] = [];
        const allCategoriesForParent: ParentCategoryOption[] = [];
        
        const traverse = (nodes: CategoryNode[] | null, parents: string[] = []) => {
          if (!nodes) return;
          for (const n of nodes) {
            if (!n || typeof n.name !== 'string') continue;
            const currentPath = [...parents, n.name];
            const pathString = currentPath.join(' > ');
            const hasChildren = n.children && n.children.length > 0;
            
            // Add all categories as potential parents (need valid id)
            if (n.id != null) {
              allCategoriesForParent.push({
                id: n.id,
                name: n.name,
                path: pathString,
              });
            }
            
            // Only leaf categories can be selected for products
            if (!hasChildren) {
              leafCategoriesWithLabels.push({
                name: n.name,
                label: pathString,
              });
            }
            
            // Traverse children if they exist
            if (hasChildren) {
              traverse(n.children, currentPath);
            }
          }
        };
        traverse(res.data);

        leafCategoriesWithLabels.sort((a, b) =>
          a.label.localeCompare(b.label, 'vi', { sensitivity: 'base' })
        );
        
        allCategoriesForParent.sort((a, b) =>
          a.path.localeCompare(b.path, 'vi', { sensitivity: 'base' })
        );

        if (mounted) {
          setAllowedCategories(leafCategoriesWithLabels.map(c => c.label));
          setParentCategories(allCategoriesForParent);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    const fetchColors = async () => {
      try {
        const res = await adminApiClient.get<{ id: number; name: string }[]>('/colors/active');
        if (res.success && res.data && mounted) {
          setAllowedColors(res.data.map(c => c.name));
        }
      } catch {
        // Fallback to default colors
        if (mounted) {
          setAllowedColors(['black', 'white', 'dark blue', 'red', 'pink', 'orange', 'mint', 'brown', 'yellow']);
        }
      }
    };

    const fetchSizes = async () => {
      try {
        const res = await adminApiClient.get<{ id: number; code: string }[]>('/sizes/active');
        if (res.success && res.data && mounted) {
          setAllowedSizes(res.data.map(s => s.code));
        }
      } catch {
        // Fallback to default sizes
        if (mounted) {
          setAllowedSizes(['S', 'M', 'L', 'XL', 'F']);
        }
      }
    };

    fetchCategories();
    fetchColors();
    fetchSizes();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Handlers to create new color, size, category
  const handleCreateColor = useCallback(async (data: { name: string; hex?: string }): Promise<boolean> => {
    try {
      const res = await adminApiClient.post<{ id: number; name: string }>('/colors', data);
      if (res.success && res.data) {
        setAllowedColors(prev => [...prev, res.data!.name]);
        showSuccess('Color Created', `Color "${data.name}" has been added.`);
        return true;
      }
      showError('Failed', res.message || 'Failed to create color');
      return false;
    } catch {
      showError('Failed', 'Failed to create color');
      return false;
    }
  }, [showSuccess, showError]);

  const handleCreateSize = useCallback(async (data: { code: string; label: string }): Promise<boolean> => {
    try {
      const res = await adminApiClient.post<{ id: number; code: string }>('/sizes', data);
      if (res.success && res.data) {
        setAllowedSizes(prev => [...prev, res.data!.code]);
        showSuccess('Size Created', `Size "${data.code}" has been added.`);
        return true;
      }
      showError('Failed', res.message || 'Failed to create size');
      return false;
    } catch {
      showError('Failed', 'Failed to create size');
      return false;
    }
  }, [showSuccess, showError]);

  const handleCreateCategory = useCallback(async (data: { name: string; slug: string; isActive: boolean; parentId?: number }): Promise<boolean> => {
    try {
      const res = await adminApiClient.post<{ id: number; name: string }>('/categories', data);
      if (res.success && res.data) {
        // Find parent path if parentId exists
        const parent = data.parentId ? parentCategories.find(c => c.id === data.parentId) : null;
        const newPath = parent ? `${parent.path} > ${data.name}` : data.name;
        
        // Add to allowed categories (leaf categories for dropdown)
        setAllowedCategories(prev => [...prev, newPath].sort((a, b) => 
          a.localeCompare(b, 'vi', { sensitivity: 'base' })
        ));
        
        // Add to parent categories list
        setParentCategories(prev => [...prev, {
          id: res.data!.id,
          name: data.name,
          path: newPath,
        }].sort((a, b) => a.path.localeCompare(b.path, 'vi', { sensitivity: 'base' })));
        
        showSuccess('Category Created', `Category "${data.name}" has been added.`);
        return true;
      }
      showError('Failed', res.message || 'Failed to create category');
      return false;
    } catch {
      showError('Failed', 'Failed to create category');
      return false;
    }
  }, [showSuccess, showError, parentCategories]);

  const handlePreview = useCallback(async (csvFile: File, zipFiles: File[]) => {
    setPreviewLoading(true);
    setError(null);
    setPreviewData([]);
    try {
      const formData = new FormData();
      formData.append('excel', csvFile);
      
      // Append all zip files
      zipFiles.forEach((zip) => {
        formData.append('zips', zip);
      });

      const res = await adminApiClient.post<ProductGroup[]>('/products/import/zip-preview', formData as unknown as FormData);
      if (!res.success) throw new Error(res.message || 'Failed to preview CSV with ZIPs');
      setPreviewData(res.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Preview failed';
      setError(message);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const handleFileChange = useCallback((file: File) => {
    setUploadedFile({ name: file.name, size: file.size, file });
    // Don't auto-preview, wait for zips
  }, []);

  const handleZipFilesChange = useCallback((files: File[]) => {
    const newZips = files.map(f => ({ name: f.name, size: f.size, file: f }));
    setUploadedZips(prev => [...prev, ...newZips]);
  }, []);

  const handleRemoveZip = useCallback((index: number) => {
    setUploadedZips(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleStartPreview = useCallback(() => {
    if (!uploadedFile) {
      setError('Please upload an Excel file first');
      return;
    }
    if (uploadedZips.length === 0) {
      setError('Please upload at least one ZIP file containing images');
      return;
    }
    handlePreview(uploadedFile.file, uploadedZips.map(z => z.file));
  }, [uploadedFile, uploadedZips, handlePreview]);



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
    
    // Get imageUrls - prioritize detail level, fallback to group level
    const detailImageUrls = found.imageUrls && found.imageUrls.length > 0 
      ? found.imageUrls 
      : (foundGroup?.imageUrls ?? []);
    
    console.log('Edit - found.imageUrls:', found.imageUrls);
    console.log('Edit - foundGroup.imageUrls:', foundGroup?.imageUrls);
    console.log('Edit - using imageUrls:', detailImageUrls);
    
    setEditForm({
      title: found.productTitle ?? found.title ?? foundGroup?.productTitle ?? foundGroup?.title ?? '',
      category: found.category ?? foundGroup?.category ?? '',
      color: found.color ?? '',
      size: found.size ?? '',
      price: Number(found.price ?? 0),
      quantity: Number(found.quantity ?? 0),
      imageUrls: detailImageUrls,
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

    // Convert files to base64 data URLs (will be uploaded to Cloudinary when saving)
    const base64Urls: string[] = [];
    for (const file of files) {
      try {
        const base64 = await fileToBase64(file);
        base64Urls.push(base64);
      } catch {
        showError('Read Failed', `Failed to read ${file.name}`);
      }
    }

    if (base64Urls.length > 0) {
      setEditForm(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...base64Urls]
      }));
    }
  }, [editForm.imageUrls, showError]);

  // Helper function to convert File to base64 data URL
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const saveEdit = useCallback(async () => {
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

    // Build fileProductDetails for check-detail API (exclude current editing row)
    const fileProductDetails: { productTitle: string; color: string; size: string }[] = [];
    let currentIdx = 0;
    for (const group of previewData) {
      for (const detail of group.productDetails || []) {
        if (currentIdx !== editingIndex) {
          fileProductDetails.push({
            productTitle: detail.productTitle ?? detail.title ?? group.productTitle ?? group.title ?? '',
            color: detail.color ?? '',
            size: detail.size ?? '',
          });
        }
        currentIdx++;
      }
    }

    // Extract leaf category name from path for API check
    const categoryForApi = editForm.category?.includes(' > ')
      ? editForm.category.split(' > ').pop()?.trim() || editForm.category
      : editForm.category;

    // Call check-detail API
    try {
      const checkPayload = {
        productTitle: editForm.title,
        detail: {
          productTitle: editForm.title,
          color: editForm.color,
          size: editForm.size,
          category: categoryForApi,
        },
        fileProductDetails,
      };

      const res = await adminApiClient.post<{ error: boolean; errorMessage?: string }>(
        '/products/import/check-detail',
        checkPayload
      );

      if (res.success && res.data) {
        // Update preview data with check result
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
              // Set error status from API response
              next.isError = res.data?.error ?? false;
              next.error = res.data?.error ?? false;
              next.errorMessage = res.data?.errorMessage || undefined;
              touchedThisGroup = true;
              return next;
            });
            const updatedGroup = touchedThisGroup 
              ? { ...group, productTitle: editForm.title, category: editForm.category, imageUrls: editForm.imageUrls } 
              : group;
            return { ...updatedGroup, productDetails: updatedDetails };
          });
        });
        closeEditModal();
      } else {
        showError('Check Failed', res.message || 'Failed to validate product detail');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Validation failed';
      showError('Check Failed', message);
    }
  }, [editingIndex, editForm, previewData, closeEditModal, showError]);

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
      showError('No products', 'No products to save. Please upload an Excel file.');
      return;
    }

    setSaveLoading(true);
    
    try {
      // Extract leaf category name from path before sending to backend
      const dataToSave = previewData.map(group => ({
        ...group,
        category: group.category?.includes(' > ') 
          ? group.category.split(' > ').pop()?.trim() || group.category
          : group.category,
        productDetails: group.productDetails?.map(detail => ({
          ...detail,
          category: detail.category?.includes(' > ')
            ? detail.category.split(' > ').pop()?.trim() || detail.category
            : detail.category,
          // Ensure imageUrls is included
          imageUrls: detail.imageUrls || [],
        })),
      }));

      const res = await adminApiClient.post<void>('/products/import/zip-save', dataToSave);
      if (!res.success) throw new Error(res.message || 'Failed to save products');

      const totalProducts = previewData.reduce((sum, group) => sum + (group.productDetails?.length || 0), 0);
      showSuccess('Import Successful', `Imported ${totalProducts} products successfully.`);
      setPreviewData([]);
      setUploadedFile(null);
      setUploadedZips([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed';
      showError('Save Failed', message);
    } finally {
      setSaveLoading(false);
    }
  }, [previewData, showSuccess, showError]);

  const handleBack = useCallback(() => {
    router.push('/products');
  }, [router]);

  return (
    <ImportCSVPresenter
      uploadedFile={uploadedFile}
      uploadedZips={uploadedZips}
      previewData={previewData}
      previewLoading={previewLoading}
      saveLoading={saveLoading}
      error={error}
      isEditOpen={isEditOpen}
      editForm={editForm}
      newImageUrl={newImageUrl}
      allowedColors={allowedColors}
      allowedSizes={allowedSizes}
      allowedCategories={allowedCategories}
      parentCategories={parentCategories}
      onFileChange={handleFileChange}
      onZipFilesChange={handleZipFilesChange}
      onRemoveZip={handleRemoveZip}
      onStartPreview={handleStartPreview}
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
      onCreateColor={handleCreateColor}
      onCreateSize={handleCreateSize}
      onCreateCategory={handleCreateCategory}
    />
  );
};

export default ImportCSVContainer;
