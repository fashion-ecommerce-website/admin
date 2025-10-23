'use client';

import React, { useState, useEffect } from 'react';
import { Voucher, CreateVoucherRequest } from '../../types/voucher.types';
import { CustomDropdown } from '../ui';
import { useToast } from '@/providers/ToastProvider';

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
  const { showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    type: 'PERCENT' as 'PERCENT' | 'FIXED_AMOUNT',
    value: '',
    maxDiscount: '',
    minOrderAmount: '',
    usageLimitTotal: '',
    usageLimitPerUser: '1',
    startAt: '',
    endAt: '',
    startTime: '00:00',
    endTime: '23:59',
    isActive: true,
    audienceType: 'ALL' as 'ALL' | 'RANK',
    rankIds: [] as number[],
  });


  useEffect(() => {
    if (voucher) {
      const startDateTime = new Date(voucher.startAt);
      const endDateTime = new Date(voucher.endAt);
      
      setFormData({
        name: voucher.name,
        type: voucher.type,
        value: voucher.value.toString(),
        maxDiscount: (voucher.maxDiscount || 0).toString(),
        minOrderAmount: voucher.minOrderAmount.toString(),
        usageLimitTotal: voucher.usageLimitTotal.toString(),
        usageLimitPerUser: voucher.usageLimitPerUser.toString(),
        startAt: voucher.startAt.split('T')[0],
        endAt: voucher.endAt.split('T')[0],
        startTime: startDateTime.toTimeString().slice(0, 5),
        endTime: endDateTime.toTimeString().slice(0, 5),
        isActive: voucher.isActive,
        audienceType: voucher.audienceType,
        rankIds: voucher.rankIds,
      });
    } else {
      setFormData({
        name: '',
        type: 'PERCENT',
        value: '',
        maxDiscount: '',
        minOrderAmount: '',
        usageLimitTotal: '',
        usageLimitPerUser: '1',
        startAt: '',
        endAt: '',
        startTime: '00:00',
        endTime: '23:59',
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
      showError('Please enter voucher name');
      return;
    }
    
    const value = parseFloat(formData.value.toString());
    const maxDiscount = parseFloat(formData.maxDiscount.toString());
    const minOrderAmount = parseFloat(formData.minOrderAmount.toString());
    const usageLimitTotal = parseInt(formData.usageLimitTotal.toString());
    const usageLimitPerUser = parseInt(formData.usageLimitPerUser.toString());

    if (!value || value <= 0) {
      showError('Voucher value must be greater than 0');
      return;
    }
    
    if (formData.type === 'PERCENT' && value > 100) {
      showError('Percentage value cannot exceed 100%');
      return;
    }
    
    if (formData.type === 'PERCENT' && (!maxDiscount || maxDiscount <= 0)) {
      showError('Maximum discount is required for percentage vouchers');
      return;
    }
    
    if (minOrderAmount < 0) {
      showError('Minimum order amount cannot be negative');
      return;
    }
    
    if (usageLimitTotal < usageLimitPerUser) {
      showError('Total usage limit must be greater than or equal to usage limit per user');
      return;
    }
    
    if (new Date(formData.startAt) >= new Date(formData.endAt)) {
      showError('Start date must be before end date');
      return;
    }
    
    const submitData = {
      ...formData,
      value: value,
      maxDiscount: formData.type === 'PERCENT' ? maxDiscount : undefined,
      minOrderAmount: minOrderAmount,
      usageLimitTotal: usageLimitTotal,
      usageLimitPerUser: usageLimitPerUser,
      startAt: `${formData.startAt}T${formData.startTime}:00`,
      endAt: `${formData.endAt}T${formData.endTime}:59`,
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
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
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
                Maximum Discount (VND) *
              </label>
                <input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                  min="0"
                  required
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
              onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, usageLimitTotal: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, usageLimitPerUser: e.target.value })}
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
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={formData.startAt}
                  onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                  required
                />
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={formData.endAt}
                  onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                  required
                />
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                />
              </div>
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