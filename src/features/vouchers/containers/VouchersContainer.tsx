'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { 
  fetchVouchersRequest,
  updateFilters,
  toggleVoucherActiveRequest,
  createVoucherRequest,
  updateVoucherRequest,
} from '../redux/voucherSlice';
import { VouchersPresenter } from '../components/VouchersPresenter';
import { VoucherFilters, GetVouchersRequest, CreateVoucherRequest, UpdateVoucherRequest } from '../../../types/voucher.types';
import { UserRank } from '../../../types/user.types';
import { userApi } from '../../../services/api/userApi';
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
    createLoading,
    updateLoading,
  } = useAppSelector((state) => state.voucher);

  // State for user ranks
  const [userRanks, setUserRanks] = useState<UserRank[]>([]);

  // Track pending operations for toast messages
  const pendingCreate = useRef<string | null>(null);
  const pendingUpdate = useRef<string | null>(null);
  const prevCreateLoading = useRef(false);
  const prevUpdateLoading = useRef(false);

  // Use minimum loading time hook to ensure skeleton shows for at least 500ms
  const displayLoading = useMinimumLoadingTime(loading, 500);

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;
  const totalPages = Math.ceil(total / pageSize);

  // Show toast when create voucher completes
  useEffect(() => {
    if (prevCreateLoading.current && !createLoading) {
      if (!error && pendingCreate.current) {
        showSuccess('Created', `Voucher "${pendingCreate.current}" has been created`);
      }
      pendingCreate.current = null;
    }
    prevCreateLoading.current = createLoading;
  }, [createLoading, error, showSuccess]);

  // Show toast when update voucher completes
  useEffect(() => {
    if (prevUpdateLoading.current && !updateLoading) {
      if (!error && pendingUpdate.current) {
        showSuccess('Updated', `Voucher "${pendingUpdate.current}" has been updated`);
      }
      pendingUpdate.current = null;
    }
    prevUpdateLoading.current = updateLoading;
  }, [updateLoading, error, showSuccess]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showError('Error', error);
    }
  }, [error, showError]);

  // Fetch user ranks on mount
  useEffect(() => {
    const fetchRanks = async () => {
      try {
        const response = await userApi.getUserRanks();
        if (response.success && response.data) {
          setUserRanks(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch user ranks:', err);
      }
    };
    fetchRanks();
  }, []);

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
    pendingCreate.current = voucherData.name;
    dispatch(createVoucherRequest(voucherData));
  }, [dispatch]);

  // Handle update voucher
  const handleUpdateVoucher = useCallback((id: number, voucherData: UpdateVoucherRequest) => {
    pendingUpdate.current = voucherData.name;
    dispatch(updateVoucherRequest({ id, voucherData }));
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
      loading={displayLoading}
      filters={filters}
      pagination={pagination}
      userRanks={userRanks}
      onUpdateFilters={handleUpdateFilters}
      onPageChange={handlePageChange}
      onToggleVoucherActive={handleToggleVoucherActive}
      onCreateVoucher={handleCreateVoucher}
      onUpdateVoucher={handleUpdateVoucher}
    />
  );
};

export { VouchersContainer };
