import { call, put } from 'redux-saga/effects';
import { takeEvery, takeLeading } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { orderApi } from '../../../services/api/orderApi';
import type { ApiResponse } from '../../../services/api/baseApi';
import type { Order, PaginatedResponse } from '../../../types/order.types';
import {
  // Fetch orders
  fetchOrdersRequest,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  type FetchOrdersRequest,

  // Fetch order by ID
  fetchOrderByIdRequest,
  fetchOrderByIdSuccess,
  fetchOrderByIdFailure,
  type FetchOrderByIdRequest,

  // Update order
  updateOrderRequest,
  updateOrderSuccess,
  updateOrderFailure,
  type UpdateOrderRequestPayload,

  // Update order status
  updateOrderStatusRequest,
  type UpdateOrderStatusRequest,

  // Cancel order
  cancelOrderRequest,
  type CancelOrderRequest,

  // Delete order
  deleteOrderRequest,
  deleteOrderSuccess,
  deleteOrderFailure,
  type DeleteOrderRequest,
} from './orderSlice';

// Fetch orders saga
function* handleFetchOrders(action: PayloadAction<FetchOrdersRequest>) {
  try {
    const response: ApiResponse<PaginatedResponse<Order>> = yield call(
      orderApi.getAllOrders.bind(orderApi),
      action.payload
    );

    if (response.success && response.data) {
      yield put(
        fetchOrdersSuccess({
          orders: response.data.content,
          total: response.data.totalElements,
          currentPage: response.data.number,
          totalPages: response.data.totalPages,
        })
      );
    } else {
      yield put(
        fetchOrdersFailure({
          error: response.message || 'Failed to fetch orders',
        })
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    yield put(
      fetchOrdersFailure({
        error: message || 'An error occurred while fetching orders',
      })
    );
  }
}

// Fetch order by ID saga
function* handleFetchOrderById(action: PayloadAction<FetchOrderByIdRequest>) {
  try {
    const { orderId } = action.payload;
    const response: ApiResponse<Order> = yield call(async () =>
      orderApi.getOrderById(orderId)
    );

    if (response.success && response.data) {
      yield put(
        fetchOrderByIdSuccess({
          order: response.data,
        })
      );
    } else {
      yield put(
        fetchOrderByIdFailure({
          error: response.message || 'Failed to fetch order',
        })
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    yield put(
      fetchOrderByIdFailure({
        error: message || 'An error occurred while fetching order',
      })
    );
  }
}

// Update order saga
function* handleUpdateOrder(action: PayloadAction<UpdateOrderRequestPayload>) {
  try {
    const { orderId, updates } = action.payload;
    const response: ApiResponse<Order> = yield call(async () =>
      orderApi.updateOrder(orderId, updates)
    );

    if (response.success && response.data) {
      yield put(
        updateOrderSuccess({
          order: response.data,
        })
      );
      
      // Refetch orders to get updated list
      yield put(fetchOrdersRequest({ page: 0, size: 10 }));
    } else {
      yield put(
        updateOrderFailure({
          error: response.message || 'Failed to update order',
        })
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    yield put(
      updateOrderFailure({
        error: message || 'An error occurred while updating order',
      })
    );
  }
}

// Update order status saga
function* handleUpdateOrderStatus(action: PayloadAction<UpdateOrderStatusRequest>) {
  try {
    const { orderId, status } = action.payload;
    const response: ApiResponse<Order> = yield call(async () =>
      orderApi.updateOrderStatus(orderId, status)
    );

    if (response.success && response.data) {
      yield put(
        updateOrderSuccess({
          order: response.data,
        })
      );
      
      // Refetch orders to get updated list
      yield put(fetchOrdersRequest({ page: 0, size: 10 }));
    } else {
      yield put(
        updateOrderFailure({
          error: response.message || 'Failed to update order status',
        })
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    yield put(
      updateOrderFailure({
        error: message || 'An error occurred while updating order status',
      })
    );
  }
}

// Cancel order saga
function* handleCancelOrder(action: PayloadAction<CancelOrderRequest>) {
  try {
    const { orderId } = action.payload;
    const response: ApiResponse<Order> = yield call(async () =>
      orderApi.cancelOrder(orderId)
    );

    if (response.success && response.data) {
      yield put(
        updateOrderSuccess({
          order: response.data,
        })
      );
      
      // Refetch orders to get updated list
      yield put(fetchOrdersRequest({ page: 0, size: 10 }));
    } else {
      yield put(
        updateOrderFailure({
          error: response.message || 'Failed to cancel order',
        })
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    yield put(
      updateOrderFailure({
        error: message || 'An error occurred while cancelling order',
      })
    );
  }
}

// Delete order saga
function* handleDeleteOrder(action: PayloadAction<DeleteOrderRequest>) {
  try {
    const { orderId } = action.payload;
    const response: ApiResponse<void> = yield call(async () =>
      orderApi.deleteOrder(orderId)
    );

    if (response.success) {
      yield put(
        deleteOrderSuccess({
          orderId: action.payload.orderId,
        })
      );
      
      // Refetch orders to get updated list
      yield put(fetchOrdersRequest({ page: 0, size: 10 }));
    } else {
      yield put(
        deleteOrderFailure({
          error: response.message || 'Failed to delete order',
        })
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    yield put(
      deleteOrderFailure({
        error: message || 'An error occurred while deleting order',
      })
    );
  }
}

// Root order saga
export function* orderSaga() {
  yield takeLeading(fetchOrdersRequest.type, handleFetchOrders);
  yield takeLeading(fetchOrderByIdRequest.type, handleFetchOrderById);
  yield takeEvery(updateOrderRequest.type, handleUpdateOrder);
  yield takeEvery(updateOrderStatusRequest.type, handleUpdateOrderStatus);
  yield takeEvery(cancelOrderRequest.type, handleCancelOrder);
  yield takeEvery(deleteOrderRequest.type, handleDeleteOrder);
}

export default orderSaga;
