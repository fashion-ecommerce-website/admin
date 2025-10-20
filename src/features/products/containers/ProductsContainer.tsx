'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { CustomDropdown } from '../../../components/ui';
import { 
  fetchProductsRequest,
  setFilters,
  clearError,
  type FetchProductsRequest,
} from '../redux/productSlice';
import ProductsPresenter from '../components/ProductsPresenter';
import { ProductModal, DeleteProductModal } from '../../../components/modals/ProductModals';
import EditProductAdminModal from '../../../components/modals/EditProductAdminModal';
import EditProductDetailModal from '../../../components/modals/EditProductDetailModal';
import { Product, ProductDetailQueryResponse } from '../../../types/product.types';
import { productApi } from '../../../services/api/productApi';
import { useMinimumLoadingTime } from '../../../hooks/useMinimumLoadingTime';

const ProductsContainer: React.FC = () => {
  const dispatch = useDispatch();
  
  const { 
    products, 
    loading, 
    error, 
    pagination, 
    filters 
  } = useSelector((state: RootState) => state.product);

  // Use minimum loading time hook to ensure skeleton shows for at least 500ms
  const displayLoading = useMinimumLoadingTime(loading, 500);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isVariantPickerOpen, setIsVariantPickerOpen] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null); // Add this
  // type VariantListItem = {
  //   detailId: number;
  //   colorName?: string;
  //   sizeName?: string;
  //   price?: number;
  //   quantity?: number;
  // };

  // const [variantList, setVariantList] = useState<VariantListItem[]>([]);

  // New states for query-by-color/size flow
  const [productDetailQuery, setProductDetailQuery] = useState<ProductDetailQueryResponse | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [detailQueryDetailId, setDetailQueryDetailId] = useState<number | null>(null);
  const [detailQueryPrice, setDetailQueryPrice] = useState<number | null>(null);
  const [detailQueryQuantity, setDetailQueryQuantity] = useState<number | null>(null);

  // Debounced search function
  const debouncedFetch = useCallback(
    (searchParams: FetchProductsRequest) => {
      dispatch(fetchProductsRequest(searchParams));
    },
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

  const handleSearch = useCallback((searchTerm: string) => {
    dispatch(setFilters({ filters: { title: searchTerm } }));
    // Reset to first page when searching
    if (pagination.page !== 0) {
      // Page will be updated by the effect above
    }
  }, [dispatch, pagination.page]);

  const handleFilterChange = useCallback((newFilters: {
    title?: string;
    categorySlug?: string;
    isActive?: boolean | null;
    sortBy?: 'createdAt' | 'updatedAt' | 'title';
    sortDirection?: 'asc' | 'desc';
  }) => {
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

  const handleEditVariant = useCallback(async (product: Product) => {
    try {
  // Use query-by-product/color/size endpoint to fetch available colors/sizes and the active detail
  // If the product already exposes colors/sizes, pass the first available of each to the query
  const initialColorId = product.variantColors?.[0]?.id;
  const initialSizeId = product.variantSizes?.[0]?.id;
  const res = await productApi.getProductDetailByQuery(product.id, initialColorId, initialSizeId);
      if (res.success && res.data) {
        const d = res.data;
        setProductDetailQuery(d);
        setSelectedColorId(d.activeColor?.id ?? d.variantColors?.[0]?.id ?? null);
        setSelectedSizeId(d.activeSize?.id ?? d.variantSizes?.[0]?.id ?? null);
        setDetailQueryPrice(d.price ?? null);
        setDetailQueryQuantity(d.quantity ?? null);
        setDetailQueryDetailId(d.detailId ?? null);
        setSelectedProduct(product);
        setIsVariantPickerOpen(true);
      } else {
        alert(res.message || 'Failed to load product details');
      }
    } catch (error) {
      console.error('Error fetching product details for variant edit', error);
      alert('Failed to load product details');
    }
  }, []);

  const handleDeleteProduct = useCallback((productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsDeleteModalOpen(true);
    }
  }, [products]);

  const handleEditProductDetail = useCallback(async (product: Product) => {
    try {
      console.log('Editing product detail for product:', product);
      
      // Save productId for modal
      setSelectedProductId(product.id);
      
      // Step 1: Call GET /products/details/{productId} to get all colors and sizes
      const productDetailRes = await productApi.getProductByIdPublic(product.id.toString());
      
      if (!productDetailRes.success || !productDetailRes.data) {
        alert('Failed to load product information');
        return;
      }
      
      const productInfo = productDetailRes.data;
      console.log('Product info loaded:', productInfo);
      
      // Step 2: Get the first color to call the color-specific API
      const firstColor = productInfo.colors?.[0];
      if (!firstColor) {
        alert('No colors found for this product');
        return;
      }
      
      // Step 3: Call GET /products/details/{productId}/color?activeColor={firstColor}
      const colorSpecificRes = await productApi.getProductByColorPublic(
        product.id.toString(),
        firstColor,
        productInfo.activeSize // Use existing size if available
      );
      
      if (!colorSpecificRes.success || !colorSpecificRes.data) {
        alert('Failed to load product detail for color: ' + firstColor);
        return;
      }
      
      console.log('Color-specific detail loaded:', colorSpecificRes.data);
      
      // Step 4: Open modal with the loaded detail
      setSelectedDetailId(colorSpecificRes.data.detailId);
      
    } catch (error) {
      console.error('Error fetching product detail for editing:', error);
      alert('Error loading product detail: ' + (error as Error).message);
    }
  }, []);

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
        loading={displayLoading}
        error={error}
        pagination={pagination}
        filters={filters}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onCreateProduct={handleCreateProduct}
        onEditProduct={handleEditProduct}
        onEditVariant={handleEditVariant}
        onDeleteProduct={handleDeleteProduct}
        onClearError={handleClearError}
        onEditProductDetail={handleEditProductDetail}
      />

      {/* Modals */}
      <ProductModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
      />

      {/* Edit (admin JSON) modal */}
      <EditProductAdminModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        productId={selectedProduct?.id ?? 0}
        initial={{
          title: selectedProduct?.title ?? undefined,
          description: selectedProduct?.description ?? undefined,
          categoryIds: selectedProduct ? [selectedProduct.categoryId] : undefined,
        }}
      />

      {/* Variant picker modal - simple list to choose which product detail to edit */}
      {isVariantPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsVariantPickerOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-auto">
            <div className="bg-black px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Select Variant to Edit</h3>
              <button onClick={() => setIsVariantPickerOpen(false)} className="text-white">✕</button>
            </div>
            <div className="p-4">
              {/* New: select color and size; call query endpoint when selection changes */}
              {productDetailQuery ? (
                <div className="space-y-4 text-black">
                  <div>
                    <label className="block text-sm font-medium mb-1">Color</label>
                    <CustomDropdown
                      value={selectedColorId?.toString() ?? ''}
                      onChange={async (value) => {
                        const newColorId = value ? Number(value) : null;
                        setSelectedColorId(newColorId);
                        try {
                          const q = await productApi.getProductDetailByQuery(selectedProduct?.id ?? 0, newColorId ?? undefined, selectedSizeId ?? undefined);
                          if (q.success && q.data) {
                            setProductDetailQuery(q.data);
                            setDetailQueryPrice(q.data.price ?? null);
                            setDetailQueryQuantity(q.data.quantity ?? null);
                            setDetailQueryDetailId(q.data.detailId ?? null);
                          }
                        } catch (err) {
                          console.error('Error querying detail on color change', err);
                        }
                      }}
                      options={[
                        { value: '', label: '-- Select color --' },
                        ...(productDetailQuery.variantColors?.map((c) => ({ value: c.id.toString(), label: c.name })) ?? [])
                      ]}
                      padding="p-2"
                      borderRadius="rounded-md"
                      bgColor="bg-white"
                      className="mt-1 block w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Size</label>
                    <CustomDropdown
                      value={selectedSizeId?.toString() ?? ''}
                      onChange={async (value) => {
                        const newSizeId = value ? Number(value) : null;
                        setSelectedSizeId(newSizeId);
                        try {
                          const q = await productApi.getProductDetailByQuery(selectedProduct?.id ?? 0, selectedColorId ?? undefined, newSizeId ?? undefined);
                          if (q.success && q.data) {
                            setProductDetailQuery(q.data);
                            setDetailQueryPrice(q.data.price ?? null);
                            setDetailQueryQuantity(q.data.quantity ?? null);
                            setDetailQueryDetailId(q.data.detailId ?? null);
                          }
                        } catch (err) {
                          console.error('Error querying detail on size change', err);
                        }
                      }}
                      options={[
                        { value: '', label: '-- Select size --' },
                        ...(productDetailQuery.variantSizes?.map((s) => ({ value: s.id.toString(), label: s.code })) ?? [])
                      ]}
                      padding="p-2"
                      borderRadius="rounded-md"
                      bgColor="bg-white"
                      className="mt-1 block w-full"
                    />
                  </div>

                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Price (VND)</label>
                      <input type="number" className="w-full border rounded-md p-2" value={detailQueryPrice ?? ''} onChange={(e) => setDetailQueryPrice(e.target.value ? Number(e.target.value) : null)} />
                    </div>
                    <div className="w-36">
                      <label className="block text-sm font-medium mb-1">Quantity</label>
                      <input type="number" className="w-full border rounded-md p-2" value={detailQueryQuantity ?? ''} onChange={(e) => setDetailQueryQuantity(e.target.value ? Number(e.target.value) : null)} />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button onClick={() => setIsVariantPickerOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                    <button
                      onClick={async () => {
                        if (!detailQueryDetailId) {
                          alert('Cannot update: missing detail id for this color+size');
                          return;
                        }
                        try {
                          const body = {
                            colorId: selectedColorId ?? undefined,
                            sizeId: selectedSizeId ?? undefined,
                            price: detailQueryPrice ?? undefined,
                            quantity: detailQueryQuantity ?? undefined,
                          };
                          const upd = await productApi.updateProductDetailAdmin(detailQueryDetailId, body);
                          if (upd.success) {
                            // Refresh products list
                            dispatch(fetchProductsRequest({ page: pagination.page, pageSize: pagination.pageSize }));
                            setIsVariantPickerOpen(false);
                            setSelectedDetailId(null);
                          } else {
                            alert(upd.message || 'Failed to update');
                          }
                        } catch (err) {
                          console.error('Error updating product detail', err);
                          alert('Failed to update product detail');
                        }
                      }}
                      className="px-4 py-2 bg-black text-white rounded"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>Loading...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* The detail edit modal */}
      <EditProductDetailModal
        isOpen={selectedDetailId !== null}
        onClose={() => {
          setSelectedDetailId(null);
          setSelectedProductId(null);
        }}
        productDetailId={selectedDetailId}
        productId={selectedProductId ?? undefined}
        onConfirm={() => {
          // After successful update you may want to refresh product list
          dispatch(fetchProductsRequest({ page: pagination.page, pageSize: pagination.pageSize }));
          setSelectedDetailId(null);
          setSelectedProductId(null);
        }}
      />

      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        product={selectedProduct}
      />
    </>
  );
};

export default ProductsContainer;