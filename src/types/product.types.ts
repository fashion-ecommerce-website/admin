// Product interfaces for Admin panel
export interface VariantColor {
  id: number;
  name: string;
  hex: string;
}

export interface VariantSize {
  id: number;
  code: string;
  label: string;
}

// Admin-side per-size variant returned by admin endpoints
export interface SizeVariantAdmin {
  // Unique identifier for this detail on the server (used by admin PUT /products/admin/details/{id})
  detailId: number;
  // Reference to the size metadata
  size: VariantSize;
  // Optional alternate shape returned by some endpoints
  sizeId?: number;
  sizeName?: string;
  // Price and quantity for this specific size variant
  price: number;
  quantity: number;
}

// Product detail interface - unified type for all product detail responses
export interface ProductDetail {
  detailId: number;
  title: string;
  price: number;
  activeColor: string;
  activeSize?: string;
  images: string[];
  colors: string[];
  mapSizeToQuantity: { [size: string]: number };
  description: string[];
  categorySlug: string;
  colorId?: number;
  sizeId?: number;
  quantity?: number;
  // Admin-specific fields (optional for compatibility)
  color?: VariantColor;
  sizeVariants?: SizeVariantAdmin[];
  productTitle?: string;
  colorName?: string;
  sizeName?: string;
  size?: VariantSize | string;
  // Legacy form fields (optional for backward compatibility)
  sizes?: number[]; // Array of size IDs
}

// Admin view of a Product returned by admin GET endpoints
export interface ProductAdmin extends Product {
  productDetails?: ProductDetail[];
}

// Response shape for querying a single product detail by productId + optional colorId/sizeId
export interface ProductDetailQueryResponse {
  productId: number;
  title?: string;
  images?: string[];
  variantColors?: VariantColor[];
  activeColor?: VariantColor;
  variantSizes?: VariantSize[];
  activeSize?: VariantSize;
  // When querying a specific color+size, the backend may include the detailId used for updates
  detailId?: number;
  quantity?: number;
  price?: number;
}

// Main product interface (from API response)
export interface Product {
  id: number;
  title: string;
  currentDetailId:number;
  description: string | null;
  thumbnail: string;
  categoryId: number;
  variantColors: VariantColor[];
  variantSizes: VariantSize[];
  createdAt: string | null;
  updatedAt: string | null;
  isActive: boolean;
  totalQuantity?: number;
  hasOutOfStock?: boolean;
}

// Product list response from API
export interface ProductListResponse {
  items: Product[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Get products request parameters
export interface GetProductsRequest {
  page?: number;
  pageSize?: number;
  title?: string;
  categorySlug?: string;
  isActive?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'quantity';
  sortDirection?: 'asc' | 'desc';
}

// Create product request
export interface CreateProductRequest {
  title: string;
  description?: string;
  thumbnail: string;
  categoryId: number;
  variantColorIds: number[];
  variantSizeIds: number[];
}

// Update product request
export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: number;
}

// Product state for Redux store
export interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: {
    title: string;
    categorySlug: string;
    isActive: boolean | null;
    sortBy: 'createdAt' | 'updatedAt' | 'title' | 'quantity';
    sortDirection: 'asc' | 'desc';
  };
}

// Product modal state
export interface ProductModalState {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  selectedProductId: number | null;
}

// Product detail for form (create/edit product)
export interface ProductDetailForm {
  color: VariantColor;
  sizes: number[];
  images: string[];
  price: number; 
  quantity: number;
  sizeVariants?: Array<{
    sizeId: number;
    price: number;
    quantity: number;
  }>;
}

// Product form data
export interface ProductFormData {
  title: string;
  description: string;
  thumbnail: string;
  categoryId: number;
  productDetails: ProductDetailForm[];
}

// Available colors and sizes for selection
export interface VariantOptions {
  colors: VariantColor[];
  sizes: VariantSize[];
}

// Product filter options
export interface ProductFilterOptions {
  categories: Array<{ id: number; name: string; slug: string }>;
  colors: VariantColor[];
  sizes: VariantSize[];
}