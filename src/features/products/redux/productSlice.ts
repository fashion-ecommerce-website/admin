import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  ProductState, 
  Product, 
  GetProductsRequest, 
  CreateProductRequest as CreateProductRequestData, 
  UpdateProductRequest as UpdateProductRequestData 
} from '../../../types/product.types';

// Initial state
const initialState: ProductState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  pagination: {
    page: 0,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  },
  filters: {
    title: '',
    categorySlug: '',
    // Default to showing only active products
    isActive: true,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  },
};

// Action types
export type FetchProductsRequest = GetProductsRequest;

export interface FetchProductsSuccess {
  products: Product[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface FetchProductsFailure {
  error: string;
}

export interface FetchProductByIdRequest {
  id: number;
}

export interface FetchProductByIdSuccess {
  product: Product;
}

export interface FetchProductByIdFailure {
  error: string;
}

export interface CreateProductRequest {
  productData: CreateProductRequestData;
}

export interface CreateProductSuccess {
  product: Product;
}

export interface CreateProductFailure {
  error: string;
}

export interface UpdateProductRequest {
  productData: UpdateProductRequestData;
}

export interface UpdateProductSuccess {
  product: Product;
}

export interface UpdateProductFailure {
  error: string;
}

export interface DeleteProductRequest {
  id: number;
}

export interface DeleteProductSuccess {
  id: number;
}

export interface DeleteProductFailure {
  error: string;
}

export interface SetFiltersRequest {
  filters: Partial<ProductState['filters']>;
}

export interface UploadImageRequest {
  file: File;
}

export interface UploadImageSuccess {
  url: string;
}

export interface UploadImageFailure {
  error: string;
}

// Product slice
const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    // Fetch products
    fetchProductsRequest: (state, _action: PayloadAction<FetchProductsRequest>) => {
      state.loading = true;
      state.error = null;
    },
    // Silent fetch - like fetchProductsRequest but don't toggle global loading
    fetchProductsSilentRequest: (state, _action: PayloadAction<FetchProductsRequest>) => {
      // intentionally do not set state.loading to true — background refresh
      state.error = null;
    },
    fetchProductsSuccess: (state, action: PayloadAction<FetchProductsSuccess>) => {
      state.loading = false;
      state.products = action.payload.products;
      state.pagination = action.payload.pagination;
      state.error = null;
    },
    fetchProductsFailure: (state, action: PayloadAction<FetchProductsFailure>) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    // Fetch single product
    fetchProductByIdRequest: (state /* , action: PayloadAction<FetchProductByIdRequest> */) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductByIdSuccess: (state, action: PayloadAction<FetchProductByIdSuccess>) => {
      state.loading = false;
      state.currentProduct = action.payload.product;
      state.error = null;
    },
    fetchProductByIdFailure: (state, action: PayloadAction<FetchProductByIdFailure>) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    // Create product
    createProductRequest: (state /* , action: PayloadAction<CreateProductRequest> */) => {
      state.loading = true;
      state.error = null;
    },
    createProductSuccess: (state, action: PayloadAction<CreateProductSuccess>) => {
      state.loading = false;
      state.products.unshift(action.payload.product);
      state.error = null;
    },
    createProductFailure: (state, action: PayloadAction<CreateProductFailure>) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    // Update product
    updateProductRequest: (state /* , action: PayloadAction<UpdateProductRequest> */) => {
      state.loading = true;
      state.error = null;
    },
    updateProductSuccess: (state, action: PayloadAction<UpdateProductSuccess>) => {
      state.loading = false;
      const updated = action.payload.product;
      const index = state.products.findIndex(p => p.id === updated.id);
      if (index !== -1) {
        // Merge existing product with updated fields to avoid dropping arrays like variantColors
        const existing = state.products[index];
        state.products[index] = { ...existing, ...updated } as Product;
      }
      if (state.currentProduct?.id === updated.id) {
        state.currentProduct = { ...state.currentProduct, ...updated } as Product;
      }
      state.error = null;
    },
    updateProductFailure: (state, action: PayloadAction<UpdateProductFailure>) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    // Delete product
    deleteProductRequest: (state /* , action: PayloadAction<DeleteProductRequest> */) => {
      state.loading = true;
      state.error = null;
    },
    deleteProductSuccess: (state, action: PayloadAction<DeleteProductSuccess>) => {
      state.loading = false;
      state.products = state.products.filter(p => p.id !== action.payload.id);
      if (state.currentProduct?.id === action.payload.id) {
        state.currentProduct = null;
      }
      state.error = null;
    },
    deleteProductFailure: (state, action: PayloadAction<DeleteProductFailure>) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    // Set filters
    setFilters: (state, action: PayloadAction<SetFiltersRequest>) => {
      state.filters = { ...state.filters, ...action.payload.filters };
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Upload image
    uploadImageRequest: (state /* , action: PayloadAction<UploadImageRequest> */) => {
      state.loading = true;
      state.error = null;
    },
    uploadImageSuccess: (state /* , action: PayloadAction<UploadImageSuccess> */) => {
      state.loading = false;
      state.error = null;
    },
    uploadImageFailure: (state, action: PayloadAction<UploadImageFailure>) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Clear current product
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
});

// Export actions
export const {
  fetchProductsRequest,
  fetchProductsSilentRequest,
  fetchProductsSuccess,
  fetchProductsFailure,
  fetchProductByIdRequest,
  fetchProductByIdSuccess,
  fetchProductByIdFailure,
  createProductRequest,
  createProductSuccess,
  createProductFailure,
  updateProductRequest,
  updateProductSuccess,
  updateProductFailure,
  deleteProductRequest,
  deleteProductSuccess,
  deleteProductFailure,
  setFilters,
  resetFilters,
  uploadImageRequest,
  uploadImageSuccess,
  uploadImageFailure,
  clearError,
  clearCurrentProduct,
} = productSlice.actions;

// Export reducer
export default productSlice.reducer;