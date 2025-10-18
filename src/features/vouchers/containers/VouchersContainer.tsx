'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { 
  fetchVouchersRequest,
  updateFilters,
  toggleVoucherActiveRequest,
} from '../redux/voucherSlice';
import { VouchersPresenter } from '../components/VouchersPresenter';
import { VoucherFilters, GetVouchersRequest } from '../../../types/voucher.types';
import { useToast } from '../../../providers/ToastProvider';

const VouchersContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showError } = useToast();

  const { 
    vouchers, 
    total,
    loading, 
    error, 
    filters,
  } = useAppSelector((state) => state.voucher);

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;
  const totalPages = Math.ceil(total / pageSize);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showError('Error', error);
    }
  }, [error, showError]);

  // Fetch vouchers on mount and when filters change
  useEffect(() => {
    const params: GetVouchersRequest = {
      page: currentPage,
      pageSize: pageSize,
      name: filters.name || undefined,
      isActive: filters.isActive === null ? undefined : filters.isActive,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
    };
    
    dispatch(fetchVouchersRequest(params));
  }, [dispatch, currentPage, pageSize, filters]);

  // Clamp current page when total pages shrink after data updates
  useEffect(() => {
    if (currentPage > 0 && totalPages > 0 && currentPage >= totalPages) {
      setCurrentPage(totalPages - 1);
    }
    if (currentPage > 0 && totalPages === 0) {
      setCurrentPage(0);
    }
  }, [currentPage, totalPages]);

  // Handle filter updates
  const handleUpdateFilters = useCallback((newFilters: Partial<VoucherFilters>) => {
    dispatch(updateFilters(newFilters));
    // Reset to first page when filters change
    if (newFilters.name !== undefined || newFilters.isActive !== undefined) {
      setCurrentPage(0);
    }
  }, [dispatch]);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle toggle voucher active status
  const handleToggleVoucherActive = useCallback((voucherId: number) => {
    dispatch(toggleVoucherActiveRequest(voucherId));
  }, [dispatch]);

  const pagination = {
    page: currentPage,
    pageSize,
    totalItems: total,
    totalPages,
    hasNext: currentPage < totalPages - 1,
    hasPrevious: currentPage > 0,
  };

  return (
    <VouchersPresenter
      vouchers={vouchers}
      loading={loading}
      filters={filters}
      pagination={pagination}
      onUpdateFilters={handleUpdateFilters}
      onPageChange={handlePageChange}
      onToggleVoucherActive={handleToggleVoucherActive}
    />
  );
};

export { VouchersContainer };