'use client';

import React from 'react';
import { Product, ProductState } from '../../../types/product.types';

interface ProductsPresenterProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: ProductState['pagination'];
  filters: ProductState['filters'];
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filters: Partial<ProductState['filters']>) => void;
  onPageChange: (page: number) => void;
  onCreateProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  onClearError: () => void;
}

export const ProductsPresenter: React.FC<ProductsPresenterProps> = ({
  products,
  loading,
  error,
  pagination,
  filters,
  onSearch,
  onFilterChange,
  onPageChange,
  onCreateProduct,
  onEditProduct,
  onDeleteProduct,
  onClearError,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortDirection] = e.target.value.split(':') as [
      ProductState['filters']['sortBy'],
      ProductState['filters']['sortDirection']
    ];
    onFilterChange({ sortBy, sortDirection });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const isActive = value === '' ? null : value === 'active';
    onFilterChange({ isActive });
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const currentPage = pagination.page + 1; // Convert from 0-based to 1-based
    const totalPages = pagination.totalPages;

    // Previous button
    pages.push(
      <button
        key="prev"
        className="px-4 py-2 mx-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        onClick={() => onPageChange(pagination.page - 1)}
        disabled={!pagination.hasPrevious}
      >
        Previous
      </button>
    );

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`px-4 py-2 mx-1 text-sm border rounded-lg font-medium ${
            i === currentPage
              ? 'bg-black text-white border-black'
              : 'border-gray-300 bg-white'
          }`}
          onClick={() => onPageChange(i - 1)} // Convert to 0-based
        >
          {i}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        className="px-4 py-2 mx-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        onClick={() => onPageChange(pagination.page + 1)}
        disabled={!pagination.hasNext}
      >
        Next
      </button>
    );

    return <div className="flex justify-center mt-6">{pages}</div>;
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">An error occurred</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={onClearError}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-black">
            Product Management
          </h1>
          <p className="text-gray-600 mt-2">
            Showing {pagination.totalItems} products
          </p>
        </div>
        <button
          onClick={onCreateProduct}
          className="bg-black text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-semibold text-black mb-2">
              Search Products
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                value={filters.title}
                onChange={handleSearchChange}
                placeholder="Enter product name..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort" className="block text-sm font-semibold text-black mb-2">
              Sort By
            </label>
            <select
              id="sort"
              value={`${filters.sortBy}:${filters.sortDirection}`}
              onChange={handleSortChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="createdAt:asc">Oldest First</option>
              <option value="title:asc">Name A-Z</option>
              <option value="title:desc">Name Z-A</option>
              <option value="updatedAt:desc">Recently Updated</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-black mb-2">
              Status
            </label>
            <select
              id="status"
              value={filters.isActive === null ? '' : filters.isActive ? 'active' : 'inactive'}
              onChange={handleStatusChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="">All Products</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-96">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-6">
            <svg fill="none" stroke="currentColor" viewBox="0 0 48 48" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 4V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V4H20C20.5523 4 21 4.44772 21 5V6C21 6.55228 20.5523 7 20 7H4C3.44772 7 3 6.55228 3 6V5C3 4.44772 3.44772 4 4 4H7ZM5 9V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V9H5Z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">
            {filters.title || filters.categorySlug || filters.isActive !== null 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first product'}
          </p>
          {(!filters.title && !filters.categorySlug && filters.isActive === null) && (
            <button
              onClick={onCreateProduct}
              className="bg-black text-white px-6 py-3 rounded-lg font-medium"
            >
              Add Product
            </button>
          )}
        </div>
      )}

      {/* Products Table */}
      {!loading && products.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-black">Product List</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Image</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Product Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Colors</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Sizes</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {products.map((product: any) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {/* Use an inline SVG data URL as a reliable placeholder to avoid missing static asset 404s */}
                        <img
                          src={product.thumbnail || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial, Helvetica, sans-serif" font-size="14">No image</text></svg>'}
                          alt={product.title || 'Product image'}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            // Only fallback once to avoid infinite loop trying to load a missing static file
                            const fallback = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial, Helvetica, sans-serif" font-size="14">No image</text></svg>';
                            if (e.currentTarget.src !== fallback) {
                              e.currentTarget.src = fallback;
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.title || 'No name'}</div>
                          <div className="text-sm text-gray-500">ID: {product.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        Category {product.categoryId || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {product.variantColors && product.variantColors.length > 0 ? (
                            product.variantColors.slice(0, 3).map((color: any) => (
                              <div
                                key={color.id}
                                className="w-6 h-6 rounded-full border border-gray-300"
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              />
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">None</span>
                          )}
                          {product.variantColors && product.variantColors.length > 3 && (
                            <span className="text-xs text-gray-500 ml-1 self-center">
                              +{product.variantColors.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {product.variantSizes && product.variantSizes.length > 0 ? (
                            product.variantSizes.slice(0, 4).map((size: any) => (
                              <span
                                key={size.id}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300"
                              >
                                {size.code}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">None</span>
                          )}
                          {product.variantSizes && product.variantSizes.length > 4 && (
                            <span className="text-xs text-gray-500 ml-1 self-center">
                              +{product.variantSizes.length - 4}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEditProduct(product)}
                            className="text-sm px-3 py-1 border border-black rounded text-black bg-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteProduct(product.id)}
                            className="text-sm px-3 py-1 border border-gray-400 text-gray-600 rounded bg-white"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default ProductsPresenter;