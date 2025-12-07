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

// Admin-side product-detail which may represent a color-level detail or a size-level detail
export interface ProductDetailAdmin {
  // Unique identifier for this detail on the server (used by admin endpoints)
  detailId: number;
  // Color metadata for the detail
  color: VariantColor;
  // Color-level default price/quantity (may be used when size-level variants are not present)
  price: number;
  quantity: number;
  // Optional per-size variants
  sizeVariants?: SizeVariantAdmin[];
  // Optional images for this detail
  images?: string[];
  // Optional fields that some admin endpoints may return for convenience
  // Keep them optional so the type stays strict while allowing API variations
  productTitle?: string;
  title?: string;
  colorName?: string;
  sizeName?: string;
  // When a detail represents a single-size variant, backend may include a `size` field
  size?: VariantSize | string;
}

// Admin view of a Product returned by admin GET endpoints
export interface ProductAdmin extends Product {
  productDetails?: ProductDetailAdmin[];
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

// Product detail interface for form handling
export interface ProductDetail {
  color: VariantColor;
  sizes: number[]; // Array of size IDs (legacy)
  images: string[]; // Array of image URLs for this color variant (up to 5)
  // New: per-size variants with individual price and quantity
  sizeVariants?: Array<{
    sizeId: number;
    price: number;
    quantity: number;
  }>;
  // Deprecated/legacy fields (kept for compatibility)
  price: number; // Price for this variant (color-level default)
  quantity: number; // Available quantity for this variant (color-level default)
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
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
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
    sortBy: 'createdAt' | 'updatedAt' | 'title';
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

// Product form data
export interface ProductFormData {
  title: string;
  description: string;
  thumbnail: string;
  categoryId: number;
  productDetails: ProductDetail[]; // Changed from separate color/size arrays
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