'use client';

import React, { useState, useEffect } from 'react';
import { Voucher, CreateVoucherRequest } from '../../types/voucher.types';
import { UserRank } from '../../types/user.types';
import { userApi } from '../../services/api/userApi';
import { CustomDropdown } from '../ui';
import { CustomDropdown, CurrencyInput } from '../ui';
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
    type: 'PERCENT' as 'PERCENT' | 'FIXED',
    value: 0,
    maxDiscount: 0,
    minOrderAmount: 0,
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

  // State for user ranks
  const [userRanks, setUserRanks] = useState<UserRank[]>([]);
  const [ranksLoading, setRanksLoading] = useState(false);

  // Fetch user ranks when modal opens
  useEffect(() => {
    const fetchRanks = async () => {
      setRanksLoading(true);
      try {
        const response = await userApi.getUserRanks();
        if (response.success && response.data) {
          setUserRanks(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user ranks:', error);
      } finally {
        setRanksLoading(false);
      }
    };

    if (isOpen) {
      fetchRanks();
    }
  }, [isOpen]);

  useEffect(() => {
    if (voucher) {
      const startDateTime = new Date(voucher.startAt);
      const endDateTime = new Date(voucher.endAt);
      
      setFormData({
        name: voucher.name,
        type: voucher.type,
        value: voucher.value,
        maxDiscount: voucher.maxDiscount || 0,
        minOrderAmount: voucher.minOrderAmount,
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
        value: 0,
        maxDiscount: 0,
        minOrderAmount: 0,
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

  // Handle rank checkbox toggle
  const handleRankToggle = (rankId: number) => {
    setFormData(prev => ({
      ...prev,
      rankIds: prev.rankIds.includes(rankId)
        ? prev.rankIds.filter(id => id !== rankId)
        : [...prev.rankIds, rankId]
    }));
  };

  // Format number with thousand separators (e.g., 1,000,000)
  const formatCurrency = (value: string): string => {
    // Remove all non-digit characters
    const numericValue = value.replace(/[^\d]/g, '');
    if (!numericValue) return '';
    // Add thousand separators
    return Number(numericValue).toLocaleString('en-US');
  };

  // Parse formatted currency back to number string
  const parseCurrency = (value: string): string => {
    return value.replace(/[^\d]/g, '');
  };

  // Handle currency input change
  const handleCurrencyChange = (field: 'maxDiscount' | 'minOrderAmount' | 'value', value: string) => {
    const numericValue = parseCurrency(value);
    setFormData(prev => ({ ...prev, [field]: numericValue }));
  };

  // Get formatted display value for currency fields
  const getFormattedValue = (value: string): string => {
    if (!value) return '';
    return formatCurrency(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation - Check all required fields
    if (!formData.name.trim()) {
      showError('Please enter voucher name');
      return;
    }

    if (!formData.value || formData.value.trim() === '') {
      showError('Please enter voucher value');
      return;
    }
    
    const value = parseFloat(formData.value.toString());
    const maxDiscount = parseFloat(formData.maxDiscount.toString()) || 0;
    const minOrderAmount = parseFloat(formData.minOrderAmount.toString()) || 0;
    const usageLimitTotal = parseInt(formData.usageLimitTotal.toString()) || 0;
    const usageLimitPerUser = parseInt(formData.usageLimitPerUser.toString()) || 0;

    if (!value || value <= 0) {
      showError('Voucher value must be greater than 0');
      return;
    }
    
    if (formData.type === 'PERCENT' && value > 100) {
      showError('Percentage value cannot exceed 100%');
      return;
    }
    
    if (formData.type === 'PERCENT') {
      if (!formData.maxDiscount || formData.maxDiscount.trim() === '') {
        showError('Please enter maximum discount');
        return;
      }
      if (maxDiscount <= 0) {
        showError('Maximum discount must be greater than 0');
        return;
      }
    }

    if (!formData.minOrderAmount || formData.minOrderAmount.trim() === '') {
      showError('Please enter minimum order amount');
      return;
    }
    
    if (!minOrderAmount || minOrderAmount < 0) {
      showError('Minimum order amount is required and cannot be negative');
      return;
    }

    if (!formData.usageLimitTotal || formData.usageLimitTotal.trim() === '') {
      showError('Please enter total usage limit');
      return;
    }

    if (usageLimitTotal <= 0) {
      showError('Total usage limit must be greater than 0');
      return;
    }

    if (!formData.usageLimitPerUser || formData.usageLimitPerUser.trim() === '') {
      showError('Please enter usage limit per user');
      return;
    }

    if (usageLimitPerUser <= 0) {
      showError('Usage limit per user must be greater than 0');
      return;
    }
    
    if (usageLimitTotal < usageLimitPerUser) {
      showError('Total usage limit must be greater than or equal to usage limit per user');
      return;
    }

    if (!formData.startAt) {
      showError('Please select start date');
      return;
    }

    if (!formData.endAt) {
      showError('Please select end date');
      return;
    }
    
    if (new Date(formData.startAt) >= new Date(formData.endAt)) {
      showError('Start date must be before end date');
      return;
    }

    if (formData.audienceType === 'RANK' && formData.rankIds.length === 0) {
      showError('Please select at least one membership rank');
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
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voucher Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voucher Type <span className="text-red-500">*</span>
              </label>
              <CustomDropdown
                value={formData.type}
                onChange={(value) => setFormData({ ...formData, type: value as 'PERCENT' | 'FIXED' })}
                options={[
                  { value: 'PERCENT', label: 'Percentage (%)' },
                  { value: 'FIXED', label: 'Fixed Amount (VND)' }
                ]}
                bgColor="bg-gray-100"
                borderRadius="rounded-md"
                padding="px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value {formData.type === 'PERCENT' ? '(%)' : '(VND)'} <span className="text-red-500">*</span>
              </label>
              {formData.type === 'PERCENT' ? (
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                  required
                />
              ) : (
                <input
                  type="text"
                  value={getFormattedValue(formData.value)}
                  onChange={(e) => handleCurrencyChange('value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                  placeholder="0"
                  required
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.type === 'PERCENT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Discount (VND) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={getFormattedValue(formData.maxDiscount)}
                  onChange={(e) => handleCurrencyChange('maxDiscount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                  placeholder="0"
                  required
                />
              </div>
            )}

            <div className={formData.type === 'PERCENT' ? '' : 'md:col-span-2'}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Amount (VND) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={getFormattedValue(formData.minOrderAmount)}
                onChange={(e) => handleCurrencyChange('minOrderAmount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Usage Limit <span className="text-red-500">*</span>
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
                Usage Limit Per User <span className="text-red-500">*</span>
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
                Start Date <span className="text-red-500">*</span>
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
                End Date <span className="text-red-500">*</span>
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
              Target Audience <span className="text-red-500">*</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Membership Ranks <span className="text-red-500">*</span>
              </label>
              {ranksLoading ? (
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  <span className="text-sm">Loading ranks...</span>
                </div>
              ) : userRanks.length === 0 ? (
                <p className="text-sm text-gray-500">No ranks available</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {userRanks.map((rank) => (
                    <label
                      key={rank.id}
                      className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer transition-colors ${
                        formData.rankIds.includes(rank.id)
                          ? 'border-black bg-gray-100'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.rankIds.includes(rank.id)}
                        onChange={() => handleRankToggle(rank.id)}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded accent-black"
                      />
                      <span className="text-sm font-medium text-black">{rank.name}</span>
                    </label>
                  ))}
                </div>
              )}
              {formData.rankIds.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  Selected: {userRanks
                    .filter(r => formData.rankIds.includes(r.id))
                    .map(r => r.name)
                    .join(', ')}
                </p>
              )}
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
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
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
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export { VoucherModal, DeleteVoucherModal };