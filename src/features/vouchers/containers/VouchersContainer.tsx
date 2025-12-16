'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { 
  fetchVouchersRequest,
  updateFilters,
  toggleVoucherActiveRequest,
  createVoucherRequest,
  updateVoucherRequest,
  clearError,
} from '../redux/voucherSlice';
import { VouchersPresenter } from '../components/VouchersPresenter';
import { VoucherFilters, GetVouchersRequest, CreateVoucherRequest, UpdateVoucherRequest } from '../../../types/voucher.types';
import { useToast } from '../../../providers/ToastProvider';
import { useMinimumLoadingTime } from '../../../hooks/useMinimumLoadingTime';

const VouchersContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showError, showSuccess } = useToast();

  const { 
    vouchers, 
    total,
    loading, 
    error, 
    filters,
  } = useAppSelector((state) => state.voucher);

  // Use minimum loading time hook to ensure skeleton shows for at least 500ms
  const displayLoading = useMinimumLoadingTime(loading, 500);

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;
  const totalPages = Math.ceil(total / pageSize);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showError('Error', error);
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

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

  // Handle create voucher
  const handleCreateVoucher = useCallback((voucherData: CreateVoucherRequest) => {
    dispatch(createVoucherRequest(voucherData));
    showSuccess('Created', `Voucher "${voucherData.name}" has been created`);
  }, [dispatch, showSuccess]);

  // Handle update voucher
  const handleUpdateVoucher = useCallback((id: number, voucherData: UpdateVoucherRequest) => {
    dispatch(updateVoucherRequest({ id, voucherData }));
    showSuccess('Updated', `Voucher "${voucherData.name}" has been updated`);
  }, [dispatch, showSuccess]);

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
      loading={displayLoading}
      filters={filters}
      pagination={pagination}
      onUpdateFilters={handleUpdateFilters}
      onPageChange={handlePageChange}
      onToggleVoucherActive={handleToggleVoucherActive}
      onCreateVoucher={handleCreateVoucher}
      onUpdateVoucher={handleUpdateVoucher}
    />
  );
};

export { VouchersContainer };