"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/providers/ToastProvider";
import { productApi } from "@/services/api/productApi";
import { ProductDetail } from "@/types/product.types";
import { CurrencyInput } from "../ui";
import { useEnums } from "@/hooks/useEnums";

interface EditProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  productDetailId: number | null;
  productId?: number;
  initialPrice?: number;
  initialQuantity?: number;
  onConfirm?: (payload: {
    detailId: number;
    price: number;
    quantity: number;
  }) => void;
}

export const EditProductDetailModal: React.FC<EditProductDetailModalProps> = ({
  isOpen,
  onClose,
  productDetailId,
  productId: propProductId,
  initialPrice,
  initialQuantity,
  onConfirm,
}) => {
  const { showError, showSuccess } = useToast();
  const { colorMap, sizeMap } = useEnums();
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [price, setPrice] = useState<number>(initialPrice ?? 0);
  const [quantity, setQuantity] = useState<number | ''>(initialQuantity ?? 0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // New states for color/size management
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Image handling functions (simplified)
  const handleImageLoad = useCallback(
    (index: number) => {
      if (index === selectedImageIndex) {
        setImageError(false);
      }
    },
    [selectedImageIndex]
  );

  const handleImageError = useCallback(
    (index: number) => {
      if (index === selectedImageIndex) {
        setImageError(true);
      }
    },
    [selectedImageIndex]
  );

  const preloadImage = useCallback(
    (src: string, index: number) => {
      if (src) {
        const img = document.createElement("img");
        img.onload = () => {
          if (index === selectedImageIndex) setImageError(false);
        };
        img.onerror = () => {
          if (index === selectedImageIndex) setImageError(true);
        };
        img.src = src;
      }
    },
    [selectedImageIndex]
  );

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
    // Calculate displayImages here to avoid dependency issues
    const images =
      productDetail?.images && productDetail.images.length > 0
        ? productDetail.images
        : ["/images/placeholder-product.jpg"];

    const targetImage = images[index];
    if (targetImage) {
      preloadImage(targetImage, index);
    }
  };

  // Handle color change - call API with new color to get available sizes
  const handleColorChange = useCallback(
    async (newColor: string) => {
      const currentDetailId = productDetail?.detailId;
      if (!currentDetailId) return;

      try {
        setLoading(true);
        // First, get available sizes for the selected color
        const response = await productApi.getSizesByColor(
          currentDetailId,
          newColor
        );

        if (response.success && response.data) {
          // Update product detail with new color data and available sizes
          setProductDetail(response.data);
          setSelectedColor(newColor);

          // Reset size selection and set first available size if exists
          const availableSizes = Object.keys(
            response.data.mapSizeToQuantity || {}
          );
          const firstSize = availableSizes[0] || "";
          setSelectedSize(firstSize);

          // Update price and quantity based on first available size
          setPrice(response.data.price || 0);
          const quantityForSize = firstSize
            ? response.data.mapSizeToQuantity?.[firstSize]
            : 0;
          setQuantity(quantityForSize || 0);

          // Reset image selection
          setSelectedImageIndex(0);
          setImageError(false);
        } else {
          showError("Failed to load sizes for color: " + newColor);
        }
      } catch (error) {
        console.error("Error changing color:", error);
        showError("Failed to change color");
      } finally {
        setLoading(false);
      }
    },
    [productDetail?.detailId, showError]
  );

  // Handle size change - call API with new size
  const handleSizeChange = useCallback(
    async (newSize: string) => {
      const currentDetailId = productDetail?.detailId;
      if (!currentDetailId) return;

      try {
        setLoading(true);
        const response = await productApi.getProductByColorPublic(
          currentDetailId.toString(),
          selectedColor,
          newSize
        );

        if (response.success && response.data) {
          setProductDetail(response.data);
          setSelectedSize(response.data.activeSize || "");
          setPrice(response.data.price || 0);

          // Update quantity based on new size
          const quantityForSize = response.data.mapSizeToQuantity?.[newSize];
          setQuantity(quantityForSize || 0);
        } else {
          showError("Failed to load product detail for size: " + newSize);
        }
      } catch (error) {
        console.error("Error changing size:", error);
        showError("Failed to change size");
      } finally {
        setLoading(false);
      }
    },
    [productDetail?.detailId, selectedColor, showError]
  );

  // Fetch product detail when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Reset local state when opening
    setProductDetail(null);
    setSelectedImageIndex(0);
    setImageError(false);

    if (typeof initialPrice === "number") setPrice(initialPrice);
    if (typeof initialQuantity === "number") setQuantity(initialQuantity);

    const fetchProductDetail = async () => {
      if (!productDetailId) return;

      setLoading(true);
      try {
        const productDetail = await productApi.getProductDetailAdmin(
          productDetailId
        );
        if (productDetail.success && productDetail.data) {
          const d = productDetail.data;
          setProductDetail(d);
          console.log("Product detail data:", d);
          setPrice(d.price ?? initialPrice ?? 0);
          // Set selected color with proper fallback
          const colorName = d.activeColor || d.color?.name || "";
          setSelectedColor(colorName);
          setSelectedSize(d.activeSize || "");
          const activeSize = d.activeSize || "";
          if (
            activeSize &&
            d.mapSizeToQuantity &&
            d.mapSizeToQuantity[activeSize] !== undefined
          ) {
            setQuantity(d.mapSizeToQuantity[activeSize]);
          } else {
            setQuantity(d.quantity ?? initialQuantity ?? 0);
          }

          setSelectedImageIndex(0);
          setImageError(false);
        } else {
          showError(productDetail.message || "Failed to load product detail");
        }
      } catch (error) {
        console.error("Error fetching product detail:", error);
        showError("Failed to load product detail");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [
    isOpen,
    productDetailId,
    propProductId,
    initialPrice,
    initialQuantity,
    showError,
  ]);

  // Helper functions to get color and size IDs from dynamic data
  const getColorId = (colorName: string): number => {
    const color = colorMap[colorName.toLowerCase()];
    return color?.id || 1; // Default to ID 1 if not found
  };

  const getSizeId = (sizeName: string): number => {
    const size = sizeMap[sizeName.toUpperCase()];
    return size?.id || 1; // Default to ID 1 if not found
  };

  const handleSave = async () => {
    // Use detailId from productDetail instead of prop since it may change when color/size changes
    const currentDetailId = productDetail?.detailId || productDetailId;
    if (!currentDetailId) return;

    // Convert empty string to 0 for quantity
    const qty = quantity === '' ? 0 : quantity;

    // Basic validation
    if (!Number.isFinite(price) || price <= 0) {
      showError("Price must be a positive number");
      return;
    }
    if (!Number.isInteger(qty) || qty < 0) {
      showError("Quantity must be an integer >= 0");
      return;
    }

    setSaving(true);
    try {
      // Get colorId and sizeId from current selections
      const colorId = getColorId(
        selectedColor || productDetail?.activeColor || ""
      );
      const sizeId = getSizeId(selectedSize || productDetail?.activeSize || "");

      const updateData = {
        price,
        quantity: qty,
        colorId,
        sizeId,
      };

      const response = await productApi.updateProductDetailAdmin(
        currentDetailId,
        updateData
      );

      if (response.success) {
        showSuccess("Product detail updated successfully");
        if (onConfirm) {
          onConfirm({ detailId: currentDetailId, price, quantity: qty });
        }
        onClose();
      } else {
        showError(response.message || "Failed to update product detail");
      }
    } catch (error) {
      console.error("Error updating product detail:", error);
      showError("Failed to update product detail");
    } finally {
      setSaving(false);
    }
  };

  if (!shouldRender) return null;

  const displayImages =
    productDetail?.images && productDetail.images.length > 0
      ? productDetail.images
      : ["/images/placeholder-product.jpg"];

  return (
    <div
      className={`fixed inset-0 backdrop-blur-md bg-black/30 flex items-end md:items-center justify-center z-50 transition-opacity duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-t-2xl md:rounded-lg p-4 w-full max-w-4xl mx-4 relative shadow-2xl border border-gray-200 overflow-hidden h-2/3 md:h-2/3 lg:h-3/4 transition-all duration-300 ${
          isAnimating
            ? "translate-y-0 md:scale-100 opacity-100"
            : "translate-y-full md:translate-y-0 md:scale-0 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile handle */}
        <div className="md:hidden flex items-center justify-center">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full my-2" />
        </div>

        {/* Close button */}
        <button
          className="absolute top-3 right-6 text-gray-400 text-xl z-10"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {!productDetail && loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : productDetail ? (
          <div className="flex flex-col md:flex-row gap-4 h-full">
            {/* Product Images (hidden on mobile) */}
            <div className="hidden md:flex md:w-1/2 flex-col h-full">
              <div className="flex-1 mb-1 min-h-0 relative">
                {loading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                  </div>
                )}
                {imageError && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded">
                    <div className="text-center text-gray-400">
                      <svg
                        className="w-12 h-12 mx-auto mb-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-xs">Unable to load image</p>
                    </div>
                  </div>
                )}

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayImages[selectedImageIndex] || displayImages[0]}
                  alt={productDetail.title || "Product"}
                  className="w-full h-full object-cover rounded transition-opacity duration-300"
                  onLoad={() => handleImageLoad(selectedImageIndex)}
                  onError={() => handleImageError(selectedImageIndex)}
                  style={{ display: imageError ? "none" : "block" }}
                />
              </div>

              {/* Image thumbnails */}
              {displayImages.length > 1 && (
                <div className="flex gap-1 overflow-x-auto flex-shrink-0 h-12 md:flex-wrap md:gap-2">
                  {displayImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageSelect(index)}
                      onMouseEnter={() => preloadImage(image, index)}
                      className={`flex-shrink-0 w-10 h-10 rounded border overflow-hidden relative transition-all duration-200 ${
                        selectedImageIndex === index
                          ? "border-black border-2"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover transition-opacity duration-200"
                        onLoad={() => handleImageLoad(index)}
                        onError={() => handleImageError(index)}
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="w-full md:w-1/2 flex flex-col justify-between overflow-y-auto">
              {/* Mobile condensed view */}
              <div className="block md:hidden space-y-4">
                <h2 className="text-lg font-bold text-black line-clamp-2 py-4">
                  Edit Product Detail
                </h2>

                {/* Product Info */}
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-black">Product: </span>
                    <span className="text-black">
                      {productDetail.title || "N/A"}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-black">Color: </span>
                    <span className="text-black">
                      {productDetail.activeColor || "N/A"}
                    </span>
                  </div>
                  {productDetail.activeSize && (
                    <div className="text-sm">
                      <span className="font-medium text-black">Size: </span>
                      <span className="text-black">
                        {productDetail.activeSize}
                      </span>
                    </div>
                  )}
                </div>

                {/* Price Input */}
                <CurrencyInput
                  label="Price (VND)"
                  value={price}
                  onChange={setPrice}
                  placeholder="Enter price"
                  min={0}
                  step={1000}
                />

                {/* Quantity Input */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuantity(val === '' ? '' : Number(val));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    min="0"
                    step="1"
                  />
                </div>

                {/* Mobile action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    type="button"
                    className="flex-1 bg-black text-white py-3 font-bold text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "SAVING..." : "SAVE"}
                  </button>
                  <button
                    onClick={onClose}
                    type="button"
                    className="flex-1 bg-white text-black py-3 font-bold text-sm uppercase border border-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Desktop full detail */}
              <div className="hidden md:block space-y-6 my-4">
                {/* Title */}
                <h2 className="text-lg font-bold text-black">
                  Edit Product Detail
                </h2>

                {/* Product Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Product
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-black">
                      {productDetail.title || "N/A"}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {productDetail.colors.map((color) => {
                        const colorData = colorMap[color.toLowerCase()];
                        const hexColor = colorData?.hexCode || "#000000";
                        const isSelected =
                          selectedColor.toLowerCase() === color.toLowerCase();
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => handleColorChange(color)}
                            disabled={loading}
                            className={`w-10 h-10 rounded-full border-2 transition-all ${
                              isSelected
                                ? "border-black"
                                : "border-gray-300 hover:border-gray-400"
                            } disabled:opacity-50`}
                            style={{ backgroundColor: hexColor }}
                            title={color}
                            aria-label={color}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Size Selection */}
                  {productDetail.mapSizeToQuantity &&
                    Object.keys(productDetail.mapSizeToQuantity).length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Size
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {Object.keys(productDetail.mapSizeToQuantity).map(
                            (size) => {
                              const isSelected = selectedSize === size;
                              const availableQty =
                                productDetail.mapSizeToQuantity[size];
                              return (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => handleSizeChange(size)}
                                  disabled={loading}
                                  className={`px-4 py-2 min-w-[60px] rounded-md border-2 font-medium text-sm transition-all ${
                                    isSelected
                                      ? "border-black bg-black text-white"
                                      : "border-gray-300 bg-white text-black hover:border-gray-400"
                                  } disabled:opacity-50`}
                                  title={`${size} (Available: ${availableQty})`}
                                >
                                  <div className="text-center">
                                    <div className="font-bold">{size}</div>
                                    <div className="text-xs opacity-70">
                                      {availableQty}
                                    </div>
                                  </div>
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}
                </div>

                <div className="flex gap-4">
                  {/* Price Input */}
                  <CurrencyInput
                    label="Price (VND)"
                    value={price}
                    onChange={setPrice}
                    placeholder="Enter price in VND"
                    min={0}
                    step={1000}
                    className="px-4 py-3"
                  />

                  {/* Quantity Input */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-black mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuantity(val === '' ? '' : Number(val));
                      }}
                      className="w-full text-black px-4 py-3 border border-gray-300 rounded-md"
                      min="0"
                      step="1"
                      placeholder="Enter available quantity"
                    />
                  </div>
                </div>
              </div>

              {/* Desktop Action Buttons */}
              <div className="hidden md:grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={onClose}
                  type="button"
                  className="bg-white text-black py-4 px-6 font-bold text-sm uppercase border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  type="button"
                  className="bg-black text-white py-4 px-6 font-bold text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {saving ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm">
              Unable to load product detail
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProductDetailModal;
