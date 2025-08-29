import { all } from '@redux-saga/core/effects';
import { adminAuthSaga } from '../../features/auth/login/redux/adminAuthSaga';
import { dashboardSaga } from '../../features/dashboard/redux/dashboardSaga';

export function* rootSaga() {
  yield all([
    adminAuthSaga(),
    dashboardSaga(),
  ]);
}
