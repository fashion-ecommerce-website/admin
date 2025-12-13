import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Refund,
  RefundState,
  RefundQueryParams,
  UpdateRefundStatusRequest,
} from '../../../types/refund.types';

const initialState: RefundState = {
  refunds: [],
  selectedRefund: null,
  loading: false,
  error: null,
  total: 0,
  currentPage: 0,
  totalPages: 0,
  pageSize: 10,
};

const refundSlice = createSlice({
  name: 'refunds',
  initialState,
  reducers: {
    // Fetch refunds
    fetchRefundsRequest: (state, _: PayloadAction<RefundQueryParams>) => {
      void _;
      state.loading = true;
      state.error = null;
    },
    fetchRefundsSuccess: (
      state,
      action: PayloadAction<{
        refunds: Refund[];
        total: number;
        currentPage: number;
        totalPages: number;
        pageSize: number;
      }>
    ) => {
      state.loading = false;
      state.refunds = action.payload.refunds;
      state.total = action.payload.total;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
      state.pageSize = action.payload.pageSize;
    },
    fetchRefundsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single refund
    fetchRefundByIdRequest: (
      state,
      _: PayloadAction<{ refundId: number }>
    ) => {
      void _;
      state.loading = true;
      state.error = null;
    },
    fetchRefundByIdSuccess: (state, action: PayloadAction<Refund>) => {
      state.loading = false;
      state.selectedRefund = action.payload;
    },
    fetchRefundByIdFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update refund status
    updateRefundStatusRequest: (
      state,
      _: PayloadAction<{
        refundId: number;
        data: UpdateRefundStatusRequest;
      }>
    ) => {
      void _;
      state.loading = true;
      state.error = null;
    },
    updateRefundStatusSuccess: (state, action: PayloadAction<Refund>) => {
      state.loading = false;
      // Update in list
      const index = state.refunds.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.refunds[index] = action.payload;
      }
      // Update selected if same
      if (state.selectedRefund?.id === action.payload.id) {
        state.selectedRefund = action.payload;
      }
    },
    updateRefundStatusFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear selected refund
    clearSelectedRefund: (state) => {
      state.selectedRefund = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchRefundsRequest,
  fetchRefundsSuccess,
  fetchRefundsFailure,
  fetchRefundByIdRequest,
  fetchRefundByIdSuccess,
  fetchRefundByIdFailure,
  updateRefundStatusRequest,
  updateRefundStatusSuccess,
  updateRefundStatusFailure,
  clearSelectedRefund,
  clearError,
} = refundSlice.actions;

export default refundSlice.reducer;
