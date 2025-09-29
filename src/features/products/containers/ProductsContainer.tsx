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
import EditProductAdminModal from '../../../components/modals/EditProductAdminModal';
import EditProductDetailModal from '../../../components/modals/EditProductDetailModal';
import { Product, ProductState, ProductAdmin, ProductDetailAdmin } from '../../../types/product.types';

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
  const [isVariantPickerOpen, setIsVariantPickerOpen] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
  type VariantListItem = {
    detailId: number;
    colorName?: string;
    sizeName?: string;
    price?: number;
    quantity?: number;
  };

  const [variantList, setVariantList] = useState<VariantListItem[]>([]);

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

  const handleEditVariant = useCallback(async (product: Product) => {
    try {
      // Fetch full product details from API to obtain detail ids
      const res = await (await import('../../../services/api/productApi')).productApi.getProductById(product.id);
      if (res.success && res.data) {
        // Try to extract productDetails or build combinations from variantColors and variantSizes
        const p = res.data as ProductAdmin;
        const variants: VariantListItem[] = [];

        if (Array.isArray(p.productDetails) && p.productDetails.length > 0) {
          // Expect each productDetail to have a detailId and possibly sizeVariants
          for (const d of p.productDetails as ProductDetailAdmin[]) {
            if (Array.isArray(d.sizeVariants) && d.sizeVariants.length > 0) {
              for (const sv of d.sizeVariants) {
                const sizeId = sv.sizeId ?? sv.size?.id;
                variants.push({
                  detailId: sv.detailId,
                  colorName: d.colorName ?? d.color?.name,
                  sizeName: sv.size?.code ?? sv.sizeName ?? (sizeId !== undefined ? String(sizeId) : undefined),
                  price: sv.price,
                  quantity: sv.quantity,
                });
              }
            } else {
              variants.push({
                detailId: d.detailId,
                colorName: d.colorName ?? d.color?.name,
                sizeName: d.sizeName ?? (d.size && typeof d.size === 'string' ? d.size : undefined),
                price: d.price,
                quantity: d.quantity,
              });
            }
          }
        } else if (Array.isArray(p.variantColors) && Array.isArray(p.variantSizes)) {
          // Fallback: combine colors and sizes if backend exposes separate arrays and a predictable detail id is present
          // In this fallback we cannot determine detailId reliably, so we leave variants empty.
        }

        if (variants.length === 0) {
          // Nothing to edit at detail level
          alert('No editable product details (color+size) found for this product');
          return;
        }

        setVariantList(variants);
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
        onEditVariant={handleEditVariant}
        onDeleteProduct={handleDeleteProduct}
        onClearError={handleClearError}
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
              {/* Group variants by color for compact display */}
              {(() => {
                const grouped: Record<string, VariantListItem[]> = {};
                for (const v of variantList) {
                  const key = v.colorName ?? 'Color';
                  if (!grouped[key]) grouped[key] = [];
                  grouped[key].push(v);
                }
                return Object.keys(grouped).map((color) => (
                  <div key={color} className="pb-3 border-b last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-gray-200 border" aria-hidden="true" />
                        <div className="font-medium text-black">{color}</div>
                      </div>
                      <div className="text-sm text-black">{grouped[color].length} size{grouped[color].length > 1 ? 's' : ''}</div>
                    </div>

                      <div className="flex flex-wrap gap-2">
                      {grouped[color].map((item) => (
                        <div key={String(item.detailId)} className="flex items-center gap-3 px-3 py-2 border rounded-md bg-white">
                          <div className="flex flex-col">
                            <div className="text-sm font-semibold text-black">{item.sizeName ?? '-'}</div>
                            <div className="text-xs text-black">{item.price ? `${item.price} VND` : '-'} • {`Qty: ${item.quantity ?? '-'}`}</div>
                          </div>
                          <div>
                            <button
                              onClick={() => {
                                setSelectedDetailId(Number(item.detailId));
                                setIsVariantPickerOpen(false);
                              }}
                              className="px-2 py-1 bg-black text-white rounded text-xs"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* The detail edit modal */}
      <EditProductDetailModal
        isOpen={selectedDetailId !== null}
        onClose={() => setSelectedDetailId(null)}
        productDetailId={selectedDetailId}
        onConfirm={({ detailId, price, quantity }) => {
          // After successful update you may want to refresh product list
          dispatch(fetchProductsRequest({ page: pagination.page, pageSize: pagination.pageSize }));
          setSelectedDetailId(null);
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

// Debounce utility function
function debounce<P extends unknown[], R>(
  func: (...args: P) => R,
  delay: number
): (...args: P) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: P) => {
    clearTimeout(timeoutId);
    // setTimeout callback returns number | NodeJS.Timeout depending on env; cast is safe here
    timeoutId = setTimeout(() => func(...args), delay) as unknown as NodeJS.Timeout;
  };
}

export default ProductsContainer;