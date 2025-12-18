'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Promotion, CreatePromotionRequest, PromotionTarget, PromotionTargetType } from '../../types/promotion.types';
import { categoryApi, CategoryBackend } from '../../services/api/categoryApi';
import { productApi } from '../../services/api/productApi';
import { promotionApi } from '../../services/api/promotionApi';
import { SearchableSelect } from '../ui/SearchableSelect';
import { CustomDropdown } from '../ui/CustomDropdown';
import { useToast } from '../../providers/ToastProvider';

interface TargetOption {
  id: number;
  name: string;
}

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (promotionData: CreatePromotionRequest) => void;
  promotion?: Promotion | null;
  title: string;
  onTargetsUpdated?: () => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  promotion,
  title,
  onTargetsUpdated,
}) => {
  const { showError, showSuccess } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'PERCENT' as const,
    value: '' as number | '',
    startAt: '',
    endAt: '',
    isActive: true,
  });
  
  const [targets, setTargets] = useState<PromotionTarget[]>([]);
  const [newTarget, setNewTarget] = useState<{ targetType: PromotionTargetType; targetId: number | '' }>({
    targetType: 'CATEGORY',
    targetId: '',
  });
  const [isTargetLoading, setIsTargetLoading] = useState(false);
  
  const isEditMode = !!promotion;
  
  // Data for dropdowns
  const [categories, setCategories] = useState<TargetOption[]>([]);
  const [products, setProducts] = useState<TargetOption[]>([]);
  const [skus, setSkus] = useState<TargetOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Flatten categories tree to list - only leaf nodes
  const flattenCategories = useCallback((cats: CategoryBackend[], prefix = ''): TargetOption[] => {
    const result: TargetOption[] = [];
    for (const cat of cats) {
      const hasChildren = cat.children && cat.children.length > 0;
      if (hasChildren) {
        result.push(...flattenCategories(cat.children!, prefix ? `${prefix} > ${cat.name}` : cat.name));
      } else {
        result.push({ id: cat.id, name: prefix ? `${prefix} > ${cat.name}` : cat.name });
      }
    }
    return result;
  }, []);

  // Load categories when CATEGORY target type is selected
  useEffect(() => {
    if (newTarget.targetType === 'CATEGORY' && isOpen && categories.length === 0) {
      const loadCategories = async () => {
        setLoadingOptions(true);
        try {
          const catRes = await categoryApi.getTree();
          if (catRes.success && catRes.data) {
            setCategories(flattenCategories(catRes.data));
          }
        } catch (error) {
          console.error('Error loading categories:', error);
        } finally {
          setLoadingOptions(false);
        }
      };
      loadCategories();
    }
  }, [newTarget.targetType, isOpen, flattenCategories, categories.length]);

  // Load products when PRODUCT target type is selected
  useEffect(() => {
    if (newTarget.targetType === 'PRODUCT' && isOpen && products.length === 0) {
      const loadProducts = async () => {
        setLoadingOptions(true);
        try {
          const prodRes = await productApi.getAllProductsSimplified();
          if (prodRes.success && prodRes.data) {
            setProducts(prodRes.data);
          }
        } catch (error) {
          console.error('Error loading products:', error);
        } finally {
          setLoadingOptions(false);
        }
      };
      loadProducts();
    }
  }, [newTarget.targetType, isOpen, products.length]);

  // Load all SKUs when SKU target type is selected
  useEffect(() => {
    if (newTarget.targetType === 'SKU' && isOpen) {
      const loadAllSkus = async () => {
        setLoadingOptions(true);
        try {
          const res = await productApi.getAllProductDetails();
          if (res.success && res.data) {
            setSkus(res.data);
          } else {
            setSkus([]);
          }
        } catch (error) {
          console.error('Error loading all SKUs:', error);
          setSkus([]);
        } finally {
          setLoadingOptions(false);
        }
      };
      loadAllSkus();
    } else if (newTarget.targetType !== 'SKU') {
      setSkus([]);
    }
  }, [newTarget.targetType, isOpen]);

  useEffect(() => {
    if (promotion) {
      setFormData({
        name: promotion.name,
        type: promotion.type,
        value: promotion.value,
        startAt: promotion.startAt.split('T')[0],
        endAt: promotion.endAt.split('T')[0],
        isActive: promotion.isActive,
      });
      setTargets(promotion.targets || []);
    } else {
      setFormData({
        name: '',
        type: 'PERCENT',
        value: '',
        startAt: '',
        endAt: '',
        isActive: true,
      });
      setTargets([]);
    }
    setNewTarget({ targetType: 'CATEGORY', targetId: '' });
  }, [promotion, isOpen]);

  const handleTargetTypeChange = (type: PromotionTargetType) => {
    setNewTarget({ targetType: type, targetId: '' });
  };

  // Add target - for edit mode, call API directly
  const handleAddTarget = async () => {
    if (newTarget.targetId === '' || newTarget.targetId <= 0) {
      showError('Validation Error', 'Please select a target');
      return;
    }
    
    // Check for duplicate
    const exists = targets.some(
      t => t.targetType === newTarget.targetType && t.targetId === newTarget.targetId
    );
    if (exists) {
      showError('Duplicate Target', 'This target already exists');
      return;
    }

    if (isEditMode && promotion) {
      // Edit mode: call API to add target
      setIsTargetLoading(true);
      try {
        const result = await promotionApi.upsertTargets(promotion.id, {
          items: [{ targetType: newTarget.targetType, targetId: newTarget.targetId }]
        });
        
        if (result.success) {
          setTargets([...targets, { targetType: newTarget.targetType, targetId: newTarget.targetId }]);
          setNewTarget({ ...newTarget, targetId: '' });
          showSuccess('Success', 'Target added successfully');
          onTargetsUpdated?.();
        } else {
          showError('Error', result.message || 'Failed to add target');
        }
      } catch (error) {
        console.error('Error adding target:', error);
        showError('Error', 'Failed to add target');
      } finally {
        setIsTargetLoading(false);
      }
    } else {
      // Create mode: just update local state
      setTargets([...targets, { targetType: newTarget.targetType, targetId: newTarget.targetId }]);
      setNewTarget({ ...newTarget, targetId: '' });
    }
  };

  // Remove target - for edit mode, call API directly
  const handleRemoveTarget = async (target: PromotionTarget, index: number) => {
    if (isEditMode && promotion) {
      // Edit mode: call API to remove target
      setIsTargetLoading(true);
      try {
        const result = await promotionApi.removeTargets(promotion.id, [
          { targetType: target.targetType, targetId: target.targetId }
        ]);
        
        if (result.success) {
          setTargets(targets.filter((_, i) => i !== index));
          showSuccess('Success', 'Target removed successfully');
          onTargetsUpdated?.();
        } else {
          showError('Error', result.message || 'Failed to remove target');
        }
      } catch (error) {
        console.error('Error removing target:', error);
        showError('Error', 'Failed to remove target');
      } finally {
        setIsTargetLoading(false);
      }
    } else {
      // Create mode: just update local state
      setTargets(targets.filter((_, i) => i !== index));
    }
  };

  // Get display name for target
  const getTargetDisplayName = (target: PromotionTarget): string => {
    if (target.targetType === 'CATEGORY') {
      const cat = categories.find(c => c.id === target.targetId);
      return cat ? cat.name : `Category ID: ${target.targetId}`;
    }
    if (target.targetType === 'PRODUCT') {
      const prod = products.find(p => p.id === target.targetId);
      return prod ? prod.name : `Product ID: ${target.targetId}`;
    }
    if (target.targetType === 'SKU') {
      const sku = skus.find(s => s.id === target.targetId);
      return sku ? sku.name : `SKU ID: ${target.targetId}`;
    }
    return `ID: ${target.targetId}`;
  };

  // Get current options based on target type
  const getCurrentOptions = (): TargetOption[] => {
    switch (newTarget.targetType) {
      case 'CATEGORY':
        return categories;
      case 'PRODUCT':
        return products;
      case 'SKU':
        return skus;
      default:
        return [];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showError('Validation Error', 'Please enter promotion name');
      return;
    }
    
    const valueNum = typeof formData.value === 'string' ? parseFloat(formData.value) : formData.value;
    
    if (!valueNum || valueNum <= 0) {
      showError('Validation Error', 'Promotion value must be greater than 0');
      return;
    }
    
    if (valueNum > 100) {
      showError('Validation Error', 'Percentage value cannot exceed 100%');
      return;
    }
    
    if (!formData.startAt || !formData.endAt) {
      showError('Validation Error', 'Please select start and end dates');
      return;
    }
    
    if (new Date(formData.startAt) >= new Date(formData.endAt)) {
      showError('Validation Error', 'Start date must be before end date');
      return;
    }
    
    // Validate targets required for create mode
    if (!isEditMode && targets.length === 0) {
      showError('Validation Error', 'Please add at least one promotion target');
      return;
    }
    
    const submitData: CreatePromotionRequest = {
      ...formData,
      value: valueNum,
      startAt: `${formData.startAt}T00:00:00`,
      endAt: `${formData.endAt}T23:59:59`,
      // For edit mode, don't send targets (managed via API)
      // For create mode, send targets
      targets: isEditMode ? undefined : targets,
    };
    
    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Warning Notice */}
          {!promotion && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-amber-800 font-medium text-sm">Important Notice</p>
                <p className="text-amber-700 text-sm mt-1">
                  Once the promotion has started, you will not be able to edit it. Please review the information carefully before creating.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promotion Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                placeholder="e.g., Mid-season Sale"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value="PERCENT"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Value (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value === '' ? '' : Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
              min="0"
              max="100"
              step="1"
              placeholder="e.g., 33"
            />
            <p className="mt-1 text-xs text-gray-500">Enter a value between 0 and 100</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startAt}
                onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endAt}
                onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded accent-black"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active promotion
            </label>
          </div>

          {/* Targets Section */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promotion Targets <span className="text-red-500">*</span>
            </label>
            
            {/* Add new target */}
            <div className="flex gap-2 mb-3">
              <CustomDropdown
                value={newTarget.targetType}
                onChange={(value) => handleTargetTypeChange(value as PromotionTargetType)}
                options={[
                  { value: 'CATEGORY', label: 'Category' },
                  { value: 'PRODUCT', label: 'Product' },
                  { value: 'SKU', label: 'Product Detail' },
                ]}
                disabled={loadingOptions || isTargetLoading}
                className="w-40"
              />
              
              <SearchableSelect
                options={getCurrentOptions()}
                value={newTarget.targetId}
                onChange={(value) => setNewTarget({ ...newTarget, targetId: value })}
                placeholder={loadingOptions ? 'Loading...' : `Select ${newTarget.targetType === 'SKU' ? 'Product Detail' : newTarget.targetType}`}
                disabled={loadingOptions || isTargetLoading}
                className="flex-1"
              />
              
              <button
                type="button"
                onClick={handleAddTarget}
                disabled={newTarget.targetId === '' || loadingOptions || isTargetLoading}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTargetLoading ? 'Adding...' : 'Add'}
              </button>
            </div>

            {/* Targets list */}
            {targets.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
                {targets.map((target, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md">
                    <span className="text-sm text-black">
                      <span className="inline-block px-2 py-0.5 bg-gray-200 rounded text-xs font-medium mr-2">
                        {target.targetType === 'SKU' ? 'Product Detail' : target.targetType}
                      </span>
                      {getTargetDisplayName(target)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTarget(target, index)}
                      disabled={isTargetLoading}
                      className="text-red-600 hover:text-red-800 cursor-pointer disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                {isEditMode ? 'No targets. Add targets above.' : 'No targets added. At least one target is required.'}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
            >
              {promotion ? 'Update Promotion' : 'Create Promotion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromotionModal;
