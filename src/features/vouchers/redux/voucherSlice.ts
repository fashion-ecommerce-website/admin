import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Voucher,
  VoucherFilters,
  GetVouchersRequest,
  CreateVoucherRequest,
  UpdateVoucherRequest,
} from '../../../types/voucher.types';

// Action interfaces
export type FetchVouchersRequest = GetVouchersRequest;

export type UpdateVoucherPayload = {
  id: number;
  voucherData: UpdateVoucherRequest;
};


export interface FetchVouchersSuccess {
  vouchers: Voucher[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// State interface
interface VoucherState {
  vouchers: Voucher[];
  total: number;
  loading: boolean;
  error: string | null;
  filters: VoucherFilters;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
}

// Initial state
const initialState: VoucherState = {
  vouchers: [],
  total: 0,
  loading: false,
  error: null,
  filters: {
    name: '',
    isActive: null,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  },
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
};

// Slice
const voucherSlice = createSlice({
  name: 'voucher',
  initialState,
  reducers: {
    // Fetch vouchers
    fetchVouchersRequest: {
      reducer: (state) => {
        state.loading = true;
        state.error = null;
      },
      prepare: (payload: FetchVouchersRequest) => ({ payload }),
    },
    fetchVouchersSuccess: (state, action: PayloadAction<FetchVouchersSuccess>) => {
      state.loading = false;
      state.vouchers = action.payload.vouchers;
      state.total = action.payload.pagination.totalItems;
      state.error = null;
    },
    fetchVouchersFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create voucher
    createVoucherRequest: {
      reducer: (state) => {
        state.createLoading = true;
        state.error = null;
      },
      prepare: (payload: CreateVoucherRequest) => ({ payload }),
    },
    createVoucherSuccess: (state, action: PayloadAction<Voucher>) => {
      state.createLoading = false;
      const existingIndex = state.vouchers.findIndex(v => v.id === action.payload.id);
      if (existingIndex !== -1) {
        state.vouchers[existingIndex] = action.payload;
      } else {
        state.vouchers.unshift(action.payload);
        state.total += 1;
      }
      state.error = null;
    },
    createVoucherFailure: (state, action: PayloadAction<string>) => {
      state.createLoading = false;
      state.error = action.payload;
    },

    // Update voucher
    updateVoucherRequest: {
      reducer: (state) => {
        state.updateLoading = true;
        state.error = null;
      },
      prepare: (payload: UpdateVoucherPayload) => ({ payload }),
    },
    updateVoucherSuccess: (state, action: PayloadAction<Voucher>) => {
      state.updateLoading = false;
      const index = state.vouchers.findIndex(v => v.id === action.payload.id);
      if (index !== -1) {
        state.vouchers[index] = action.payload;
      }
      state.error = null;
    },
    updateVoucherFailure: (state, action: PayloadAction<string>) => {
      state.updateLoading = false;
      state.error = action.payload;
    },

    // Toggle voucher active
    toggleVoucherActiveRequest: {
      reducer: (state) => {
        state.updateLoading = true;
        state.error = null;
      },
      prepare: (payload: number) => ({ payload }),
    },
    toggleVoucherActiveSuccess: (state, action: PayloadAction<Voucher>) => {
      state.updateLoading = false;
      const index = state.vouchers.findIndex(v => v.id === action.payload.id);
      if (index !== -1) {
        state.vouchers[index] = action.payload;
      }
      state.error = null;
    },
    toggleVoucherActiveFailure: (state, action: PayloadAction<string>) => {
      state.updateLoading = false;
      state.error = action.payload;
    },

    // Delete voucher
    deleteVoucherRequest: {
      reducer: (state) => {
        state.deleteLoading = true;
        state.error = null;
      },
      prepare: (payload: number) => ({ payload }),
    },
    deleteVoucherSuccess: (state, action: PayloadAction<number>) => {
      state.deleteLoading = false;
      const beforeCount = state.vouchers.length;
      state.vouchers = state.vouchers.filter(v => v.id !== action.payload);
      if (state.vouchers.length < beforeCount) {
        state.total = Math.max(0, state.total - 1);
      }
      state.error = null;
    },
    deleteVoucherFailure: (state, action: PayloadAction<string>) => {
      state.deleteLoading = false;
      state.error = action.payload;
    },

    // Update filters
    updateFilters: (state, action: PayloadAction<Partial<VoucherFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchVouchersRequest,
  fetchVouchersSuccess,
  fetchVouchersFailure,
  createVoucherRequest,
  createVoucherSuccess,
  createVoucherFailure,
  updateVoucherRequest,
  updateVoucherSuccess,
  updateVoucherFailure,
  toggleVoucherActiveRequest,
  toggleVoucherActiveSuccess,
  toggleVoucherActiveFailure,
  deleteVoucherRequest,
  deleteVoucherSuccess,
  deleteVoucherFailure,
  updateFilters,
  clearError,
} = voucherSlice.actions;

export default voucherSlice.reducer;