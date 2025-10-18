'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { 
  fetchPromotionsRequest,
  updateFilters,
  togglePromotionActiveRequest,
  createPromotionRequest,
  updatePromotionRequest,
} from '../redux/promotionSlice';
import { PromotionsPresenter } from '../components/PromotionsPresenter';
import { PromotionFilters, GetPromotionsRequest, CreatePromotionRequest, UpdatePromotionRequest } from '../../../types/promotion.types';
import { useToast } from '../../../providers/ToastProvider';
import { useMinimumLoadingTime } from '../../../hooks/useMinimumLoadingTime';

const PromotionsContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showError } = useToast();

  const { 
    promotions, 
    total,
    loading, 
    error, 
    filters,
  } = useAppSelector((state) => state.promotion);

  // Use minimum loading time hook to ensure skeleton shows for at least 500ms
  const displayLoading = useMinimumLoadingTime(loading, 500);

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;
  const totalPages = Math.ceil(total / pageSize);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showError('Error', error);
    }
  }, [error, showError]);

  // Fetch promotions on mount and when filters change
  useEffect(() => {
    const params: GetPromotionsRequest = {
      page: currentPage,
      pageSize: pageSize,
      name: filters.name || undefined,
      isActive: filters.isActive === null ? undefined : filters.isActive,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
    };
    
    dispatch(fetchPromotionsRequest(params));
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
  const handleUpdateFilters = useCallback((newFilters: Partial<PromotionFilters>) => {
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

  // Handle toggle promotion active status
  const handleTogglePromotionActive = useCallback((promotionId: number) => {
    dispatch(togglePromotionActiveRequest(promotionId));
  }, [dispatch]);

  // Handle create promotion
  const handleCreatePromotion = useCallback((promotionData: CreatePromotionRequest) => {
    dispatch(createPromotionRequest(promotionData));
  }, [dispatch]);

  // Handle update promotion
  const handleUpdatePromotion = useCallback((id: number, promotionData: UpdatePromotionRequest) => {
    dispatch(updatePromotionRequest({ id, promotionData }));
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
    <PromotionsPresenter
      promotions={promotions}
      loading={displayLoading}
      filters={filters}
      pagination={pagination}
      onUpdateFilters={handleUpdateFilters}
      onPageChange={handlePageChange}
      onTogglePromotionActive={handleTogglePromotionActive}
      onCreatePromotion={handleCreatePromotion}
      onUpdatePromotion={handleUpdatePromotion}
    />
  );
};

export default PromotionsContainer;
