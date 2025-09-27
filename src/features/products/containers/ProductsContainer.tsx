'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { 
  fetchProductsRequest,
  setFilters,
  clearError,
  type FetchProductsRequest,
} from '../redux/productSlice';
import ProductsPresenter from '../components/ProductsPresenter';
import { ProductModal, DeleteProductModal } from '../../../components/modals/ProductModals';
import { Product, ProductState } from '../../../types/product.types';

const ProductsContainer: React.FC = () => {
  const dispatch = useDispatch();
  
  const { 
    products, 
    loading, 
    error, 
    pagination, 
    filters 
  } = useSelector((state: RootState) => state.product);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Debounced search function
  const debouncedFetch = useCallback(
    debounce((searchParams: FetchProductsRequest) => {
      dispatch(fetchProductsRequest(searchParams));
    }, 500),
    [dispatch]
  );

  // Fetch products when filters change
  useEffect(() => {
    const searchParams: FetchProductsRequest = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      title: filters.title || undefined,
      categorySlug: filters.categorySlug || undefined,
      isActive: filters.isActive ?? undefined,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
    };

    // If it's a search (title filter), use debounced fetch
    if (filters.title) {
      debouncedFetch(searchParams);
    } else {
      dispatch(fetchProductsRequest(searchParams));
    }
  }, [
    dispatch,
    debouncedFetch,
    pagination.page,
    pagination.pageSize,
    filters.title,
    filters.categorySlug,
    filters.isActive,
    filters.sortBy,
    filters.sortDirection,
  ]);

  // Load initial products
  useEffect(() => {
    dispatch(fetchProductsRequest({
      page: 0,
      pageSize: 12,
    }));
  }, [dispatch]);

  const handleSearch = useCallback((searchTerm: string) => {
    dispatch(setFilters({ filters: { title: searchTerm } }));
    // Reset to first page when searching
    if (pagination.page !== 0) {
      // Page will be updated by the effect above
    }
  }, [dispatch, pagination.page]);

  const handleFilterChange = useCallback((newFilters: Partial<ProductState['filters']>) => {
    dispatch(setFilters({ filters: newFilters }));
  }, [dispatch]);

  const handlePageChange = useCallback((page: number) => {
    const searchParams: FetchProductsRequest = {
      page,
      pageSize: pagination.pageSize,
      title: filters.title || undefined,
      categorySlug: filters.categorySlug || undefined,
      isActive: filters.isActive ?? undefined,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
    };
    dispatch(fetchProductsRequest(searchParams));
  }, [dispatch, pagination.pageSize, filters]);

  const handleCreateProduct = useCallback(() => {
    setSelectedProduct(null);
    setIsCreateModalOpen(true);
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteProduct = useCallback((productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsDeleteModalOpen(true);
    }
  }, [products]);

  const handleCloseModals = useCallback(() => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedProduct(null);
  }, []);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return (
    <>
      <ProductsPresenter
        products={products}
        loading={loading}
        error={error}
        pagination={pagination}
        filters={filters}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onCreateProduct={handleCreateProduct}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
        onClearError={handleClearError}
      />

      {/* Modals */}
      <ProductModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        product={null}
      />

      <ProductModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        product={selectedProduct}
      />

      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        product={selectedProduct}
      />
    </>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

export default ProductsContainer;