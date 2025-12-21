"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { adminApiClient } from "../../../services/api/baseApi";
import {
  categoryApi,
  CategoryBackend,
} from "../../../services/api/categoryApi";
import {
  Product,
  VariantColor,
  VariantSize,
} from "../../../types/product.types";
import {
  ProductRowSkeleton,
  TableSkeletonWithRows,
} from "../../../components/ui/Skeleton";
import { CustomDropdown, Pagination } from "../../../components/ui";
import ExportExcelButton from "@/components/ui/ExportExcelButton";

interface ProductFilters {
  title?: string;
  categorySlug?: string;
  isActive?: boolean | null;
  sortBy?: "createdAt" | "updatedAt" | "title" | "quantity";
  sortDirection?: "asc" | "desc";
}

interface ProductsPresenterProps {
  products: Product[];
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
  filters: ProductFilters;
  onSearch?: (query: string) => void;
  onFilterChange: (filters: ProductFilters) => void;
  onPageChange: (page: number, pageSize: number) => void;
  onCreateProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  onToggleProductActive?: (productId: number) => void;
  onClearError: () => void;
  onEditProductDetail?: (product: Product) => void; // New prop for editing product detail
  onExportExcel?: () => void; // New prop for exporting to Excel
  onCreateProductDetail?: (product: Product) => void; // New prop for creating product detail
  onToggleProductDetailStatus?: (productDetailId: number) => void; // New prop for toggling product detail status
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
  onToggleProductActive,
  onClearError,
  onEditProductDetail, // New prop
  onExportExcel, // New prop
  onCreateProductDetail, // New prop
}) => {
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; size: number; file?: File }[]
  >([]);
  // Preview state
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [activePreviewFile, setActivePreviewFile] = useState<{
    name: string;
    size: number;
    file?: File;
  } | null>(null);

  // Handle preview file (calls backend)
  const handlePreviewCSV = async (file: {
    name: string;
    size: number;
    file?: File;
  }) => {
    if (!file.file) return;
    setActivePreviewFile(file);
    setPreviewLoading(true);
    setPreviewData([]);
    try {
      const formData = new FormData();
      formData.append("file", file.file);
      const res = await adminApiClient.post<Record<string, unknown>[]>(
        "/products/import/preview",
        formData
      );
      setPreviewData(res.data || []);
    } catch {
      setPreviewData([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Handle delete file
  const handleDeleteCSV = (file: { name: string; size: number }) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== file.name));
    if (activePreviewFile && activePreviewFile.name === file.name) {
      setActivePreviewFile(null);
      setPreviewData([]);
    }
  };

  // Suppress unused variable warnings - these are kept for future use
  void uploadedFiles;
  void previewData;
  void previewLoading;
  void handlePreviewCSV;
  void handleDeleteCSV;

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        const res = await categoryApi.getTree();
        if (!mounted) return;
        if (res.success && res.data) {
          const map: Record<number, string> = {};
          const walk = (items: CategoryBackend[] | null) => {
            if (!items) return;
            for (const it of items) {
              map[it.id] = it.name;
              if (it.children) walk(it.children);
            }
          };
          walk(res.data);
          setCategoryMap(map);
        }
      } catch {
        // ignore - presenter should not crash the page for category fetch failures
        // Optionally you could set an error state and show it in the UI
      }
    }

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value);
  };

  // Use shared Pagination component for consistent UI

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
            <svg
              className="w-8 h-8 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">
            An error occurred
          </h3>
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
          <h1 className="text-4xl font-bold text-black">Product Management</h1>
        </div>
        <div className="flex gap-3">
          {onExportExcel && <ExportExcelButton onClick={onExportExcel} />}
          {/* Import Excel Button client-side navigation */}
          <Link
            href="/products/import-csv"
            className="bg-black text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 hover:bg-gray-800 transition-colors"
            prefetch
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 9l5-5 5 5M12 4v12"
              />
            </svg>
            <span>Import Excel</span>
          </Link>
          <button
            onClick={onCreateProduct}
            className="cursor-pointer bg-black text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 hover:bg-gray-800 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
        {/*
          Using Tailwind arbitrary grid template columns to control column widths.
          - First column (Search) is ~3fr (three parts) so it appears around 3/5 width
          - Second and third columns are 1fr each and share the remaining 2/5
          To adjust ratios, change the values in grid-cols-[3fr_1fr_1fr] (e.g. [4fr_1fr_1fr])
        */}
        <div className="grid grid-cols-[3fr_1fr_1fr] gap-6">
          {/* Search */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-semibold text-black mb-2"
            >
              Search Products
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                value={filters.title}
                onChange={handleSearchChange}
                placeholder="Enter product name..."
                className="w-full h-[10%] pl-10 text-black pr-4 py-3 border border-gray-300 rounded-lg focus:border-black"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Sort */}
          <div>
            <label
              htmlFor="sort"
              className="block text-sm font-semibold text-black mb-2"
            >
              Sort By
            </label>
            <CustomDropdown
              value={`${filters.sortBy}:${filters.sortDirection}`}
              onChange={(value) => {
                const [sortBy, sortDirection] = value.split(":");
                onFilterChange({
                  ...filters,
                  sortBy: sortBy as "createdAt" | "quantity",
                  sortDirection: sortDirection as "asc" | "desc",
                });
              }}
              options={[
                { value: "createdAt:desc", label: "Newest First" },
                { value: "createdAt:asc", label: "Oldest First" },
                { value: "quantity:desc", label: "Quantity High-Low" },
                { value: "quantity:asc", label: "Quantity Low-High" },
              ]}
              padding="px-4 py-3"
              borderRadius="rounded-lg"
              bgColor="bg-white"
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-semibold text-black mb-2"
            >
              Status
            </label>
            <CustomDropdown
              value={
                filters.isActive === null
                  ? "ALL"
                  : filters.isActive
                  ? "ACTIVE"
                  : "INACTIVE"
              }
              onChange={(value) => {
                let isActive: boolean | null = null;
                if (value === "ACTIVE") isActive = true;
                else if (value === "INACTIVE") isActive = false;
                onFilterChange({ ...filters, isActive });
              }}
              options={[
                { value: "ALL", label: "All Products" },
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
              ]}
              padding="px-4 py-3"
              borderRadius="rounded-lg"
              bgColor="bg-white"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-black">Product List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Colors
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Sizes
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                <TableSkeletonWithRows
                  rows={5}
                  rowComponent={ProductRowSkeleton}
                />
              </tbody>
            </table>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-6">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 4V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V4H20C20.5523 4 21 4.44772 21 5V6C21 6.55228 20.5523 7 20 7H4C3.44772 7 3 6.55228 3 6V5C3 4.44772 3.44772 4 4 4H7ZM5 9V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V9H5Z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.title || filters.categorySlug || filters.isActive === false
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first product"}
          </p>
          {!filters.title &&
            !filters.categorySlug &&
            filters.isActive === true && (
              <button
                onClick={onCreateProduct}
                className="bg-black text-white px-6 py-3 rounded-lg font-medium"
              >
                Add Product
              </button>
            )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-black">Product List</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Colors
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Sizes
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        onEditProductDetail && onEditProductDetail(product)
                      }
                      title="Click to edit product details"
                    >
                      <td className="px-6 py-4">
                        {/* Use an inline SVG data URL as a reliable placeholder to avoid missing static asset 404s */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            product.thumbnail ||
                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial, Helvetica, sans-serif" font-size="14">No image</text></svg>'
                          }
                          alt={product.title || "Product image"}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            // Only fallback once to avoid infinite loop trying to load a missing static file
                            const fallback =
                              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial, Helvetica, sans-serif" font-size="14">No image</text></svg>';
                            if (e.currentTarget.src !== fallback) {
                              e.currentTarget.src = fallback;
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.title || "No name"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.categoryId
                          ? categoryMap[product.categoryId] ??
                            product.categoryId
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {product.variantColors &&
                          product.variantColors.length > 0 ? (
                            product.variantColors
                              .slice(0, 3)
                              .map((color: VariantColor) => (
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
                          {product.variantColors &&
                            product.variantColors.length > 3 && (
                              <span className="text-xs text-gray-500 ml-1 self-center">
                                +{product.variantColors.length - 3}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {product.variantSizes &&
                          product.variantSizes.length > 0 ? (
                            product.variantSizes
                              .slice(0, 4)
                              .map((size: VariantSize) => (
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
                          {product.variantSizes &&
                            product.variantSizes.length > 4 && (
                              <span className="text-xs text-gray-500 ml-1 self-center">
                                +{product.variantSizes.length - 4}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-medium ${product.hasOutOfStock ? 'text-red-600' : 'text-gray-900'}`}>
                            {product.totalQuantity ?? 0}
                          </span>
                          {product.hasOutOfStock && (
                            <span 
                              className="relative flex h-2 w-2"
                              title="Some variants are out of stock"
                            >
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditProduct(product);
                            }}
                            className="text-black hover:text-gray-700 cursor-pointer"
                            title="Edit product information (title, description, category, colors, sizes)"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          {onCreateProductDetail && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCreateProductDetail(product);
                              }}
                              className="text-green-600 hover:text-green-800 cursor-pointer"
                              title="Add new product detail (create a specific color & size variant with price and quantity)"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onToggleProductActive) {
                                onToggleProductActive(product.id);
                              }
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                              product.isActive ? "bg-black" : "bg-gray-300"
                            }`}
                            aria-label={`Toggle status - currently ${product.isActive ? "active" : "inactive"}`}
                            title={`Click to ${product.isActive ? "deactivate" : "activate"} product`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                product.isActive ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page + 1}
              totalItems={pagination.totalItems}
              pageSize={pagination.pageSize}
              onPageChange={(page) => onPageChange(page - 1, pagination.pageSize)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ProductsPresenter;
