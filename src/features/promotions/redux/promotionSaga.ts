import { call, put } from 'redux-saga/effects';
import { takeEvery, takeLeading } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { promotionApi } from '../../../services/api/promotionApi';
import type { ApiResponse } from '../../../services/api/baseApi';
import type {
  PromotionListResponse,
  BackendPromotion,
  Promotion,
  CreatePromotionRequest,
} from '../../../types/promotion.types';
import {
  FetchPromotionsRequest,
  UpdatePromotionPayload,
  fetchPromotionsFailure,
  fetchPromotionsRequest,
  fetchPromotionsSuccess,
  createPromotionFailure,
  createPromotionRequest,
  createPromotionSuccess,
  updatePromotionFailure,
  updatePromotionRequest,
  updatePromotionSuccess,
  togglePromotionActiveFailure,
  togglePromotionActiveRequest,
  togglePromotionActiveSuccess,
  deletePromotionFailure,
  deletePromotionRequest,
  deletePromotionSuccess,
} from './promotionSlice';

const normalizePromotion = (backendPromotion: BackendPromotion): Promotion => ({
  ...backendPromotion,
});

// Fetch promotions saga
function* handleFetchPromotions(action: PayloadAction<FetchPromotionsRequest>) {
  try {
    // Convert null to undefined for API compatibility
    const params = {
      ...action.payload,
      isActive: action.payload.isActive === null ? undefined : action.payload.isActive,
    };

    const response: ApiResponse<PromotionListResponse> = yield call(
      [promotionApi, promotionApi.getAllPromotions],
      params
    );

    if (response.success && response.data) {
      const transformedPromotions = response.data.items.map(normalizePromotion);

      yield put(fetchPromotionsSuccess({
        promotions: transformedPromotions,
        pagination: {
          page: response.data.page,
          pageSize: response.data.pageSize,
          totalItems: response.data.totalItems,
          totalPages: response.data.totalPages,
          hasNext: response.data.hasNext,
          hasPrevious: response.data.hasPrevious,
        },
      }));
    } else {
      yield put(fetchPromotionsFailure(response.message || 'Failed to fetch promotions'));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while fetching promotions';
    yield put(fetchPromotionsFailure(message));
  }
}

// Create promotion saga
function* handleCreatePromotion(action: PayloadAction<CreatePromotionRequest>) {
  try {
    const response: ApiResponse<BackendPromotion> = yield call(async () =>
      promotionApi.createPromotion(action.payload)
    );

    if (response.success && response.data) {
      yield put(createPromotionSuccess(normalizePromotion(response.data)));
    } else {
      // Extract and format error message
      const errorMsg = formatErrorMessage(response.message || 'Failed to create promotion');
      yield put(createPromotionFailure(errorMsg));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while creating promotion';
    yield put(createPromotionFailure(formatErrorMessage(message)));
  }
}

// Helper to format error messages
const formatErrorMessage = (message: string): string => {
  // Check for duplicate name constraint
  if (message.includes('uk_promotion_name_period') || message.includes('duplicate key')) {
    return 'A promotion with this name and time period already exists. Please use a different name or time period.';
  }
  
  // Check for SKU conflict
  if (message.includes('already has a promotion')) {
    return message; // Keep the detailed SKU conflict message
  }
  
  // Return original message for other errors
  return message;
};

// Update promotion saga
function* handleUpdatePromotion(action: PayloadAction<UpdatePromotionPayload>) {
  try {
    const { id, promotionData } = action.payload;
    const response: ApiResponse<BackendPromotion> = yield call(async () =>
      promotionApi.updatePromotion(id, promotionData)
    );

    if (response.success && response.data) {
      yield put(updatePromotionSuccess(normalizePromotion(response.data)));
    } else {
      // Extract and format error message
      const errorMsg = formatErrorMessage(response.message || 'Failed to update promotion');
      yield put(updatePromotionFailure(errorMsg));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while updating promotion';
    yield put(updatePromotionFailure(formatErrorMessage(message)));
  }
}

// Toggle promotion active saga
function* handleTogglePromotionActive(action: PayloadAction<number>) {
  try {
    const response: ApiResponse<BackendPromotion> = yield call(async () =>
      promotionApi.togglePromotionActive(action.payload)
    );

    if (response.success) {
      // Status 204 No Content means success, but no data returned
      // Fetch the updated promotion from the API to get the latest state
      const promotionResponse: ApiResponse<BackendPromotion> = yield call(async () =>
        promotionApi.getPromotionById(action.payload)
      );

      if (promotionResponse.success && promotionResponse.data) {
        yield put(togglePromotionActiveSuccess(normalizePromotion(promotionResponse.data)));
      } else {
        // Fallback: just mark success without updating data
        yield put(togglePromotionActiveSuccess({ id: action.payload } as Promotion));
      }
    } else {
      yield put(togglePromotionActiveFailure(response.message || 'Failed to toggle promotion status'));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while toggling promotion status';
    yield put(togglePromotionActiveFailure(message));
  }
}

// Delete promotion saga
function* handleDeletePromotion(action: PayloadAction<number>) {
  try {
    const response: ApiResponse<void> = yield call(async () =>
      promotionApi.deletePromotion(action.payload)
    );

    if (response.success) {
      yield put(deletePromotionSuccess(action.payload));
    } else {
      yield put(deletePromotionFailure(response.message || 'Failed to delete promotion'));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while deleting promotion';
    yield put(deletePromotionFailure(message));
  }
}

// Root saga
export function* promotionSaga() {
  yield takeLeading(fetchPromotionsRequest.type, handleFetchPromotions);
  yield takeEvery(createPromotionRequest.type, handleCreatePromotion);
  yield takeEvery(updatePromotionRequest.type, handleUpdatePromotion);
  yield takeEvery(togglePromotionActiveRequest.type, handleTogglePromotionActive);
  yield takeEvery(deletePromotionRequest.type, handleDeletePromotion);
}
