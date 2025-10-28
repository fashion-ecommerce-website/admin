import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Order,
  OrderState,
  OrderQueryParams,
  UpdateOrderRequest,
} from '../../../types/order.types';

// Initial state
const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  detailLoading: false,
  error: null,
  total: 0,
  currentPage: 0,
  totalPages: 0,
  pageSize: 10,
};

// Action payload types
export interface FetchOrdersRequest extends OrderQueryParams {}

export interface FetchOrdersSuccess {
  orders: Order[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface FetchOrdersFailure {
  error: string;
}

export interface FetchOrderByIdRequest {
  orderId: number;
}

export interface FetchOrderByIdSuccess {
  order: Order;
}

export interface FetchOrderByIdFailure {
  error: string;
}

export interface UpdateOrderRequestPayload {
  orderId: number;
  updates: UpdateOrderRequest;
}

export interface UpdateOrderSuccess {
  order: Order;
}

export interface UpdateOrderFailure {
  error: string;
}

export interface UpdateOrderStatusRequest {
  orderId: number;
  status: string;
}

export interface CancelOrderRequest {
  orderId: number;
}

export interface DeleteOrderRequest {
  orderId: number;
}

// Order slice
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Fetch orders
    fetchOrdersRequest: (state, action: PayloadAction<FetchOrdersRequest>) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrdersSuccess: (state, action: PayloadAction<FetchOrdersSuccess>) => {
      state.loading = false;
      state.orders = action.payload.orders;
      state.total = action.payload.total;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
      state.error = null;
    },
    fetchOrdersFailure: (state, action: PayloadAction<FetchOrdersFailure>) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    // Fetch order by ID
    fetchOrderByIdRequest: (state, action: PayloadAction<FetchOrderByIdRequest>) => {
      state.detailLoading = true;
      state.error = null;
    },
    fetchOrderByIdSuccess: (state, action: PayloadAction<FetchOrderByIdSuccess>) => {
      state.detailLoading = false;
      state.selectedOrder = action.payload.order;
      state.error = null;
    },
    fetchOrderByIdFailure: (state, action: PayloadAction<FetchOrderByIdFailure>) => {
      state.detailLoading = false;
      state.error = action.payload.error;
    },

    // Update order
    updateOrderRequest: (state, action: PayloadAction<UpdateOrderRequestPayload>) => {
      state.loading = true;
      state.error = null;
    },
    updateOrderSuccess: (state, action: PayloadAction<UpdateOrderSuccess>) => {
      state.loading = false;
      const index = state.orders.findIndex((o) => o.id === action.payload.order.id);
      if (index !== -1) {
        state.orders[index] = action.payload.order;
      }
      if (state.selectedOrder?.id === action.payload.order.id) {
        state.selectedOrder = action.payload.order;
      }
      state.error = null;
    },
    updateOrderFailure: (state, action: PayloadAction<UpdateOrderFailure>) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    // Update order status
    updateOrderStatusRequest: (state, action: PayloadAction<UpdateOrderStatusRequest>) => {
      state.loading = true;
      state.error = null;
    },

    // Cancel order
    cancelOrderRequest: (state, action: PayloadAction<CancelOrderRequest>) => {
      state.loading = true;
      state.error = null;
    },

    // Delete order
    deleteOrderRequest: (state, action: PayloadAction<DeleteOrderRequest>) => {
      state.loading = true;
      state.error = null;
    },
    deleteOrderSuccess: (state, action: PayloadAction<{ orderId: number }>) => {
      state.loading = false;
      state.orders = state.orders.filter((o) => o.id !== action.payload.orderId);
      state.total = state.total - 1;
      if (state.selectedOrder?.id === action.payload.orderId) {
        state.selectedOrder = null;
      }
      state.error = null;
    },
    deleteOrderFailure: (state, action: PayloadAction<{ error: string }>) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    // Clear selected order
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Export actions
export const {
  fetchOrdersRequest,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  fetchOrderByIdRequest,
  fetchOrderByIdSuccess,
  fetchOrderByIdFailure,
  updateOrderRequest,
  updateOrderSuccess,
  updateOrderFailure,
  updateOrderStatusRequest,
  cancelOrderRequest,
  deleteOrderRequest,
  deleteOrderSuccess,
  deleteOrderFailure,
  clearSelectedOrder,
  clearError,
} = orderSlice.actions;

// Export reducer
export default orderSlice.reducer;
