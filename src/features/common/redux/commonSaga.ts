import { call, put } from 'redux-saga/effects';
import { takeLatest } from '@redux-saga/core/effects';
import { commonApi } from '@/services/api/commonApi';
import {
  fetchEnumsRequest,
  fetchEnumsSuccess,
  fetchEnumsFailure,
} from './commonSlice';
import { CommonEnumsResponse } from '@/types/common.types';

/**
 * Fetch enums saga
 */
function* fetchEnumsSaga() {
  try {
    const response: CommonEnumsResponse = yield call([commonApi, commonApi.getEnums]);
    yield put(fetchEnumsSuccess(response));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch enums';
    yield put(fetchEnumsFailure(errorMessage));
  }
}

/**
 * Root saga for common feature
 */
export function* commonSaga() {
  yield takeLatest(fetchEnumsRequest.type, fetchEnumsSaga);
}
