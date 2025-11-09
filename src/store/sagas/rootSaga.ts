import { all } from '@redux-saga/core/effects';
import { adminAuthSaga } from '../../features/auth/login/redux/adminAuthSaga';
import { dashboardSaga } from '../../features/dashboard/redux/dashboardSaga';
import { userSaga } from '../../features/users/redux/userSaga';
import { productSaga } from '../../features/products/redux/productSaga';
import { voucherSaga } from '../../features/vouchers/redux/voucherSaga';
import { promotionSaga } from '../../features/promotions/redux/promotionSaga';
import { categorySaga } from '../../features/categories/redux/categorySaga';
import { orderSaga } from '../../features/orders/redux/orderSaga';

export function* rootSaga() {
  yield all([
    adminAuthSaga(),
    dashboardSaga(),
    userSaga(),
    productSaga(),
    voucherSaga(),
    promotionSaga(),
    categorySaga(),
    orderSaga(),
  ]);
}
