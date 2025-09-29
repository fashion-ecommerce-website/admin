import { call, put } from 'redux-saga/effects';
import { takeEvery, takeLeading } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { productApi } from '../../../services/api/productApi';
import type { ApiResponse } from '../../../services/api/baseApi';
import type { ProductListResponse, Product } from '../../../types/product.types';
import * as productSlice from './productSlice';

// Fetch products saga
function* handleFetchProducts(action: PayloadAction<productSlice.FetchProductsRequest>) {
  try {
    const response: ApiResponse<ProductListResponse> = yield call(
      productApi.getAllProducts.bind(productApi),
      action.payload
    );

    if (response.success && response.data) {
      yield put(productSlice.fetchProductsSuccess({
        products: response.data.items,
        pagination: {
          page: response.data.page,
          pageSize: response.data.pageSize,
          totalItems: response.data.totalItems,
          totalPages: response.data.totalPages,
          hasNext: response.data.hasNext,
          hasPrevious: response.data.hasPrevious,
        },
      }));
    } else {
      yield put(productSlice.fetchProductsFailure({
        error: response.message || 'Failed to fetch products',
      }));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while fetching products';
    yield put(productSlice.fetchProductsFailure({ error: message }));
  }
}

// Fetch single product saga - simplified for now
function* handleFetchProductById(action: PayloadAction<productSlice.FetchProductByIdRequest>) {
  try {
    // For now, just show error - can be implemented later when backend is ready
    yield put(productSlice.fetchProductByIdFailure({
      error: 'Fetch single product functionality will be available when backend is integrated',
    }));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while fetching product';
    yield put(productSlice.fetchProductByIdFailure({ error: message }));
  }
}

// Create product saga - simplified for now
function* handleCreateProduct(action: PayloadAction<productSlice.CreateProductRequest>) {
  try {
    // For now, just show success - can be implemented later when backend is ready
    yield put(productSlice.createProductFailure({
      error: 'Create product functionality will be available when backend is integrated',
    }));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while creating product';
    yield put(productSlice.createProductFailure({ error: message }));
  }
}

// Update product saga - simplified for now
function* handleUpdateProduct(action: PayloadAction<productSlice.UpdateProductRequest>) {
  try {
    // For now, just show error - can be implemented later when backend is ready
    yield put(productSlice.updateProductFailure({
      error: 'Update product functionality will be available when backend is integrated',
    }));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while updating product';
    yield put(productSlice.updateProductFailure({ error: message }));
  }
}

// Delete product saga - simplified for now
function* handleDeleteProduct(action: PayloadAction<productSlice.DeleteProductRequest>) {
  try {
    // For now, just show error - can be implemented later when backend is ready
    yield put(productSlice.deleteProductFailure({
      error: 'Delete product functionality will be available when backend is integrated',
    }));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while deleting product';
    yield put(productSlice.deleteProductFailure({ error: message }));
  }
}

// Upload image saga - simplified for now
function* handleUploadImage(action: PayloadAction<productSlice.UploadImageRequest>) {
  try {
    // For now, just show success - can be implemented later when backend is ready
    yield put(productSlice.uploadImageFailure({
      error: 'Image upload functionality will be available when backend is integrated',
    }));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while uploading image';
    yield put(productSlice.uploadImageFailure({ error: message }));
  }
}

// Root product saga
export function* productSaga() {
  yield takeEvery(productSlice.fetchProductsRequest.type, handleFetchProducts);
  yield takeEvery(productSlice.fetchProductsSilentRequest.type, handleFetchProducts);
  yield takeEvery(productSlice.fetchProductByIdRequest.type, handleFetchProductById);
  yield takeLeading(productSlice.createProductRequest.type, handleCreateProduct);
  yield takeLeading(productSlice.updateProductRequest.type, handleUpdateProduct);
  yield takeLeading(productSlice.deleteProductRequest.type, handleDeleteProduct);
  yield takeLeading(productSlice.uploadImageRequest.type, handleUploadImage);
}

export default productSaga;