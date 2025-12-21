"use client";

import React, { useEffect, useCallback, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { RootState } from "../../../store";
import { CustomDropdown } from "../../../components/ui";
import {
  fetchProductsRequest,
  setFilters,
  clearError,
  toggleProductDetailStatusRequest,
  type FetchProductsRequest,
} from "../redux/productSlice";
import ProductsPresenter from "../components/ProductsPresenter";
import {
  ProductModal,
  DeleteProductModal,
} from "../../../components/modals/ProductModals";
import EditProductAdminModal from "../../../components/modals/EditProductAdminModal";
import EditProductDetailModal from "../../../components/modals/EditProductDetailModal";
import CreateProductDetailModal from "../../../components/modals/CreateProductDetailModal";
import {
  Product,
  ProductDetail,
  ProductDetailQueryResponse,
  VariantColor,
} from "../../../types/product.types";
import { productApi } from "../../../services/api/productApi";

// Interface for Excel export row data
interface ExportRowData {
  "No.": number;
  "Product ID": number;
  "Product Title": string;
  Description: string;
  Category: string;
  Color: string;
  "Color Hex": string;
  Size: string;
  "Price (VND)": string;
  "Final Price (VND)": string;
  "Discount (%)": number;
  Quantity: number;
  "Detail ID": number | string;
  "Images Count": number;
  "Image URLs": string;
  Promotion: string;
  "Created At": string;
  "Updated At": string;
}

// Interface for product info response with colors
interface ProductInfoWithColors {
  colors?: string[];
  activeSize?: string;
}

// Interface for color detail response
interface ColorDetailResponse extends ProductDetail {
  finalPrice?: number;
  percentOff?: number;
  promotionName?: string;
}
import {
  categoryApi,
  CategoryBackend,
} from "../../../services/api/categoryApi";
import { useMinimumLoadingTime } from "../../../hooks/useMinimumLoadingTime";
import { useToast } from "../../../providers/ToastProvider";

const ProductsContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { showSuccess, showWarning, showError } = useToast();

  const { products, loading, error, pagination, filters } = useSelector(
    (state: RootState) => state.product
  );

  // Track previous loading state to detect successful toggle completion
  const prevLoading = useRef(loading);

  // Use minimum loading time hook to ensure skeleton shows for at least 500ms
  const displayLoading = useMinimumLoadingTime(loading, 500);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isVariantPickerOpen, setIsVariantPickerOpen] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  ); // Add this
  const [isCreateProductDetailModalOpen, setIsCreateProductDetailModalOpen] =
    useState(false);
  const [productForDetailCreation, setProductForDetailCreation] =
    useState<Product | null>(null);
  // Track if a toggle operation is in progress
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  // type VariantListItem = {
  //   detailId: number;
  //   colorName?: string;
  //   sizeName?: string;
  //   price?: number;
  //   quantity?: number;
  // };

  // const [variantList, setVariantList] = useState<VariantListItem[]>([]);

  // New states for query-by-color/size flow
  const [productDetailQuery, setProductDetailQuery] =
    useState<ProductDetailQueryResponse | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [detailQueryDetailId, setDetailQueryDetailId] = useState<number | null>(
    null
  );
  const [detailQueryPrice, setDetailQueryPrice] = useState<number | null>(null);
  const [detailQueryQuantity, setDetailQueryQuantity] = useState<number | null>(
    null
  );

  // Export progress state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({
    current: 0,
    total: 0,
  });

  // Debounced search function
  const debouncedFetch = useCallback(
    (searchParams: FetchProductsRequest) => {
      dispatch(fetchProductsRequest(searchParams));
    },
    [dispatch]
  );

  // Show success toast when toggle operation completes successfully
  useEffect(() => {
    if (isTogglingStatus && prevLoading.current && !loading && !error) {
      showSuccess("Status Updated", "Product detail status has been updated successfully");
      setIsTogglingStatus(false);
    }
    prevLoading.current = loading;
  }, [loading, error, showSuccess, isTogglingStatus]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showError("Error", error);
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

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

  const handleSearch = useCallback(
    (searchTerm: string) => {
      dispatch(setFilters({ filters: { title: searchTerm } }));
      // Reset to first page when searching
      if (pagination.page !== 0) {
        // Page will be updated by the effect above
      }
    },
    [dispatch, pagination.page]
  );

  const handleFilterChange = useCallback(
    (newFilters: {
      title?: string;
      categorySlug?: string;
      isActive?: boolean | null;
      sortBy?: "createdAt" | "updatedAt" | "title" | "quantity";
      sortDirection?: "asc" | "desc";
    }) => {
      dispatch(setFilters({ filters: newFilters }));
    },
    [dispatch]
  );

  const handlePageChange = useCallback(
    (page: number) => {
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
    },
    [dispatch, pagination.pageSize, filters]
  );

  const handleCreateProduct = useCallback(() => {
    setSelectedProduct(null);
    setIsCreateModalOpen(true);
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  }, []);

  // Keep for variant picker modal functionality
  const handleEditVariant = useCallback(async (product: Product) => {
    try {
      // Use query-by-product/color/size endpoint to fetch available colors/sizes and the active detail
      // If the product already exposes colors/sizes, pass the first available of each to the query
      const initialColorId = product.variantColors?.[0]?.id;
      const initialSizeId = product.variantSizes?.[0]?.id;
      const res = await productApi.getProductDetailByQuery(
        product.id,
        initialColorId,
        initialSizeId
      );
      if (res.success && res.data) {
        const d = res.data;
        setProductDetailQuery(d);
        setSelectedColorId(
          d.activeColor?.id ?? d.variantColors?.[0]?.id ?? null
        );
        setSelectedSizeId(d.activeSize?.id ?? d.variantSizes?.[0]?.id ?? null);
        setDetailQueryPrice(d.price ?? null);
        setDetailQueryQuantity(d.quantity ?? null);
        setDetailQueryDetailId(d.detailId ?? null);
        setSelectedProduct(product);
        setIsVariantPickerOpen(true);
      } else {
        alert(res.message || "Failed to load product details");
      }
    } catch (error) {
      console.error("Error fetching product details for variant edit", error);
      alert("Failed to load product details");
    }
  }, []);
  // Suppress unused warning - kept for variant picker modal
  void handleEditVariant;

  const handleDeleteProduct = useCallback(
    (productId: number) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        setSelectedProduct(product);
        setIsDeleteModalOpen(true);
      }
    },
    [products]
  );

  const handleToggleProductActive = useCallback(
    async (productId: number) => {
      try {
        const res = await productApi.toggleProductAdmin(productId);
        if (res.success) {
          showSuccess(res.message || "Product status updated");
          // Refresh current page
          dispatch(
            fetchProductsRequest({
              page: pagination.page,
              pageSize: pagination.pageSize,
              title: filters.title || undefined,
              categorySlug: filters.categorySlug || undefined,
              isActive: filters.isActive ?? undefined,
              sortBy: filters.sortBy,
              sortDirection: filters.sortDirection,
            })
          );
        } else {
          showWarning(res.message || "Failed to update product status");
        }
      } catch (error) {
        console.error("Error toggling product status", error);
        showWarning("Failed to update product status");
      }
    },
    [
      dispatch,
      filters,
      pagination.page,
      pagination.pageSize,
      showSuccess,
      showWarning,
    ]
  );

  const handleEditProductDetail = useCallback((product: Product) => {
    setSelectedDetailId(product.currentDetailId);
    setSelectedProductId(product.id);
  }, []);

  const handleCreateProductDetail = useCallback(
    (product: Product) => {
      if (!product.variantColors || product.variantColors.length === 0) {
        showWarning(
          "Cannot create product detail",
          "Product must have at least one color"
        );
        return;
      }
      if (!product.variantSizes || product.variantSizes.length === 0) {
        showWarning(
          "Cannot create product detail",
          "Product must have at least one size"
        );
        return;
      }

      setProductForDetailCreation(product);
      setIsCreateProductDetailModalOpen(true);
    },
    [showWarning]
  );

  const handleConfirmCreateProductDetail = useCallback(
    async (data: {
      productId: number;
      formData: FormData;
    }) => {
      try {
        const response = await (await import("@/services/api/productApi")).productApi.createProductDetailAdmin(
          data.productId,
          data.formData
        );
        
        if (response.success) {
          showSuccess("Product detail created successfully!");
          // Refresh product list with current filters
          dispatch(fetchProductsRequest({
            page: pagination.page,
            pageSize: pagination.pageSize,
            title: filters.title || undefined,
            categorySlug: filters.categorySlug || undefined,
            isActive: filters.isActive ?? undefined,
            sortBy: filters.sortBy,
            sortDirection: filters.sortDirection,
          }));
          setIsCreateProductDetailModalOpen(false);
          setProductForDetailCreation(null);
        } else {
          showError(response.message || "Failed to create product detail");
        }
      } catch (error) {
        showError(error instanceof Error ? error.message : "Failed to create product detail");
      }
    },
    [dispatch, showSuccess, showError, pagination.page, pagination.pageSize, filters]
  );

  const handleToggleProductDetailStatus = useCallback(
    (productDetailId: number) => {
      setIsTogglingStatus(true);
      dispatch(toggleProductDetailStatusRequest({ productDetailId }));
    },
    [dispatch]
  );

  const handleExportExcel = useCallback(async () => {
    try {
      setIsExporting(true);
      setExportProgress({ current: 0, total: 1 });

      // Fetch ALL products by fetching all pages (pageSize max is 100)
      const allProducts: Product[] = [];
      let currentPage = 0;
      const pageSize = 100;
      let hasMore = true;

      while (hasMore) {
        const pageRes = await productApi.getAllProducts({
          page: currentPage,
          pageSize: pageSize,
          title: filters.title || undefined,
          categorySlug: filters.categorySlug || undefined,
          isActive: filters.isActive ?? undefined,
          sortBy: filters.sortBy,
          sortDirection: filters.sortDirection,
        });

        if (!pageRes.success || !pageRes.data) {
          showWarning(
            "Export failed",
            `Failed to fetch products: ${pageRes.message || "Unknown error"}`
          );
          setIsExporting(false);
          return;
        }

        const items = Array.isArray(pageRes.data)
          ? pageRes.data
          : pageRes.data.items || [];

        if (items.length === 0) {
          break;
        }

        allProducts.push(...items);

        // Check if there are more pages
        if (Array.isArray(pageRes.data)) {
          hasMore = items.length === pageSize;
        } else {
          hasMore = pageRes.data.hasNext || false;
        }

        currentPage++;
      }

      if (allProducts.length === 0) {
        showWarning("No data to export", "There are no products to export.");
        setIsExporting(false);
        return;
      }

      setExportProgress({ current: 0, total: allProducts.length });

      // Fetch category tree for mapping category IDs to names (leaf only)
      const categoryRes = await categoryApi.getTree();
      const categoryMap = new Map<number, string>();

      if (categoryRes.success && categoryRes.data) {
        const flattenCategories = (categories: CategoryBackend[]): void => {
          categories.forEach((cat) => {
            categoryMap.set(cat.id, cat.name); // Only store the leaf name
            if (cat.children && cat.children.length > 0) {
              flattenCategories(cat.children);
            }
          });
        };
        flattenCategories(categoryRes.data);
      }

      // Fetch product details for all products
      const allDetails: ExportRowData[] = [];

      for (let i = 0; i < allProducts.length; i++) {
        const product = allProducts[i];
        setExportProgress({ current: i + 1, total: allProducts.length });

        try {
          // Step 1: Get product info with all colors
          const productDetailRes = await productApi.getProductByIdPublic(
            product.id.toString()
          );

          if (!productDetailRes.success || !productDetailRes.data) {
            console.error(
              `Failed to load product info for product ${product.id}`
            );
            continue;
          }

          const productInfo = productDetailRes.data as ProductInfoWithColors;
          const colors = productInfo.colors || [];

          // Step 2: For each color, get color-specific details with mapSizeToQuantity
          for (const colorName of colors) {
            try {
              const colorDetailRes = await productApi.getProductByColorPublic(
                productDetailRes.data.detailId.toString(),
                colorName,
                undefined // No specific size - get all sizes in mapSizeToQuantity
              );

              if (!colorDetailRes.success || !colorDetailRes.data) {
                console.error(
                  `Failed to load detail for product ${product.id}, color ${colorName}`
                );
                continue;
              }

              const colorDetail = colorDetailRes.data as ColorDetailResponse;
              const mapSizeToQuantity = colorDetail.mapSizeToQuantity || {};

              // Get color hex from variantColors in the original product
              const colorObj = product.variantColors?.find(
                (c: VariantColor) => c.name === colorName
              );
              const colorHex = colorObj?.hex || "N/A";

              // Get image URLs
              const imageUrls = colorDetail.images?.join("\n") || "N/A";

              // Get category name from map
              const categoryName =
                categoryMap.get(product.categoryId) ||
                `Category ${product.categoryId}`;

              // Step 3: Parse mapSizeToQuantity to create rows for each size
              const sizes = Object.keys(mapSizeToQuantity);

              if (sizes.length > 0) {
                for (const sizeName of sizes) {
                  const quantity = mapSizeToQuantity[sizeName];

                  allDetails.push({
                    "No.": allDetails.length + 1,
                    "Product ID": product.id,
                    "Product Title": colorDetail.title || product.title,
                    Description: product.description || "N/A",
                    Category: categoryName,
                    Color: colorName,
                    "Color Hex": colorHex,
                    Size: sizeName,
                    "Price (VND)":
                      colorDetail.price?.toLocaleString("en-US") || "N/A",
                    "Final Price (VND)":
                      colorDetail.finalPrice?.toLocaleString("en-US") || "N/A",
                    "Discount (%)": colorDetail.percentOff || 0,
                    Quantity: quantity || 0,
                    "Detail ID": colorDetail.detailId || "N/A",
                    "Images Count": colorDetail.images?.length || 0,
                    "Image URLs": imageUrls,
                    Promotion: colorDetail.promotionName || "N/A",
                    "Created At": product.createdAt
                      ? new Date(product.createdAt).toLocaleDateString("en-US")
                      : "N/A",
                    "Updated At": product.updatedAt
                      ? new Date(product.updatedAt).toLocaleDateString("en-US")
                      : "N/A",
                  });
                }
              } else {
                // No sizes in mapSizeToQuantity, add a single row for color
                allDetails.push({
                  "No.": allDetails.length + 1,
                  "Product ID": product.id,
                  "Product Title": colorDetail.title || product.title,
                  Description: product.description || "N/A",
                  Category: categoryName,
                  Color: colorName,
                  "Color Hex": colorHex,
                  Size: "N/A",
                  "Price (VND)":
                    colorDetail.price?.toLocaleString("en-US") || "N/A",
                  "Final Price (VND)":
                    colorDetail.finalPrice?.toLocaleString("en-US") || "N/A",
                  "Discount (%)": colorDetail.percentOff || 0,
                  Quantity: 0,
                  "Detail ID": colorDetail.detailId || "N/A",
                  "Images Count": colorDetail.images?.length || 0,
                  "Image URLs": imageUrls,
                  Promotion: colorDetail.promotionName || "N/A",
                  "Created At": product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString("en-US")
                    : "N/A",
                  "Updated At": product.updatedAt
                    ? new Date(product.updatedAt).toLocaleDateString("en-US")
                    : "N/A",
                });
              }
            } catch (error) {
              console.error(
                `Error fetching color ${colorName} for product ${product.id}:`,
                error
              );
            }
          }
        } catch (error) {
          console.error(
            `Error fetching details for product ${product.id}:`,
            error
          );
        }
      }

      if (allDetails.length === 0) {
        showWarning("No data to export", "Could not fetch product details.");
        return;
      }

      const exportData = allDetails;

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([]);

      // Column widths - updated for new columns (18 total)
      const colWidths = [
        { wch: 6 }, // No.
        { wch: 12 }, // Product ID
        { wch: 35 }, // Product Title
        { wch: 40 }, // Description
        { wch: 25 }, // Category (changed from Category ID)
        { wch: 20 }, // Color
        { wch: 12 }, // Color Hex
        { wch: 10 }, // Size
        { wch: 18 }, // Price (VND)
        { wch: 18 }, // Final Price (VND)
        { wch: 12 }, // Discount (%)
        { wch: 10 }, // Quantity
        { wch: 12 }, // Detail ID
        { wch: 12 }, // Images Count
        { wch: 80 }, // Image URLs
        { wch: 25 }, // Promotion
        { wch: 15 }, // Created At
        { wch: 15 }, // Updated At
      ];
      ws["!cols"] = colWidths;

      // Add header
      XLSX.utils.sheet_add_aoa(
        ws,
        [
          ["FASHION ECOMMERCE ADMIN"],
          ["PRODUCT DETAILS REPORT"],
          [`Export date: ${new Date().toLocaleDateString("en-US")}`],
          [`Total product variants: ${exportData.length}`],
          [
            `Filters: ${filters.title ? `Search: ${filters.title}` : ""}${
              filters.categorySlug ? ` Category: ${filters.categorySlug}` : ""
            }${
              filters.isActive !== null && filters.isActive !== undefined
                ? ` Status: ${filters.isActive ? "Active" : "Inactive"}`
                : ""
            }`,
          ],
          [""],
        ],
        { origin: "A1" }
      );

      // Add column headers
      const headers = Object.keys(exportData[0]);
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A7" });

      // Add data
      exportData.forEach((row, index) => {
        const rowData = headers.map(
          (header) => row[header as keyof typeof row]
        );
        XLSX.utils.sheet_add_aoa(ws, [rowData], { origin: `A${8 + index}` });
      });

      // Styling - using object structure for cell styles
      const titleStyle = {
        font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "312E81" } },
        alignment: { horizontal: "center", vertical: "center" },
      };

      const headerStyle = {
        font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F46E5" } },
        alignment: { horizontal: "center", vertical: "center" },
      };

      const columnHeaderStyle = {
        font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "059669" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };

      // Apply styles to title row - updated for 18 columns (A-R)
      const columnLetters = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
      ];
      columnLetters.forEach((col) => {
        const cell = col + "1";
        if (!ws[cell]) ws[cell] = {};
        ws[cell].s = titleStyle;
      });

      // Apply styles to header rows (2-5)
      for (let row = 2; row <= 5; row++) {
        columnLetters.forEach((col) => {
          const cellRef = col + row;
          if (!ws[cellRef]) ws[cellRef] = {};
          ws[cellRef].s = headerStyle;
        });
      }

      // Apply styles to column headers (row 7)
      headers.forEach((_, index) => {
        const cellRef = String.fromCharCode(65 + index) + "7";
        if (!ws[cellRef]) ws[cellRef] = {};
        ws[cellRef].s = columnHeaderStyle;
      });

      // Merge cells for headers - updated for 18 columns (0-17)
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 17 } }, // Title
        { s: { r: 1, c: 0 }, e: { r: 1, c: 17 } }, // Subtitle
        { s: { r: 2, c: 0 }, e: { r: 2, c: 17 } }, // Export date
        { s: { r: 3, c: 0 }, e: { r: 3, c: 17 } }, // Total
        { s: { r: 4, c: 0 }, e: { r: 4, c: 17 } }, // Filters
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Product Details");
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `product_details_${new Date().getTime()}.xlsx`);

      showSuccess(
        "Export successful",
        "Product details have been exported to Excel."
      );
    } catch (error) {
      console.error("Error exporting Excel:", error);
      showWarning("Export failed", "Failed to export products to Excel.");
    } finally {
      setIsExporting(false);
      setExportProgress({ current: 0, total: 0 });
    }
  }, [filters, showSuccess, showWarning]);

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
        onDeleteProduct={handleDeleteProduct}
        onToggleProductActive={handleToggleProductActive}
        onExportExcel={handleExportExcel}
        onClearError={handleClearError}
        onEditProductDetail={handleEditProductDetail}
        onCreateProductDetail={handleCreateProductDetail}
        onToggleProductDetailStatus={handleToggleProductDetailStatus}
      />

      {/* Export Progress Modal */}
      {isExporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 backdrop-blur-sm bg-black/20" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="animate-spin h-12 w-12 mx-auto text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Exporting to Excel...
              </h3>
              <p className="text-gray-600 mb-4">
                Processing product {exportProgress.current} of{" "}
                {exportProgress.total}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-black h-full transition-all duration-300 ease-out"
                  style={{
                    width: `${
                      (exportProgress.current / exportProgress.total) * 100
                    }%`,
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {Math.round(
                  (exportProgress.current / exportProgress.total) * 100
                )}
                % complete
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductModal isOpen={isCreateModalOpen} onClose={handleCloseModals} />

      {/* Edit (admin JSON) modal */}
      <EditProductAdminModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        productId={selectedProduct?.id ?? 0}
        initial={{
          title: selectedProduct?.title ?? undefined,
          description: selectedProduct?.description ?? undefined,
          categoryIds: selectedProduct
            ? [selectedProduct.categoryId]
            : undefined,
        }}
      />

      {/* Variant picker modal - simple list to choose which product detail to edit */}
      {isVariantPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black/20"
            onClick={() => setIsVariantPickerOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-auto">
            <div className="bg-black px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Select Variant to Edit
              </h3>
              <button
                onClick={() => setIsVariantPickerOpen(false)}
                className="text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              {/* New: select color and size; call query endpoint when selection changes */}
              {productDetailQuery ? (
                <div className="space-y-4 text-black">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Color
                    </label>
                    <CustomDropdown
                      value={selectedColorId?.toString() ?? ""}
                      onChange={async (value) => {
                        const newColorId = value ? Number(value) : null;
                        setSelectedColorId(newColorId);
                        try {
                          const q = await productApi.getProductDetailByQuery(
                            selectedProduct?.id ?? 0,
                            newColorId ?? undefined,
                            selectedSizeId ?? undefined
                          );
                          if (q.success && q.data) {
                            setProductDetailQuery(q.data);
                            setDetailQueryPrice(q.data.price ?? null);
                            setDetailQueryQuantity(q.data.quantity ?? null);
                            setDetailQueryDetailId(q.data.detailId ?? null);
                          }
                        } catch (err) {
                          console.error(
                            "Error querying detail on color change",
                            err
                          );
                        }
                      }}
                      options={[
                        { value: "", label: "-- Select color --" },
                        ...(productDetailQuery.variantColors?.map((c) => ({
                          value: c.id.toString(),
                          label: c.name,
                        })) ?? []),
                      ]}
                      padding="p-2"
                      borderRadius="rounded-md"
                      bgColor="bg-white"
                      className="mt-1 block w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Size
                    </label>
                    <CustomDropdown
                      value={selectedSizeId?.toString() ?? ""}
                      onChange={async (value) => {
                        const newSizeId = value ? Number(value) : null;
                        setSelectedSizeId(newSizeId);
                        try {
                          const q = await productApi.getProductDetailByQuery(
                            selectedProduct?.id ?? 0,
                            selectedColorId ?? undefined,
                            newSizeId ?? undefined
                          );
                          if (q.success && q.data) {
                            setProductDetailQuery(q.data);
                            setDetailQueryPrice(q.data.price ?? null);
                            setDetailQueryQuantity(q.data.quantity ?? null);
                            setDetailQueryDetailId(q.data.detailId ?? null);
                          }
                        } catch (err) {
                          console.error(
                            "Error querying detail on size change",
                            err
                          );
                        }
                      }}
                      options={[
                        { value: "", label: "-- Select size --" },
                        ...(productDetailQuery.variantSizes?.map((s) => ({
                          value: s.id.toString(),
                          label: s.code,
                        })) ?? []),
                      ]}
                      padding="p-2"
                      borderRadius="rounded-md"
                      bgColor="bg-white"
                      className="mt-1 block w-full"
                    />
                  </div>

                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">
                        Price (VND)
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded-md p-2"
                        value={detailQueryPrice ?? ""}
                        onChange={(e) =>
                          setDetailQueryPrice(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </div>
                    <div className="w-36">
                      <label className="block text-sm font-medium mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded-md p-2"
                        value={detailQueryQuantity ?? ""}
                        onChange={(e) =>
                          setDetailQueryQuantity(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsVariantPickerOpen(false)}
                      className="px-4 py-2 border rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!detailQueryDetailId) {
                          alert(
                            "Cannot update: missing detail id for this color+size"
                          );
                          return;
                        }
                        try {
                          const body = {
                            colorId: selectedColorId ?? undefined,
                            sizeId: selectedSizeId ?? undefined,
                            price: detailQueryPrice ?? undefined,
                            quantity: detailQueryQuantity ?? undefined,
                          };
                          const upd = await productApi.updateProductDetailAdmin(
                            detailQueryDetailId,
                            body
                          );
                          if (upd.success) {
                            // Refresh products list with current filters
                            dispatch(
                              fetchProductsRequest({
                                page: pagination.page,
                                pageSize: pagination.pageSize,
                                title: filters.title || undefined,
                                categorySlug: filters.categorySlug || undefined,
                                isActive: filters.isActive ?? undefined,
                                sortBy: filters.sortBy,
                                sortDirection: filters.sortDirection,
                              })
                            );
                            setIsVariantPickerOpen(false);
                            setSelectedDetailId(null);
                          } else {
                            alert(upd.message || "Failed to update");
                          }
                        } catch (err) {
                          console.error("Error updating product detail", err);
                          alert("Failed to update product detail");
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
          // After successful update, refresh product list with current filters
          dispatch(
            fetchProductsRequest({
              page: pagination.page,
              pageSize: pagination.pageSize,
              title: filters.title || undefined,
              categorySlug: filters.categorySlug || undefined,
              isActive: filters.isActive ?? undefined,
              sortBy: filters.sortBy,
              sortDirection: filters.sortDirection,
            })
          );
          setSelectedDetailId(null);
          setSelectedProductId(null);
        }}
      />

      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        product={selectedProduct}
      />

      <CreateProductDetailModal
        isOpen={isCreateProductDetailModalOpen}
        onClose={() => {
          setIsCreateProductDetailModalOpen(false);
          setProductForDetailCreation(null);
        }}
        product={productForDetailCreation}
        onConfirm={handleConfirmCreateProductDetail}
      />
    </>
  );
};

export default ProductsContainer;
