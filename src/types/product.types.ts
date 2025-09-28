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