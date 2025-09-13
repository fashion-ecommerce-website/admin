import { all } from '@redux-saga/core/effects';
import { adminAuthSaga } from '../../features/auth/login/redux/adminAuthSaga';
import { dashboardSaga } from '../../features/dashboard/redux/dashboardSaga';
import { userSaga } from '../../features/users/redux/userSaga';

export function* rootSaga() {
  yield all([
    adminAuthSaga(),
    dashboardSaga(),
    userSaga(),
  ]);
}
