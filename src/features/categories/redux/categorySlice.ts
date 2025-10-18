import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Category,
  CategoryFilters,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../../types/category.types';

// Action interfaces
export type CreateCategoryPayload = CreateCategoryRequest;

export type UpdateCategoryPayload = UpdateCategoryRequest;

// State interface
interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  filters: CategoryFilters;
  createLoading: boolean;
  updateLoading: boolean;
  toggleLoading: boolean;
}

// Initial state
const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
  filters: {
    search: '',
  },
  createLoading: false,
  updateLoading: false,
  toggleLoading: false,
};

// Slice
const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    // Fetch categories tree
    fetchCategoriesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCategoriesSuccess: (state, action: PayloadAction<Category[]>) => {
      state.loading = false;
      state.categories = action.payload;
      state.error = null;
    },
    fetchCategoriesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create category
    createCategoryRequest: {
      reducer: (state) => {
        state.createLoading = true;
        state.error = null;
      },
      prepare: (payload: CreateCategoryPayload) => ({ payload }),
    },
    createCategorySuccess: (state) => {
      state.createLoading = false;
      state.error = null;
    },
    createCategoryFailure: (state, action: PayloadAction<string>) => {
      state.createLoading = false;
      state.error = action.payload;
    },

    // Update category
    updateCategoryRequest: {
      reducer: (state) => {
        state.updateLoading = true;
        state.error = null;
      },
      prepare: (payload: UpdateCategoryPayload) => ({ payload }),
    },
    updateCategorySuccess: (state) => {
      state.updateLoading = false;
      state.error = null;
    },
    updateCategoryFailure: (state, action: PayloadAction<string>) => {
      state.updateLoading = false;
      state.error = action.payload;
    },

    // Toggle category status
    toggleCategoryStatusRequest: {
      reducer: (state) => {
        state.toggleLoading = true;
        state.error = null;
      },
      prepare: (payload: number) => ({ payload }),
    },
    toggleCategoryStatusSuccess: (state) => {
      state.toggleLoading = false;
      state.error = null;
    },
    toggleCategoryStatusFailure: (state, action: PayloadAction<string>) => {
      state.toggleLoading = false;
      state.error = action.payload;
    },

    // Update filters
    updateFilters: (state, action: PayloadAction<Partial<CategoryFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchCategoriesRequest,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  createCategoryRequest,
  createCategorySuccess,
  createCategoryFailure,
  updateCategoryRequest,
  updateCategorySuccess,
  updateCategoryFailure,
  toggleCategoryStatusRequest,
  toggleCategoryStatusSuccess,
  toggleCategoryStatusFailure,
  updateFilters,
  clearError,
} = categorySlice.actions;

export default categorySlice.reducer;
