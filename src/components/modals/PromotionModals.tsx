'use client';

import React, { useState, useEffect } from 'react';
import { Promotion, CreatePromotionRequest } from '../../types/promotion.types';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (promotionData: CreatePromotionRequest) => void;
  promotion?: Promotion | null;
  title: string;
}

const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  promotion,
  title,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'PERCENT' as const,
    value: 0,
    startAt: '',
    endAt: '',
    isActive: true,
  });

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
    } else {
      setFormData({
        name: '',
        type: 'PERCENT',
        value: 0,
        startAt: '',
        endAt: '',
        isActive: true,
      });
    }
  }, [promotion, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      alert('Please enter promotion name');
      return;
    }
    
    if (formData.value <= 0) {
      alert('Promotion value must be greater than 0');
      return;
    }
    
    if (formData.value > 100) {
      alert('Percentage value cannot exceed 100%');
      return;
    }
    
    if (!formData.startAt || !formData.endAt) {
      alert('Please select start and end dates');
      return;
    }
    
    if (new Date(formData.startAt) >= new Date(formData.endAt)) {
      alert('Start date must be before end date');
      return;
    }
    
    const submitData = {
      ...formData,
      startAt: `${formData.startAt}T00:00:00Z`,
      endAt: `${formData.endAt}T23:59:59Z`,
    };
    
    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promotion Name *
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
                Type *
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
              Discount Value (%) *
            </label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
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
                Start Date *
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
                End Date *
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

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
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
