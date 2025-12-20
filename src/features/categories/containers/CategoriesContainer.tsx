'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import {
  fetchCategoriesRequest,
  createCategoryRequest,
  updateCategoryRequest,
  toggleCategoryStatusRequest,
  clearError,
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

  // Track previous loading states to detect successful completions
  const prevCreateLoading = useRef(createLoading);
  const prevUpdateLoading = useRef(updateLoading);
  const prevToggleLoading = useRef(toggleLoading);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showError('Error', error);
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

  // Show success toast when create operation completes successfully
  useEffect(() => {
    if (prevCreateLoading.current && !createLoading && !error) {
      showSuccess('Created', 'Category has been created successfully');
    }
    prevCreateLoading.current = createLoading;
  }, [createLoading, error, showSuccess]);

  // Show success toast when update operation completes successfully
  useEffect(() => {
    if (prevUpdateLoading.current && !updateLoading && !error) {
      showSuccess('Updated', 'Category has been updated successfully');
    }
    prevUpdateLoading.current = updateLoading;
  }, [updateLoading, error, showSuccess]);

  // Show success toast when toggle operation completes successfully
  useEffect(() => {
    if (prevToggleLoading.current && !toggleLoading && !error) {
      showSuccess('Status Updated', 'Category status has been updated successfully');
    }
    prevToggleLoading.current = toggleLoading;
  }, [toggleLoading, error, showSuccess]);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategoriesRequest());
  }, [dispatch]);

  // Handle create category
  const handleCreateCategory = useCallback((categoryData: CreateCategoryRequest) => {
    dispatch(createCategoryRequest(categoryData));
  }, [dispatch]);

  // Handle update category
  const handleUpdateCategory = useCallback((categoryData: UpdateCategoryRequest) => {
    dispatch(updateCategoryRequest(categoryData));
  }, [dispatch]);

  // Handle toggle status
  const handleToggleStatus = useCallback((id: number) => {
    dispatch(toggleCategoryStatusRequest(id));
  }, [dispatch]);

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
