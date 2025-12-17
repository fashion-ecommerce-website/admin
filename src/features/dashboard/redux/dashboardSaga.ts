import { call, put, Effect } from 'redux-saga/effects';
import { takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { 
  fetchDashboardRequest,
  fetchDashboardSuccess,
  fetchDashboardFailure,
} from './dashboardSlice';
import { dashboardApi, DashboardResponse, PeriodType } from '@/services/api/dashboardApi';

/**
 * Fetch dashboard data with period filter
 */
function* handleFetchDashboard(action: PayloadAction<PeriodType>): Generator<Effect, void, DashboardResponse> {
  try {
    const period = action.payload;
    const response: DashboardResponse = yield call([dashboardApi, dashboardApi.getDashboard], period);
    yield put(fetchDashboardSuccess(response));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    yield put(fetchDashboardFailure(message || 'Failed to fetch dashboard data'));
  }
}

export function* dashboardSaga() {
  yield takeLatest(fetchDashboardRequest.type, handleFetchDashboard);
}
