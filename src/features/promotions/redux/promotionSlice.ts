import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Promotion,
  PromotionFilters,
  GetPromotionsRequest,
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from '../../../types/promotion.types';

// Action interfaces
export type FetchPromotionsRequest = GetPromotionsRequest;

export type UpdatePromotionPayload = {
  id: number;
  promotionData: UpdatePromotionRequest;
};

export interface FetchPromotionsSuccess {
  promotions: Promotion[];
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
interface PromotionState {
  promotions: Promotion[];
  total: number;
  loading: boolean;
  error: string | null;
  filters: PromotionFilters;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
}

// Initial state
const initialState: PromotionState = {
  promotions: [],
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
const promotionSlice = createSlice({
  name: 'promotion',
  initialState,
  reducers: {
    // Fetch promotions
    fetchPromotionsRequest: {
      reducer: (state) => {
        state.loading = true;
        state.error = null;
      },
      prepare: (payload: FetchPromotionsRequest) => ({ payload }),
    },
    fetchPromotionsSuccess: (state, action: PayloadAction<FetchPromotionsSuccess>) => {
      state.loading = false;
      state.promotions = action.payload.promotions;
      state.total = action.payload.pagination.totalItems;
      state.error = null;
    },
    fetchPromotionsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create promotion
    createPromotionRequest: {
      reducer: (state) => {
        state.createLoading = true;
        state.error = null;
      },
      prepare: (payload: CreatePromotionRequest) => ({ payload }),
    },
    createPromotionSuccess: (state, action: PayloadAction<Promotion>) => {
      state.createLoading = false;
      const existingIndex = state.promotions.findIndex(p => p.id === action.payload.id);
      if (existingIndex !== -1) {
        state.promotions[existingIndex] = action.payload;
      } else {
        state.promotions.unshift(action.payload);
        state.total += 1;
      }
      state.error = null;
    },
    createPromotionFailure: (state, action: PayloadAction<string>) => {
      state.createLoading = false;
      state.error = action.payload;
    },

    // Update promotion
    updatePromotionRequest: {
      reducer: (state) => {
        state.updateLoading = true;
        state.error = null;
      },
      prepare: (payload: UpdatePromotionPayload) => ({ payload }),
    },
    updatePromotionSuccess: (state, action: PayloadAction<Promotion>) => {
      state.updateLoading = false;
      const index = state.promotions.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.promotions[index] = action.payload;
      }
      state.error = null;
    },
    updatePromotionFailure: (state, action: PayloadAction<string>) => {
      state.updateLoading = false;
      state.error = action.payload;
    },

    // Toggle promotion active
    togglePromotionActiveRequest: {
      reducer: (state) => {
        state.updateLoading = true;
        state.error = null;
      },
      prepare: (payload: number) => ({ payload }),
    },
    togglePromotionActiveSuccess: (state, action: PayloadAction<Promotion>) => {
      state.updateLoading = false;
      const index = state.promotions.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        // Preserve existing targets if not returned from toggle response
        const existingTargets = state.promotions[index].targets;
        state.promotions[index] = {
          ...action.payload,
          targets: action.payload.targets || existingTargets || [],
        };
      }
      state.error = null;
    },
    togglePromotionActiveFailure: (state, action: PayloadAction<string>) => {
      state.updateLoading = false;
      state.error = action.payload;
    },

    // Delete promotion
    deletePromotionRequest: {
      reducer: (state) => {
        state.deleteLoading = true;
        state.error = null;
      },
      prepare: (payload: number) => ({ payload }),
    },
    deletePromotionSuccess: (state, action: PayloadAction<number>) => {
      state.deleteLoading = false;
      // Thay vì xóa, chỉ cập nhật isActive = false (soft delete)
      const index = state.promotions.findIndex(p => p.id === action.payload);
      if (index !== -1) {
        state.promotions[index] = {
          ...state.promotions[index],
          isActive: false,
        };
      }
      state.error = null;
    },
    deletePromotionFailure: (state, action: PayloadAction<string>) => {
      state.deleteLoading = false;
      state.error = action.payload;
    },

    // Update filters
    updateFilters: (state, action: PayloadAction<Partial<PromotionFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchPromotionsRequest,
  fetchPromotionsSuccess,
  fetchPromotionsFailure,
  createPromotionRequest,
  createPromotionSuccess,
  createPromotionFailure,
  updatePromotionRequest,
  updatePromotionSuccess,
  updatePromotionFailure,
  togglePromotionActiveRequest,
  togglePromotionActiveSuccess,
  togglePromotionActiveFailure,
  deletePromotionRequest,
  deletePromotionSuccess,
  deletePromotionFailure,
  updateFilters,
  clearError,
} = promotionSlice.actions;

export default promotionSlice.reducer;
