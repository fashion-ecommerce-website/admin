'use client';

import React, { useState, useEffect } from 'react';
import { Voucher, CreateVoucherRequest } from '../../types/voucher.types';
import { UserRank } from '../../types/user.types';
import { userApi } from '../../services/api/userApi';
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
  
  const isEditMode = !!voucher;
  
  // Check voucher status for edit restrictions
  // CASE 1: now < start_at → Can edit ALL fields
  // CASE 2: start_at ≤ now ≤ end_at (Ongoing) → Only allow INCREASING usage_limit_total
  // CASE 3: now > end_at (Expired) → NO updates allowed
  const getVoucherStatus = () => {
    if (!isEditMode || !voucher) return 'upcoming';
    
    const now = new Date();
    const startAt = new Date(voucher.startAt);
    const endAt = new Date(voucher.endAt);
    
    if (now < startAt) return 'upcoming';
    if (now > endAt) return 'expired';
    return 'ongoing';
  };
  
  const voucherStatus = getVoucherStatus();
  const isExpired = voucherStatus === 'expired';
  const isOngoing = voucherStatus === 'ongoing';
  
  // Store original usageLimitTotal for comparison (only allow increase when ongoing)
  const originalUsageLimitTotal = voucher?.usageLimitTotal || 0;
  
  const [formData, setFormData] = useState<{
    name: string;
    type: 'PERCENT' | 'FIXED';
    value: string;
    maxDiscount: string;
    minOrderAmount: string;
    usageLimitTotal: string;
    usageLimitPerUser: string;
    startAt: string;
    endAt: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    audienceType: 'ALL' | 'RANK';
    rankIds: number[];
  }>({
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
    
    // CASE 3: Expired voucher - no updates allowed
    if (isExpired) {
      showError('Cannot update an expired voucher');
      return;
    }
    
    // CASE 2: Ongoing voucher - only allow increasing usage_limit_total
    if (isOngoing) {
      const newUsageLimitTotal = parseInt(formData.usageLimitTotal.toString()) || 0;
      if (newUsageLimitTotal <= originalUsageLimitTotal) {
        showError(`Total Usage Limit must be greater than current value (${originalUsageLimitTotal})`);
        return;
      }
    }
    
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

        {/* Warning banner for ongoing voucher */}
        {isOngoing && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  This voucher is currently active
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  You can only <strong>increase</strong> the Total Usage Limit. Other fields cannot be modified.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning banner for expired voucher */}
        {isExpired && (
          <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">
                  This voucher has expired
                </p>
                <p className="text-xs text-red-700 mt-1">
                  You cannot edit an expired voucher. Please create a new voucher instead.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voucher Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isExpired || isOngoing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black ${(isExpired || isOngoing) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                disabled={isExpired || isOngoing}
                bgColor={isExpired || isOngoing ? "bg-gray-100" : "bg-gray-100"}
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
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  disabled={isExpired || isOngoing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black ${(isExpired || isOngoing) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                  disabled={isExpired || isOngoing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black ${(isExpired || isOngoing) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                  disabled={isExpired || isOngoing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black ${(isExpired || isOngoing) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                disabled={isExpired || isOngoing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black ${(isExpired || isOngoing) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Usage Limit <span className="text-red-500">*</span>
                {isOngoing && (
                  <span className="ml-2 text-xs text-green-600 font-normal">(Can only increase)</span>
                )}
              </label>
              <input
                type="number"
                value={formData.usageLimitTotal}
                onChange={(e) => setFormData({ ...formData, usageLimitTotal: e.target.value })}
                disabled={isExpired}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black ${isExpired ? 'bg-gray-100 cursor-not-allowed' : ''} ${isOngoing ? 'border-green-500 ring-1 ring-green-200' : ''}`}
                min={isOngoing ? originalUsageLimitTotal + 1 : 1}
                required
              />
              {isOngoing && (
                <p className="mt-1 text-xs text-gray-500">
                  Current: {originalUsageLimitTotal}. Must be greater than current value.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usage Limit Per User <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.usageLimitPerUser}
                onChange={(e) => setFormData({ ...formData, usageLimitPerUser: e.target.value })}
                disabled={isExpired || isOngoing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black ${(isExpired || isOngoing) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                  disabled={isExpired || isOngoing}
                  className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black ${(isExpired || isOngoing) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  required
                />
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  disabled={isExpired || isOngoing}
                  className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black ${(isExpired || isOngoing) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                  disabled={isExpired || isOngoing}
                  className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black ${(isExpired || isOngoing) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  required
                />
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  disabled={isExpired || isOngoing}
                  className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black ${(isExpired || isOngoing) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
              disabled={isExpired || isOngoing}
              borderRadius="rounded-md"
              padding="px-3 py-2"
            />
          </div>

          {formData.audienceType === 'RANK' && (
            <div className={isExpired || isOngoing ? 'opacity-60' : ''}>
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
                      className={`flex items-center space-x-2 p-3 border rounded-md transition-colors ${
                        (isExpired || isOngoing) ? 'cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        formData.rankIds.includes(rank.id)
                          ? 'border-black bg-gray-100'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.rankIds.includes(rank.id)}
                        onChange={() => handleRankToggle(rank.id)}
                        disabled={isExpired || isOngoing}
                        className={`h-4 w-4 text-black focus:ring-black border-gray-300 rounded accent-black ${(isExpired || isOngoing) ? 'cursor-not-allowed' : ''}`}
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
              disabled={isExpired || isOngoing}
              className={`h-4 w-4 text-black focus:ring-black border-gray-300 rounded accent-black ${(isExpired || isOngoing) ? 'cursor-not-allowed' : ''}`}
            />
            <label htmlFor="isActive" className={`ml-2 block text-sm text-gray-700 ${(isExpired || isOngoing) ? 'text-gray-400' : ''}`}>
              Active voucher
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
            >
              {isExpired ? 'Close' : 'Cancel'}
            </button>
            {!isExpired && (
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
              >
                {voucher ? 'Update Voucher' : 'Create Voucher'}
              </button>
            )}
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