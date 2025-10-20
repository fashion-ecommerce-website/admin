'use client';

import React, { useState, useEffect } from 'react';
import { Voucher, CreateVoucherRequest } from '../../types/voucher.types';
import { CustomDropdown } from '../ui';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (voucherData: CreateVoucherRequest) => void;
  voucher?: Voucher | null;
  title: string;
}

const VoucherModal: React.FC<VoucherModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  voucher,
  title,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'PERCENT' as 'PERCENT' | 'FIXED_AMOUNT',
    value: 0,
    maxDiscount: 0,
    minOrderAmount: 0,
    usageLimitTotal: 1,
    usageLimitPerUser: 1,
    startAt: '',
    endAt: '',
    isActive: true,
    audienceType: 'ALL' as 'ALL' | 'RANK',
    rankIds: [] as number[],
  });

  const generateVoucherCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  useEffect(() => {
    if (voucher) {
      setFormData({
        name: voucher.name,
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        maxDiscount: voucher.maxDiscount || 0,
        minOrderAmount: voucher.minOrderAmount,
        usageLimitTotal: voucher.usageLimitTotal,
        usageLimitPerUser: voucher.usageLimitPerUser,
        startAt: voucher.startAt.split('T')[0],
        endAt: voucher.endAt.split('T')[0],
        isActive: voucher.isActive,
        audienceType: voucher.audienceType,
        rankIds: voucher.rankIds,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        type: 'PERCENT',
        value: 0,
        maxDiscount: 0,
        minOrderAmount: 0,
        usageLimitTotal: 1,
        usageLimitPerUser: 1,
        startAt: '',
        endAt: '',
        isActive: true,
        audienceType: 'ALL',
        rankIds: [],
      });
    }
  }, [voucher, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      alert('Please enter voucher name');
      return;
    }
    
    if (!formData.code.trim()) {
      alert('Please enter voucher code');
      return;
    }
    
    if (formData.value <= 0) {
      alert('Voucher value must be greater than 0');
      return;
    }
    
    if (formData.type === 'PERCENT' && formData.value > 100) {
      alert('Percentage value cannot exceed 100%');
      return;
    }
    
    if (formData.minOrderAmount < 0) {
      alert('Minimum order amount cannot be negative');
      return;
    }
    
    if (new Date(formData.startAt) >= new Date(formData.endAt)) {
      alert('Start date must be before end date');
      return;
    }
    
    const submitData = {
      ...formData,
      startAt: `${formData.startAt}T00:00:00`,
      endAt: `${formData.endAt}T23:59:59`,
      maxDiscount: formData.type === 'PERCENT' ? formData.maxDiscount : undefined,
    };
    
    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <style dangerouslySetInnerHTML={{__html: `
        select option {
          background-color: white !important;
          color: black !important;
        }
        select option:checked {
          background-color: black !important;
          color: white !important;
        }
        select option:hover {
          background-color: #1f2937 !important;
          color: white !important;
        }
      `}} />
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
                Voucher Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voucher Code *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                  placeholder="Enter code or click to generate"
                  required
                />
                {!voucher && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, code: generateVoucherCode() })}
                    className="px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm"
                  >
                    Generate
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voucher Type *
              </label>
              <CustomDropdown
                value={formData.type}
                onChange={(value) => setFormData({ ...formData, type: value as 'PERCENT' | 'FIXED_AMOUNT' })}
                options={[
                  { value: 'PERCENT', label: 'Percentage (%)' },
                  { value: 'FIXED_AMOUNT', label: 'Fixed Amount (VND)' }
                ]}
                bgColor="bg-gray-100"
                borderRadius="rounded-md"
                padding="px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value *
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {formData.type === 'PERCENT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Discount (VND)
              </label>
              <input
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                min="0"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Order Amount (VND) *
            </label>
            <input
              type="number"
              value={formData.minOrderAmount}
              onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
              min="0"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Usage Limit *
              </label>
              <input
                type="number"
                value={formData.usageLimitTotal}
                onChange={(e) => setFormData({ ...formData, usageLimitTotal: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usage Limit Per User *
              </label>
              <input
                type="number"
                value={formData.usageLimitPerUser}
                onChange={(e) => setFormData({ ...formData, usageLimitPerUser: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                min="1"
                required
              />
            </div>
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
                required
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
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Audience *
            </label>
            <CustomDropdown
              value={formData.audienceType}
              onChange={(value) => setFormData({ ...formData, audienceType: value as 'ALL' | 'RANK' })}
              options={[
                { value: 'ALL', label: 'All Customers' },
                { value: 'RANK', label: 'By Membership Rank' }
              ]}
              borderRadius="rounded-md"
              padding="px-3 py-2"
            />
          </div>

          {formData.audienceType === 'RANK' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Membership Rank IDs (comma-separated)
              </label>
              <input
                type="text"
                value={formData.rankIds.join(', ')}
                onChange={(e) => {
                  const ranks = e.target.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                  setFormData({ ...formData, rankIds: ranks });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                placeholder="1, 2, 3"
              />
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded accent-black"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active voucher
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
              {voucher ? 'Update Voucher' : 'Create Voucher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete confirmation modal
interface DeleteVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  voucherName: string;
}

const DeleteVoucherModal: React.FC<DeleteVoucherModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  voucherName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-black mb-4">Confirm Delete</h2>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete voucher &quot;{voucherName}&quot;?
          This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export { VoucherModal, DeleteVoucherModal };