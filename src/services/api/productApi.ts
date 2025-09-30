import { adminApiClient } from './baseApi';
import type { ApiResponse } from './baseApi';
import {
  ProductListResponse,
  Product,
  GetProductsRequest,
  CreateProductRequest,
  UpdateProductRequest,
  VariantOptions,
  ProductDetailAdmin,
  ProductAdmin,
  ProductDetailQueryResponse,
} from '../../types/product.types';

class ProductApi {
  private readonly endpoint = '/products';

  /**
   * Get all products with pagination, search and filtering
   */
  async getAllProducts(params?: GetProductsRequest): Promise<ApiResponse<ProductListResponse>> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.title) queryParams.append('title', params.title);
      if (params?.categorySlug) queryParams.append('categorySlug', params.categorySlug);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection);

      const queryString = queryParams.toString();
      const endpoint = `${this.endpoint}/admin${queryString ? `?${queryString}` : ''}`;
      
      const response = await adminApiClient.get<ProductListResponse>(endpoint);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to fetch products',
      };
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: number): Promise<ApiResponse<Product>> {
    try {
      const response = await adminApiClient.get<Product>(`${this.endpoint}/${id}`);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to fetch product',
      };
    }
  }

  /**
   * Create a new product. Accepts either a JSON payload (CreateProductRequest) or a FormData
   * where the 'product' part is JSON and file parts are detail_<colorId>.
   */
  async createProduct(productData: CreateProductRequest | FormData): Promise<ApiResponse<Product>> {
    try {
      const body = productData instanceof FormData ? productData : productData;
      const response = await adminApiClient.post<Product>(`${this.endpoint}/admin`, body);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Product created successfully',
      };
    } catch (error) {
      console.error('Error creating product:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to create product',
      };
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(productData: UpdateProductRequest | FormData & { id: number }): Promise<ApiResponse<Product>> {
    try {
      // If productData is a FormData, it must include 'id' separately via the endpoint path
      if (productData instanceof FormData) {
          const idEntry = productData.get('id');
          const id = typeof idEntry === 'string' ? idEntry : idEntry ? String(idEntry) : null;
          // Prefer explicit id param if set on the FormData; otherwise the caller should pass id in endpoint
          const idValue = id ?? (productData as unknown as { id?: number }).id;
        if (!idValue) {
          throw new Error('Missing product id for update');
        }
          const response = await adminApiClient.put<Product>(`${this.endpoint}/${idValue}`, productData);
        return {
          success: response.success,
          data: response.data,
          message: response.message || 'Product updated successfully',
        };
      }

      const { id, ...updateData } = productData as UpdateProductRequest;
      const response = await adminApiClient.put<Product>(`${this.endpoint}/${id}`, updateData);
      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Product updated successfully',
      };
    } catch (error) {
      console.error('Error updating product:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to update product',
      };
    }
  }

  /**
   * Update an existing product via admin path with JSON body
   * This mirrors the backend route POST/PUT /products/admin/{id} which accepts JSON (not multipart)
   */
  async updateProductAdmin(id: number, updateBody: Partial<UpdateProductRequest>): Promise<ApiResponse<Product>> {
    try {
      const response = await adminApiClient.put<Product>(`${this.endpoint}/admin/${id}`, updateBody);
      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Product updated successfully',
      };
    } catch (error) {
      console.error('Error updating product via admin endpoint:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to update product (admin)',
      };
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await adminApiClient.delete(`${this.endpoint}/${id}`);
      
      return {
        success: response.success,
        data: null,
        message: response.message || 'Product deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting product:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to delete product',
      };
    }
  }

  /**
   * Delete a product via admin endpoint
   * DELETE /products/admin/{id}
   */
  async deleteProductAdmin(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await adminApiClient.delete(`${this.endpoint}/admin/${id}`);

      return {
        success: response.success,
        data: null,
        message: response.message || 'Product deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting product (admin):', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to delete product (admin)',
      };
    }
  }

  /**
   * Get available variant options (colors and sizes)
   */
  async getVariantOptions(): Promise<ApiResponse<VariantOptions>> {
    try {
      const response = await adminApiClient.get<VariantOptions>('/variants/options');
      
      return {
        success: response.success,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      console.error('Error fetching variant options:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to fetch variant options',
      };
    }
  }

  /**
   * Get a single product detail (color+size) by productDetail id via admin endpoint
   * GET /products/details/{detailId}
   */
  async getProductDetailAdmin(detailId: number): Promise<ApiResponse<ProductDetailAdmin>> {
    try {
      const response = await adminApiClient.get<ProductDetailAdmin>(`${this.endpoint}/details/${detailId}`);
      return {
        success: response.success,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      console.error('Error fetching product detail (admin):', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to fetch product detail (admin)'
      };
    }
  }

  /**
   * Query a single product detail by productId and optional colorId/sizeId
   * GET /products/admin/details?productId={productId}&colorId={colorId}&sizeId={sizeId}
   */
  async getProductDetailByQuery(
    productId: number,
    colorId?: number,
    sizeId?: number
  ): Promise<ApiResponse<ProductDetailQueryResponse>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('productId', String(productId));
      if (colorId !== undefined) queryParams.append('colorId', String(colorId));
      if (sizeId !== undefined) queryParams.append('sizeId', String(sizeId));

      const endpoint = `${this.endpoint}/admin/details?${queryParams.toString()}`;
      const response = await adminApiClient.get<ProductDetailQueryResponse>(endpoint);

      return {
        success: response.success,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      console.error('Error querying product detail (admin):', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to query product detail (admin)'
      };
    }
  }

  /**
   * Update a product detail (price/quantity) via admin endpoint
   * PUT /products/admin/details/{detailId}
   * Body example: { colorId, sizeId, price, quantity }
   */
  async updateProductDetailAdmin(
    detailId: number,
    body: Partial<{ colorId: number; sizeId: number; price: number; quantity: number }>
  ): Promise<ApiResponse<ProductDetailAdmin>> {
    try {
      const response = await adminApiClient.put<ProductDetailAdmin>(`${this.endpoint}/admin/details/${detailId}`, body);
      return {
        success: response.success,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      console.error('Error updating product detail (admin):', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to update product detail (admin)'
      };
    }
  }

  /**
   * Upload product image
   */
  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await adminApiClient.post<{ url: string }>('/upload/product-image', formData);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Image uploaded successfully',
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to upload image',
      };
    }
  }
}

// Export singleton instance
export const productApi = new ProductApi();