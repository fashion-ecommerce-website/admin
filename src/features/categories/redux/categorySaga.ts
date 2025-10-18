import { call, put } from 'redux-saga/effects';
import { takeEvery, takeLeading } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { categoryApi } from '../../../services/api/categoryApi';
import type { ApiResponse } from '../../../services/api/baseApi';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../../types/category.types';
import type { CategoryBackend } from '../../../services/api/categoryApi';
import {
  fetchCategoriesRequest,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  createCategoryRequest,
  createCategorySuccess,
  createCategoryFailure,
  updateCategoryRequest,
  updateCategorySuccess,
  updateCategoryFailure,
  toggleCategoryStatusRequest,
  toggleCategoryStatusSuccess,
  toggleCategoryStatusFailure,
} from './categorySlice';

const normalizeCategory = (backendCategory: CategoryBackend): Category => ({
  ...backendCategory,
  children: backendCategory.children?.map(normalizeCategory) || null,
});

// Fetch categories tree saga
function* handleFetchCategories() {
  try {
    const response: ApiResponse<CategoryBackend[]> = yield call(
      [categoryApi, categoryApi.getTree]
    );

    if (response.success && response.data) {
      const transformedCategories = response.data.map(normalizeCategory);
      yield put(fetchCategoriesSuccess(transformedCategories));
    } else {
      yield put(fetchCategoriesFailure(response.message || 'Failed to fetch categories'));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while fetching categories';
    yield put(fetchCategoriesFailure(message));
  }
}

// Create category saga
function* handleCreateCategory(action: PayloadAction<CreateCategoryRequest>) {
  try {
    const response: ApiResponse<CategoryBackend> = yield call(async () =>
      categoryApi.createCategory(action.payload)
    );

    if (response.success && response.data) {
      yield put(createCategorySuccess());
      // Refetch the tree after creation
      yield put(fetchCategoriesRequest());
    } else {
      yield put(createCategoryFailure(response.message || 'Failed to create category'));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while creating category';
    yield put(createCategoryFailure(message));
  }
}

// Update category saga
function* handleUpdateCategory(action: PayloadAction<UpdateCategoryRequest>) {
  try {
    const response: ApiResponse<CategoryBackend> = yield call(async () =>
      categoryApi.updateCategory(action.payload)
    );

    if (response.success && response.data) {
      yield put(updateCategorySuccess());
      // Refetch the tree after update
      yield put(fetchCategoriesRequest());
    } else {
      yield put(updateCategoryFailure(response.message || 'Failed to update category'));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while updating category';
    yield put(updateCategoryFailure(message));
  }
}

// Toggle category status saga
function* handleToggleCategoryStatus(action: PayloadAction<number>) {
  try {
    const response: ApiResponse<void> = yield call(async () =>
      categoryApi.deleteCategory(action.payload)
    );

    if (response.success) {
      yield put(toggleCategoryStatusSuccess());
      // Refetch the tree after toggle
      yield put(fetchCategoriesRequest());
    } else {
      yield put(toggleCategoryStatusFailure(response.message || 'Failed to toggle category status'));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while toggling category status';
    yield put(toggleCategoryStatusFailure(message));
  }
}

// Root saga
export function* categorySaga() {
  yield takeLeading(fetchCategoriesRequest.type, handleFetchCategories);
  yield takeEvery(createCategoryRequest.type, handleCreateCategory);
  yield takeEvery(updateCategoryRequest.type, handleUpdateCategory);
  yield takeEvery(toggleCategoryStatusRequest.type, handleToggleCategoryStatus);
}
