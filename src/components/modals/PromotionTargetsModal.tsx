'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { promotionApi } from '../../services/api/promotionApi';
import { PromotionTargetType, PromotionTargetItem, PromotionTargetResponse } from '../../types/promotion.types';
import { useToast } from '../../providers/ToastProvider';

interface PromotionTargetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotionId: number;
  promotionName: string;
}

const PromotionTargetsModal: React.FC<PromotionTargetsModalProps> = ({
  isOpen,
  onClose,
  promotionId,
  promotionName,
}) => {
  const { showSuccess, showError } = useToast();
  const [targets, setTargets] = useState<PromotionTargetResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  
  // Form state for adding new target
  const [targetType, setTargetType] = useState<PromotionTargetType>('SKU');
  const [targetId, setTargetId] = useState('');

  // Fetch targets when modal opens
  const fetchTargets = useCallback(async () => {
    if (!promotionId) return;
    setLoading(true);
    try {
      const response = await promotionApi.getTargets(promotionId);
      if (response.success && response.data) {
        setTargets(response.data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch targets:', error);
    } finally {
      setLoading(false);
    }
  }, [promotionId]);

  useEffect(() => {
    if (isOpen && promotionId) {
      fetchTargets();
    }
  }, [isOpen, promotionId, fetchTargets]);

  // Handle add target
  const handleAddTarget = async () => {
    if (!targetId.trim()) {
      showError('Validation Error', 'Please enter a target ID');
      return;
    }

    const id = parseInt(targetId.trim(), 10);
    if (isNaN(id) || id <= 0) {
      showError('Validation Error', 'Target ID must be a positive number');
      return;
    }

    setAdding(true);
    try {
      const items: PromotionTargetItem[] = [{ targetType, targetId: id }];
      const response = await promotionApi.upsertTargets(promotionId, { items });
      
      if (response.success) {
        showSuccess('Success', `Added ${response.data?.added || 1} target(s)`);
        setTargetId('');
        fetchTargets(); // Refresh list
      } else {
        showError('Error', response.message || 'Failed to add target');
      }
    } catch {
      showError('Error', 'Failed to add target');
    } finally {
      setAdding(false);
    }
  };

  // Handle remove target
  const handleRemoveTarget = async (target: PromotionTargetResponse) => {
    try {
      const response = await promotionApi.removeTargets(promotionId, [
        { targetType: target.targetType, targetId: target.targetId }
      ]);
      if (response.success) {
        showSuccess('Success', 'Target removed');
        fetchTargets(); // Refresh list
      } else {
        showError('Error', response.message || 'Failed to remove target');
      }
    } catch {
      showError('Error', 'Failed to remove target');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-black">Manage Targets</h2>
                <p className="text-sm text-gray-600 mt-1">Promotion: {promotionName}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Add Target Form */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Type</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as PromotionTargetType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="SKU">SKU (Product Detail)</option>
                  <option value="PRODUCT">Product</option>
                  <option value="CATEGORY">Category</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Target ID</label>
                <input
                  type="number"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="Enter ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <button
                onClick={handleAddTarget}
                disabled={adding || !targetId.trim()}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {adding ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
                Add
              </button>
            </div>
          </div>

          {/* Targets List */}
          <div className="px-6 py-4 overflow-y-auto max-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
              </div>
            ) : targets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No targets added yet. Add products, SKUs, or categories above.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Type</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">ID</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Name</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {targets.map((target, index) => (
                    <tr key={target.id ?? `${target.targetType}-${target.targetId}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          target.targetType === 'SKU' ? 'bg-blue-100 text-blue-800' :
                          target.targetType === 'PRODUCT' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {target.targetType}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-black">{target.targetId}</td>
                      <td className="py-3 text-sm text-gray-600">{target.targetName || '-'}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleRemoveTarget(target)}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          title="Remove target"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {targets.length} target(s)
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionTargetsModal;
