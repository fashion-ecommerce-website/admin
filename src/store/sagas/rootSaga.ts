import { all } from '@redux-saga/core/effects';
import { adminAuthSaga } from '../../features/auth/login/redux/adminAuthSaga';
import { dashboardSaga } from '../../features/dashboard/redux/dashboardSaga';
import { userSaga } from '../../features/users/redux/userSaga';
import { productSaga } from '../../features/products/redux/productSaga';

export function* rootSaga() {
  yield all([
    adminAuthSaga(),
    dashboardSaga(),
    userSaga(),
    productSaga(),
  ]);
}
