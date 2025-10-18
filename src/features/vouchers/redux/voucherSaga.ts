import { call, put, select } from 'redux-saga/effects';
import { takeEvery, takeLeading } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { voucherApi } from '../../../services/api/voucherApi';
import type { ApiResponse } from '../../../services/api/baseApi';
import type {
  VoucherListResponse,
  BackendVoucher,
  Voucher,
  CreateVoucherRequest,
} from '../../../types/voucher.types';
import type { RootState } from '../../../store';
import {
  FetchVouchersRequest,
  UpdateVoucherPayload,
  fetchVouchersFailure,
  fetchVouchersRequest,
  fetchVouchersSuccess,
  createVoucherFailure,
  createVoucherRequest,
  createVoucherSuccess,
  updateVoucherFailure,
  updateVoucherRequest,
  updateVoucherSuccess,
  toggleVoucherActiveFailure,
  toggleVoucherActiveRequest,
  toggleVoucherActiveSuccess,
  deleteVoucherFailure,
  deleteVoucherRequest,
  deleteVoucherSuccess,
} from './voucherSlice';

const normalizeVoucher = (backendVoucher: BackendVoucher): Voucher => ({
  ...backendVoucher,
  rankIds: backendVoucher.rankIds ?? [],
  usedCount: backendVoucher.usedCount ?? 0,
});

// Fetch vouchers saga
function* handleFetchVouchers(action: PayloadAction<FetchVouchersRequest>) {
  try {
    // Convert null to undefined for API compatibility
    const params = {
      ...action.payload,
      isActive: action.payload.isActive === null ? undefined : action.payload.isActive,
    };

    const response: ApiResponse<VoucherListResponse> = yield call(
      [voucherApi, voucherApi.getAllVouchers],
      params
    );

    if (response.success && response.data) {
      const transformedVouchers = response.data.items.map(normalizeVoucher);

      yield put(fetchVouchersSuccess({
        vouchers: transformedVouchers,
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
      yield put(fetchVouchersFailure(response.message || 'Failed to fetch vouchers'));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while fetching vouchers';
    yield put(fetchVouchersFailure(message));
  }
}

// Create voucher saga
function* handleCreateVoucher(action: PayloadAction<CreateVoucherRequest>) {
  try {
    const response: ApiResponse<BackendVoucher> = yield call(async () =>
      voucherApi.createVoucher(action.payload)
    );

    if (response.success && response.data) {
      yield put(createVoucherSuccess(normalizeVoucher(response.data)));
    } else {
      yield put(createVoucherFailure(response.message || 'Failed to create voucher'));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while creating voucher';
    yield put(createVoucherFailure(message));
  }
}

// Update voucher saga
function* handleUpdateVoucher(action: PayloadAction<UpdateVoucherPayload>) {
  try {
    const { id, voucherData } = action.payload;
    const response: ApiResponse<BackendVoucher> = yield call(async () =>
      voucherApi.updateVoucher(id, voucherData)
    );

    if (response.success && response.data) {
      yield put(updateVoucherSuccess(normalizeVoucher(response.data)));
    } else {
      yield put(updateVoucherFailure(response.message || 'Failed to update voucher'));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while updating voucher';
    yield put(updateVoucherFailure(message));
  }
}

// Toggle voucher active saga
function* handleToggleVoucherActive(action: PayloadAction<number>) {
  try {
    const voucherId = action.payload;
    const response: ApiResponse<BackendVoucher | null> = yield call(async () =>
      voucherApi.toggleVoucherActive(voucherId)
    );

    if (response.success) {
      if (response.data) {
        yield put(toggleVoucherActiveSuccess(normalizeVoucher(response.data)));
      } else {
        const { voucher: voucherState }: RootState = yield select((state: RootState) => state);
        const currentVoucher = voucherState.vouchers.find(v => v.id === voucherId);

        if (currentVoucher) {
          yield put(
            toggleVoucherActiveSuccess({
              ...currentVoucher,
              isActive: !currentVoucher.isActive,
            })
          );
        } else {
          const { filters } = voucherState;
          const requestParams: FetchVouchersRequest = {
            page: 0,
            name: filters.name || undefined,
            type: filters.type ? filters.type : undefined,
            isActive: filters.isActive === null ? undefined : filters.isActive ?? undefined,
            audienceType: filters.audienceType ? filters.audienceType : undefined,
            sortBy: filters.sortBy,
            sortDirection: filters.sortDirection,
          };

          yield put(
            fetchVouchersRequest(requestParams)
          );
        }
      }
    } else {
      yield put(toggleVoucherActiveFailure(response.message || 'Failed to toggle voucher status'));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while toggling voucher status';
    yield put(toggleVoucherActiveFailure(message));
  }
}

// Delete voucher saga
function* handleDeleteVoucher(action: PayloadAction<number>) {
  try {
    const voucherId = action.payload;
    const response: ApiResponse<void> = yield call(async () =>
      voucherApi.deleteVoucher(voucherId)
    );

    if (response.success) {
      yield put(deleteVoucherSuccess(voucherId));
    } else {
      yield put(deleteVoucherFailure(response.message || 'Failed to delete voucher'));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while deleting voucher';
    yield put(deleteVoucherFailure(message));
  }
}

// Watcher sagas
export function* voucherSaga() {
  yield takeLeading(fetchVouchersRequest.type, handleFetchVouchers);
  yield takeEvery(createVoucherRequest.type, handleCreateVoucher);
  yield takeEvery(updateVoucherRequest.type, handleUpdateVoucher);
  yield takeEvery(toggleVoucherActiveRequest.type, handleToggleVoucherActive);
  yield takeEvery(deleteVoucherRequest.type, handleDeleteVoucher);
}