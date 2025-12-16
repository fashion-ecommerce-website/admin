import { call, put } from 'redux-saga/effects';
import { takeLeading, takeEvery } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { refundApi } from '../../../services/api/refundApi';
import type { ApiResponse } from '../../../services/api/baseApi';
import {
  fetchRefundsRequest,
  fetchRefundsSuccess,
  fetchRefundsFailure,
  fetchRefundByIdRequest,
  fetchRefundByIdSuccess,
  fetchRefundByIdFailure,
  updateRefundStatusRequest,
  updateRefundStatusSuccess,
  updateRefundStatusFailure,
} from './refundSlice';
import {
  Refund,
  RefundQueryParams,
  UpdateRefundStatusRequest,
} from '../../../types/refund.types';
import { BackendPaginatedResponse } from '../../../types/common.types';

// Fetch refunds saga
function* fetchRefundsSaga(action: PayloadAction<RefundQueryParams>) {
  try {
    const response: ApiResponse<BackendPaginatedResponse<Refund>> = yield call(
      async () => refundApi.getAllRefunds(action.payload)
    );

    if (response.success && response.data) {
      yield put(
        fetchRefundsSuccess({
          refunds: response.data.content,
          total: response.data.totalElements,
          currentPage: response.data.number,
          totalPages: response.data.totalPages,
          pageSize: response.data.size,
        })
      );
    } else {
      yield put(fetchRefundsFailure(response.message || 'Failed to fetch refunds'));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch refunds';
    yield put(fetchRefundsFailure(message));
  }
}

// Fetch single refund saga
function* fetchRefundByIdSaga(action: PayloadAction<{ refundId: number }>) {
  try {
    const response: ApiResponse<Refund> = yield call(
      async () => refundApi.getRefundById(action.payload.refundId)
    );

    if (response.success && response.data) {
      yield put(fetchRefundByIdSuccess(response.data));
    } else {
      yield put(
        fetchRefundByIdFailure(response.message || 'Failed to fetch refund')
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch refund';
    yield put(fetchRefundByIdFailure(message));
  }
}

// Update refund status saga
function* updateRefundStatusSaga(
  action: PayloadAction<{ refundId: number; data: UpdateRefundStatusRequest }>
) {
  try {
    const response: ApiResponse<Refund> = yield call(
      async () => refundApi.updateRefundStatus(action.payload.refundId, action.payload.data)
    );

    if (response.success && response.data) {
      yield put(updateRefundStatusSuccess(response.data));
    } else {
      yield put(
        updateRefundStatusFailure(
          response.message || 'Failed to update refund status'
        )
      );
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to update refund status';
    yield put(updateRefundStatusFailure(message));
  }
}

// Root saga
export function* refundSaga() {
  yield takeLeading(fetchRefundsRequest.type, fetchRefundsSaga);
  yield takeEvery(fetchRefundByIdRequest.type, fetchRefundByIdSaga);
  yield takeEvery(updateRefundStatusRequest.type, updateRefundStatusSaga);
}

export default refundSaga;
