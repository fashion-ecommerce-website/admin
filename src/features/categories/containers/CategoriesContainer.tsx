'use client';

import React, { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import {
  fetchCategoriesRequest,
  createCategoryRequest,
  updateCategoryRequest,
  toggleCategoryStatusRequest,
} from '../redux/categorySlice';
import { CategoriesPresenter } from '../components/CategoriesPresenter';
import { CreateCategoryRequest, UpdateCategoryRequest } from '../../../types/category.types';
import { useToast } from '../../../providers/ToastProvider';

const CategoriesContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showError, showSuccess } = useToast();

  const {
    categories,
    loading,
    error,
    createLoading,
    updateLoading,
    toggleLoading,
  } = useAppSelector((state) => state.category);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showError('Error', error);
    }
  }, [error, showError]);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategoriesRequest());
  }, [dispatch]);

  // Handle create category
  const handleCreateCategory = useCallback((categoryData: CreateCategoryRequest) => {
    dispatch(createCategoryRequest(categoryData));
    showSuccess('Created', `Category "${categoryData.name}" has been created`);
  }, [dispatch, showSuccess]);

  // Handle update category
  const handleUpdateCategory = useCallback((categoryData: UpdateCategoryRequest) => {
    dispatch(updateCategoryRequest(categoryData));
    showSuccess('Update Successful', `Updated category "${categoryData.name}"`);
  }, [dispatch, showSuccess]);

  // Handle toggle status
  const handleToggleStatus = useCallback((id: number) => {
    dispatch(toggleCategoryStatusRequest(id));
    showSuccess('Status Updated', 'Category status has been updated successfully');
  }, [dispatch, showSuccess]);

  return (
    <CategoriesPresenter
      categories={categories}
      loading={loading}
      createLoading={createLoading}
      updateLoading={updateLoading}
      toggleLoading={toggleLoading}
      onCreateCategory={handleCreateCategory}
      onUpdateCategory={handleUpdateCategory}
      onToggleStatus={handleToggleStatus}
    />
  );
};

export default CategoriesContainer;
