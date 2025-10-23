"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/providers/ToastProvider";
import {
  Product,
  ProductFormData,
  VariantColor,
  VariantSize,
  ProductDetail,
} from "@/types/product.types";
import { categoryApi, CategoryBackend } from "@/services/api/categoryApi";
import {
  // use direct success action when delete completes
  deleteProductSuccess,
  // uploadImageRequest,
  createProductSuccess,
} from "@/features/products/redux/productSlice";
import { fetchProductsSilentRequest } from '@/features/products/redux/productSlice';
import { RootState } from '@/store';
import { productApi } from "@/services/api/productApi";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ProductModalProps = BaseModalProps;

interface DeleteProductModalProps extends BaseModalProps {
  product?: Product | null;
}

// Mock data for available variants - in real app, this would come from API
const AVAILABLE_COLORS: VariantColor[] = [
  { id: 1, name: "black", hex: "#2c2d31" },
  { id: 2, name: "white", hex: "#d6d8d3" },
  { id: 3, name: "dark blue", hex: "#14202e" },
  { id: 4, name: "red", hex: "#dc2626" },
  { id: 5, name: "pink", hex: "#d4a2bb" },
  { id: 6, name: "green", hex: "#16a34a" },
  { id: 7, name: "mint", hex: "#60a1a7" },
  { id: 8, name: "brown", hex: "#624e4f" },
  { id: 9, name: "yellow", hex: "#dac7a7" },
];

const AVAILABLE_SIZES: VariantSize[] = [
  { id: 1, code: "S", label: "S" },
  { id: 2, code: "M", label: "M" },
  { id: 3, code: "L", label: "L" },
  { id: 4, code: "XL", label: "XL" },
  { id: 5, code: "XXL", label: "XXL" },
];

// Base Modal Component
const Modal: React.FC<
  BaseModalProps & { children: React.ReactNode; title: string }
> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-[80em] max-h-[100vh] overflow-hidden animate-fadeInUp`}
      >
        {/* Header */}
        <div className="bg-black px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none focus:text-gray-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Create/Edit Product Modal
export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { pagination, filters } = useSelector((s: RootState) => s.product);
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageUploading] = useState(false);
  const [categories, setCategories] = useState<CategoryBackend[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryLabels, setCategoryLabels] = useState<Record<number, string>>({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    thumbnail: "",
    categoryId: 1,
    productDetails: [],
  });

  // Keep actual File objects for each colorId so we can append them to FormData
  const [detailFiles, setDetailFiles] = useState<Record<number, File[]>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load categories using tree endpoint and build leaf labels (like EditProductAdminModal)
  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await categoryApi.getTree();
      if (res.success && res.data && Array.isArray(res.data)) {
        const items: CategoryBackend[] = res.data as CategoryBackend[];

        const leafItemsWithLabels: Array<{ node: CategoryBackend; label: string }> = [];
        const traverse = (nodes: CategoryBackend[] = [], parents: string[] = []) => {
          for (const n of nodes) {
            const currentPath = [...parents, n.name];
            const isLeaf = n.children === null || (Array.isArray(n.children) && n.children.length === 0);
            if (isLeaf) {
              leafItemsWithLabels.push({ node: n, label: currentPath.join(' > ') });
            } else if (Array.isArray(n.children) && n.children.length > 0) {
              traverse(n.children, currentPath);
            }
          }
        };
        traverse(items);

        const leafItems = leafItemsWithLabels.map((x) => x.node);
        const labelsMap: Record<number, string> = {};
        for (const it of leafItemsWithLabels) labelsMap[it.node.id] = it.label;

        setCategories(leafItems);
        setCategoryLabels(labelsMap);

        // if no category selected yet, choose first leaf
        setFormData((prev) => ({
          ...prev,
          categoryId: prev.categoryId || (leafItems.length > 0 ? leafItems[0].id : prev.categoryId),
        }));
      } else {
        showError("Failed to load categories");
      }
    } catch {
      showError("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  }, [showError]);

  // Load categories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen, loadCategories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (dropdownOpen && !target.closest(".category-dropdown")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Helper function to ensure productDetail has images array
  const normalizeProductDetail = (productDetail: Partial<ProductDetail>): ProductDetail => {
    return {
      ...productDetail,
      color: productDetail.color as VariantColor,
      sizes: Array.isArray(productDetail.sizes) ? (productDetail.sizes as number[]) : [],
      images: Array.isArray(productDetail.images)
        ? (productDetail.images as string[])
        : [],
      price: typeof productDetail.price === 'number' ? productDetail.price : 0,
      quantity: typeof productDetail.quantity === 'number' ? productDetail.quantity : 0,
      sizeVariants: Array.isArray(productDetail.sizeVariants) ? (productDetail.sizeVariants as ProductDetail['sizeVariants']) : undefined,
    } as ProductDetail;
  };

  useEffect(() => {
    // Initialize form for creating a new product
    setFormData({
      title: "",
      description: "",
      thumbnail: "",
      categoryId: categories.length > 0 ? categories[0].id : 1,
      productDetails: [],
    });
    setErrors({});
    setHasSubmitted(false);
  }, [isOpen, categories]);

  // Normalize productDetails to ensure they have images array
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      productDetails: prev.productDetails.map((productDetail) =>
        normalizeProductDetail(productDetail)
      ),
    }));
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Product title is required";
    }

    if (formData.title.length > 500) {
      newErrors.title = "Product title must be 500 characters or less";
    }

    if (formData.productDetails.length === 0) {
      newErrors.productDetails = "At least one product detail must be created";
    } else {
      // Validate each product detail structure more strictly
      formData.productDetails.forEach((pd) => {
        if (!pd.color || typeof pd.color.id !== "number") {
          newErrors.productDetails =
            "Each product detail must have a valid color";
        }

        if (!Array.isArray(pd.sizes) || pd.sizes.length === 0) {
          newErrors.productDetails =
            "Each color productDetail must have at least one size";
        }

        // If per-size variants exist, validate them. Otherwise validate color-level price/quantity.
        if (Array.isArray(pd.sizeVariants) && pd.sizeVariants.length > 0) {
          // Ensure each variant has a positive price and a non-negative integer quantity
          const invalidVariant = pd.sizeVariants.some((v) => {
            const badPrice = typeof v.price !== "number" || isNaN(v.price) || v.price <= 0;
            const badQty = !Number.isInteger(v.quantity) || v.quantity < 0;
            return badPrice || badQty;
          });
          if (invalidVariant) {
            newErrors.productDetails =
              "Each size variant must have a valid price (> 0) and quantity (integer >= 0)";
          }
        } else {
          // price must be a positive number (can be decimal)
          if (typeof pd.price !== "number" || isNaN(pd.price) || pd.price <= 0) {
            newErrors.productDetails =
              "Each color productDetail must have a valid price";
          }

          // quantity must be integer >= 0
          if (!Number.isInteger(pd.quantity) || pd.quantity < 0) {
            newErrors.productDetails =
              "Each color productDetail must have a valid quantity (integer >= 0)";
          }
        }

        // validate files count if any files tracked
        const filesForColor = detailFiles[pd.color.id] || [];
        if (filesForColor.length > 5) {
          newErrors.productDetails =
            "Maximum 5 images allowed per color variant";
        }
      });

      // Check if all productDetails have at least one size
      const hasIncompleteProductDetails = formData.productDetails.some(
        (productDetail) => productDetail.sizes.length === 0
      );
      if (hasIncompleteProductDetails) {
        newErrors.productDetails =
          "Each color productDetail must have at least one size";
      }

      // Check if all productDetails have images. A global thumbnail also satisfies this requirement.
      const hasProductDetailWithoutImage = formData.productDetails.some(
        (productDetail) =>
          (!productDetail.images || productDetail.images.length === 0) &&
          !formData.thumbnail
      );
      if (hasProductDetailWithoutImage) {
        newErrors.productDetails =
          "Each color productDetail must have at least one image";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Build the product JSON according to required schema
      // Product must include title (<=500 chars), non-empty categoryIds, and productDetails with colorId and sizeVariants
      const productJson: {
        title: string;
        description?: string;
        categoryIds: number[];
        productDetails: Array<{ colorId: number; sizeVariants: Array<{ sizeId: number; price: number; quantity: number }> }>;
      } = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        categoryIds: [formData.categoryId],
        productDetails: formData.productDetails.map((pd) => ({
          colorId: pd.color.id,
          sizeVariants:
            pd.sizeVariants && pd.sizeVariants.length > 0
              ? pd.sizeVariants.map((v) => ({
                  sizeId: v.sizeId,
                  price: v.price,
                  quantity: v.quantity,
                }))
              : pd.sizes.map((sizeId) => ({
                  sizeId,
                  price: pd.price,
                  quantity: pd.quantity,
                })),
        })),
      };

      // Final validation before sending
      if (
        !productJson.title ||
        productJson.title.length === 0 ||
        productJson.title.length > 500
      ) {
        throw new Error(
          "Product title is required and must be 500 characters or less"
        );
      }
      if (
        !Array.isArray(productJson.categoryIds) ||
        productJson.categoryIds.length === 0
      ) {
        throw new Error("At least one categoryId is required");
      }
      if (
        !Array.isArray(productJson.productDetails) ||
        productJson.productDetails.length === 0
      ) {
        throw new Error(
          "At least one product detail (color variant) is required"
        );
      }

      // Build FormData
      const fd = new FormData();
      // Append the product JSON as an application/json Blob so the multipart part
      // has Content-Type: application/json which Spring's @RequestPart can bind reliably.
      const productBlob = new Blob([JSON.stringify(productJson)], {
        type: "application/json",
      });
      fd.append("product", productBlob);

      // Append images for each color under keys detail_<colorId>
      for (const pd of formData.productDetails) {
        const filesForColor = detailFiles[pd.color.id] || [];
        if (filesForColor.length > 5) {
          throw new Error(
            `No more than 5 images allowed for color ${pd.color.id}`
          );
        }

        filesForColor.forEach((file) => {
          fd.append(`detail_${pd.color.id}`, file);
        });
      }

      // Use centralized productApi which will forward FormData to adminApiClient (which supports FormData)
      // Create product only
      const resp = await (await import("@/services/api/productApi")).productApi.createProduct(fd);
      if (!resp.success) throw new Error(resp.message || "Failed to create product");

      // If API returned created product, try to fetch full product from server
      if (resp.data && 'id' in resp.data && typeof resp.data.id === 'number') {
        const createdId = resp.data.id;
        try {
          const full = await productApi.getProductById(createdId);
          if (full.success && full.data) {
            dispatch(createProductSuccess({ product: full.data }));
          } else {
            dispatch(createProductSuccess({ product: resp.data as Product }));
          }
        } catch {
    dispatch(createProductSuccess({ product: resp.data as Product }));
        }
      } else if (resp.data) {
  dispatch(createProductSuccess({ product: resp.data as Product }));
      }

      // Silent re-fetch to refresh list/page counts without showing global loading
      try {
        dispatch(fetchProductsSilentRequest({
          page: pagination.page,
          pageSize: pagination.pageSize,
          title: filters.title || undefined,
          categorySlug: filters.categorySlug || undefined,
          isActive: filters.isActive ?? undefined,
          sortBy: filters.sortBy,
          sortDirection: filters.sortDirection,
        }));
      } catch {
        // ignore
      }

      showSuccess("Product created successfully!");

      onClose();
    } catch (error) {
      showError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   // Validate file type
  //   if (!file.type.startsWith("image/")) {
  //     showError("Please select a valid image file");
  //     return;
  //   }

  //   // Validate file size (max 5MB)
  //   if (file.size > 5 * 1024 * 1024) {
  //     showError("Image size should be less than 5MB");
  //     return;
  //   }

  //   setImageUploading(true);

  //   try {
  //     // For now, create a mock URL. In real app, upload to server
  //     const mockUrl = URL.createObjectURL(file);
  //     setFormData((prev) => ({ ...prev, thumbnail: mockUrl }));

  //     // Dispatch the upload action (for future integration)
  //     dispatch(uploadImageRequest({ file }));

  //     showSuccess("Image uploaded successfully!");
  //   } catch {
  //     showError("Failed to upload image");
  //   } finally {
  //     setImageUploading(false);
  //   }
  // };

  const handleAddColorProductDetail = (color: VariantColor) => {
    const existingProductDetail = formData.productDetails.find(
      (detail) => detail.color.id === color.id
    );
    if (existingProductDetail) return; // Color already exists

    const newProductDetail: ProductDetail = {
      color,
      sizes: [],
      images: [],
      price: 0,
      quantity: 0,
    };

    setFormData((prev) => ({
      ...prev,
      productDetails: [...prev.productDetails, newProductDetail],
    }));
  };

  const handleRemoveColorProductDetail = (colorId: number) => {
    setFormData((prev) => ({
      ...prev,
      productDetails: prev.productDetails.filter(
        (detail) => detail.color.id !== colorId
      ),
    }));
  };

  const handleToggleSize = (colorId: number, sizeId: number) => {
    setFormData((prev) => ({
      ...prev,
      productDetails: prev.productDetails.map((productDetail) => {
        if (productDetail.color.id === colorId) {
          const sizeExists = productDetail.sizes.includes(sizeId);
          const newSizes = sizeExists
            ? productDetail.sizes.filter((id) => id !== sizeId)
            : [...productDetail.sizes, sizeId];

          // Also update sizeVariants: remove or add default variant entry
          let newSizeVariants = productDetail.sizeVariants
            ? [...productDetail.sizeVariants]
            : [];
          if (sizeExists) {
            newSizeVariants = newSizeVariants.filter(
              (sv) => sv.sizeId !== sizeId
            );
          } else {
            // Add default sizeVariant using color-level price/quantity as defaults
            newSizeVariants.push({
              sizeId,
              price: productDetail.price || 0,
              quantity: productDetail.quantity || 0,
            });
          }

          return {
            ...productDetail,
            sizes: newSizes,
            sizeVariants: newSizeVariants,
          };
        }
        return productDetail;
      }),
    }));
  };

  const handleSizeVariantChange = (
    colorId: number,
    sizeId: number,
    field: "price" | "quantity",
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      productDetails: prev.productDetails.map((productDetail) => {
        if (productDetail.color.id === colorId) {
          const variants = (productDetail.sizeVariants || []).map((v) => {
            if (v.sizeId === sizeId) {
              return {
                ...v,
                [field]:
                  field === "quantity"
                    ? Math.max(0, Math.floor(value))
                    : Math.max(0, value),
              };
            }
            return v;
          });
          return { ...productDetail, sizeVariants: variants };
        }
        return productDetail;
      }),
    }));
  };

  const handleProductDetailImageUpload = async (
    colorId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Find the current productDetail
    const currentProductDetail = formData.productDetails.find(
      (detail) => detail.color.id === colorId
    );
    if (!currentProductDetail) return;

    const existingImages = currentProductDetail.images || [];
    const existingFiles = detailFiles[colorId] || [];

    // Convert FileList to array and validate each
    const incomingFiles: File[] = Array.from(files);
    // Ensure total files won't exceed 5
    if (
      existingFiles.length + incomingFiles.length > 5 ||
      existingImages.length + incomingFiles.length > 5
    ) {
      showError("Maximum 5 images allowed per color productDetail");
      return;
    }

    const validFiles: File[] = [];
    const previewUrls: string[] = [];

    for (const file of incomingFiles) {
      if (!file.type.startsWith("image/")) {
        showError("Please select only image files");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showError("Each image must be less than 5MB");
        return;
      }

      validFiles.push(file);
      previewUrls.push(URL.createObjectURL(file));
    }

    // Append files to detailFiles state
    setDetailFiles((prev) => ({
      ...prev,
      [colorId]: [...existingFiles, ...validFiles],
    }));

    // Append preview urls to productDetail.images so UI shows previews
    setFormData((prev) => ({
      ...prev,
      productDetails: prev.productDetails.map((productDetail) => {
        if (productDetail.color.id === colorId) {
          const currentImages = productDetail.images || [];
          return {
            ...productDetail,
            images: [...currentImages, ...previewUrls],
          };
        }
        return productDetail;
      }),
    }));

    showSuccess("Product detail image(s) added");
  };

  const handleRemoveProductDetailImage = (
    colorId: number,
    imageIndex: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      productDetails: prev.productDetails.map((productDetail) => {
        if (productDetail.color.id === colorId) {
          const currentImages = productDetail.images || [];
          return {
            ...productDetail,
            images: currentImages.filter((_, index) => index !== imageIndex),
          };
        }
        return productDetail;
      }),
    }));

    // Also remove corresponding File object if exists
    setDetailFiles((prev) => {
      const filesForColor = prev[colorId] || [];
      if (!filesForColor.length) return prev;
      const newFiles = filesForColor.filter((_, idx) => idx !== imageIndex);
      return { ...prev, [colorId]: newFiles };
    });
  };

  // const handleProductDetailPriceChange = (colorId: number, price: number) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     productDetails: prev.productDetails.map((productDetail) => {
  //       if (productDetail.color.id === colorId) {
  //         return { ...productDetail, price: Math.max(0, price) };
  //       }
  //       return productDetail;
  //     }),
  //   }));
  // };

  // const handleProductDetailQuantityChange = (
  //   colorId: number,
  //   quantity: number
  // ) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     productDetails: prev.productDetails.map((productDetail) => {
  //       if (productDetail.color.id === colorId) {
  //         return {
  //           ...productDetail,
  //           quantity: Math.max(0, Math.floor(quantity)),
  //         };
  //       }
  //       return productDetail;
  //     }),
  //   }));
  // };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={"Create New Product"}>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Product Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-black mb-2"
          >
            Product Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className={`w-full px-3 py-2 border rounded-lg text-black ${
              errors.title ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Enter product title..."
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title}</p>
          )}
        </div>

        {/* Product Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-black mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg "
            placeholder="Enter product description..."
          />
        </div>

        {/* Category */}
        <div className="relative category-dropdown">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-black mb-2"
          >
            Category
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-left bg-white focus:ring-1 focus:ring-black focus:border-black flex items-center justify-between"
              disabled={categoriesLoading}
            >
              <span>
                {categoriesLoading
                  ? "Loading categories..."
                  : categories.find((c) => c.id === formData.categoryId)
                      ?.name || "Select category"}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {dropdownOpen && !categoriesLoading && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto scrollbar-hide">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          categoryId: category.id,
                        }));
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-black text-left hover:bg-gray-200 hover:text-black first:rounded-t-lg last:rounded-b-lg ${
                        formData.categoryId === category.id
                          ? "bg-black text-white font-medium"
                          : ""
                      }`}
                    >
                      {categoryLabels[category.id] ?? category.name}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">
                    No categories available
                  </div>
                )}
              </div>
            )}
          </div>
          {categoriesLoading && (
            <p className="text-sm text-gray-500 mt-1">Loading categories...</p>
          )}
        </div>

        {/* Product Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Details <span className="text-red-500">*</span>
          </label>

          {/* Add Color Section */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              Add Colors:
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_COLORS.map((color) => {
                const isSelected = formData.productDetails.some(
                  (detail) => detail.color.id === color.id
                );
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        handleRemoveColorProductDetail(color.id);
                      } else {
                        handleAddColorProductDetail(color);
                      }
                    }}
                    className={`flex items-center p-2 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "border-black bg-gray-100"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-sm text-black capitalize">
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Detail Management */}
          <div className="space-y-4 text-black">
            {formData.productDetails.map((productDetail) => (
              <div
                key={productDetail.color.id}
                className="border rounded-lg p-4 bg-gray-50"
              >
                {/* Product Detail Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300 mr-3"
                      style={{ backgroundColor: productDetail.color.hex }}
                    />
                    <span className="font-medium capitalize">
                      {productDetail.color.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveColorProductDetail(productDetail.color.id)
                    }
                    className="text-red-500 hover:text-red-700"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Image Upload */}
                <div className="mb-3">
                  {/* Display existing images */}
                  {productDetail.images && productDetail.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {productDetail.images.map((image, index) => (
                        <div key={index} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image}
                            alt={`${productDetail.color.name} productDetail ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveProductDetailImage(
                                productDetail.color.id,
                                index
                              )
                            }
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button */}
                  {(!productDetail.images ||
                    productDetail.images.length < 5) && (
                    <div>
                      <label className="inline-block bg-black text-white px-3 py-1 rounded text-sm cursor-pointer hover:bg-gray-700">
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleProductDetailImageUpload(
                              productDetail.color.id,
                              e
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Size Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Available sizes for {productDetail.color.name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SIZES.map((size) => {
                      const isSelected = productDetail.sizes.includes(size.id);
                      return (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() =>
                            handleToggleSize(productDetail.color.id, size.id)
                          }
                          className={`w-10 h-10 border rounded-lg font-medium text-sm transition-colors ${
                            isSelected
                              ? "border-black bg-black text-white"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {size.code}
                        </button>
                      );
                    })}
                  </div>
                  {hasSubmitted && productDetail.sizes.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      At least one size is required
                    </p>
                  )}
                  {/* Per-size price/quantity inputs */}
                  {productDetail.sizes.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h5 className="text-sm font-medium text-gray-700 mb-1">
                        Per-size price & quantity
                      </h5>
                      <div className="grid grid-cols-1 gap-2">
                        {productDetail.sizes.map((sizeId) => {
                          const sizeInfo = AVAILABLE_SIZES.find(
                            (s) => s.id === sizeId
                          );
                          const variant = (
                            productDetail.sizeVariants || []
                          ).find((v) => v.sizeId === sizeId) || {
                            price: productDetail.price || 0,
                            quantity: productDetail.quantity || 0,
                          };
                          return (
                            <div
                              key={sizeId}
                              className="flex items-center gap-2"
                            >
                              <div className="w-12 text-sm">
                                {sizeInfo?.code || sizeId}
                              </div>
                              <input
                                type="number"
                                min="0"
                                step={1000}
                                value={variant.price}
                                onChange={(e) =>
                                  handleSizeVariantChange(
                                    productDetail.color.id,
                                    sizeId,
                                    "price",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                onFocus={(e) => {
                                  if (e.target.value === "0") {
                                    e.target.value = "";
                                  }
                                }}
                                className="w-32 px-2 py-1 border border-gray-300 rounded-lg text-black"
                                placeholder="Price"
                              />
                              <input
                                type="number"
                                min="0"
                                step={1}
                                value={variant.quantity}
                                onChange={(e) =>
                                  handleSizeVariantChange(
                                    productDetail.color.id,
                                    sizeId,
                                    "quantity",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                onFocus={(e) => {
                                  if (e.target.value === "0") {
                                    e.target.value = "";
                                  }
                                }}
                                className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-black"
                                placeholder="Qty"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {formData.productDetails.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              Select colors above to create product details
            </p>
          )}

          {errors.productDetails && (
            <p className="text-sm text-red-600 mt-2">{errors.productDetails}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            disabled={loading || imageUploading || categoriesLoading}
          >
            {loading && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            <span>Create Product</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Delete Product Modal
export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const { pagination, filters } = useSelector((s: RootState) => s.product);

  const handleDelete = async () => {
    if (!product) return;

    setLoading(true);

    try {
      // Call admin delete API
      const res = await productApi.deleteProductAdmin(product.id);
      if (res.success) {
        // Update redux store
        dispatch(deleteProductSuccess({ id: product.id }));
        // Silent re-fetch to refresh list/page counts without global loading
        try {
          dispatch(fetchProductsSilentRequest({
            page: pagination.page,
            pageSize: pagination.pageSize,
            title: filters.title || undefined,
            categorySlug: filters.categorySlug || undefined,
            isActive: filters.isActive ?? undefined,
            sortBy: filters.sortBy,
            sortDirection: filters.sortDirection,
          }));
        } catch {
          // ignore
        }
        showSuccess("Product deleted successfully!");
        onClose();
      } else {
        showError(res.message || "Failed to delete product");
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Product">
      <div className="p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Delete Product
          </h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete &quot;{product?.title}&quot;? This action
            cannot be undone.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            disabled={loading}
          >
            {loading && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            <span>Delete Product</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
