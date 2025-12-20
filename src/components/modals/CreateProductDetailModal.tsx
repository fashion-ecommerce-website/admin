"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Product, VariantColor, VariantSize } from "../../types/product.types";
import CurrencyInput from "../ui/CurrencyInput";
import { useToast } from "@/providers/ToastProvider";
import { useEnums } from "@/hooks/useEnums";

interface CreateProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (data: {
    productId: number;
    formData: FormData;
  }) => Promise<void>;
}

const CreateProductDetailModal: React.FC<CreateProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm,
}) => {
  const { showError, showSuccess } = useToast();
  const { colors, sizes } = useEnums();

  // Convert colors and sizes to VariantColor and VariantSize format (memoized)
  const AVAILABLE_COLORS: VariantColor[] = useMemo(() =>
    colors.map((c) => ({ id: c.id, name: c.name, hex: c.hexCode || "#000000" })),
    [colors]
  );

  const AVAILABLE_SIZES: VariantSize[] = useMemo(() =>
    sizes.map((s) => ({ id: s.id, code: s.code, label: s.label || s.code })),
    [sizes]
  );
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Reset form when modal opens with new product
  useEffect(() => {
    if (isOpen && product) {
      setSelectedColorId(AVAILABLE_COLORS[0]?.id ?? null);
      setSelectedSizeId(AVAILABLE_SIZES[0]?.id ?? null);
      setPrice(0);
      setQuantity(0);
      setImageFiles([]);
      setImagePreviews([]);
    }
  }, [isOpen, product, AVAILABLE_COLORS, AVAILABLE_SIZES]);

  // Handle escape key to close modal and prevent body scroll when open
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
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

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const incomingFiles: File[] = Array.from(files);

    // Check total count
    if (imageFiles.length + incomingFiles.length > 5) {
      showError("Maximum 5 images allowed per product detail");
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

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
      newPreviews.push(URL.createObjectURL(file));
    }

    setImageFiles((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    showSuccess(`${validFiles.length} image(s) added`);
  };

  const handleRemoveImage = (index: number) => {
    // Revoke the URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);

    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen || !product) return null;

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedColorId || !selectedSizeId) {
      showError("Please select both color and size");
      return;
    }

    if (!price || price <= 0) {
      showError("Price must be greater than 0");
      return;
    }

    if (quantity < 0) {
      showError("Quantity cannot be negative");
      return;
    }

    if (imageFiles.length === 0) {
      showError("Please upload at least one image");
      return;
    }

    if (imageFiles.length > 5) {
      showError("Maximum 5 images allowed");
      return;
    }

    try {
      // Build FormData with detail JSON string and images
      const formData = new FormData();
      
      // Create detail JSON blob with correct content-type
      const detailJson = JSON.stringify({
        colorId: selectedColorId,
        sizeId: selectedSizeId,
        price,
        quantity,
      });
      
      // Append as Blob with application/json content-type
      const detailBlob = new Blob([detailJson], { type: 'application/json' });
      formData.append("detail", detailBlob);
      
      // Append images
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });
      
      // Call onConfirm with productId and formData
      await onConfirm({
        productId: product!.id,
        formData,
      });

      // Reset form
      setSelectedColorId(AVAILABLE_COLORS[0]?.id ?? null);
      setSelectedSizeId(AVAILABLE_SIZES[0]?.id ?? null);
      setPrice(0);
      setQuantity(0);
      setImageFiles([]);
      setImagePreviews([]);
      
      showSuccess("Product detail created successfully!");
      onClose();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to create product detail");
    }
  };

  return (
    <div className={`fixed inset-0 backdrop-blur-md bg-black/30 flex items-end md:items-center justify-center z-50`} onClick={onClose}>
      <div
        className={`bg-white rounded-t-2xl md:rounded-lg p-4 w-full max-w-4xl mx-4 relative shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="md:hidden flex items-center justify-center">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full my-2" />
        </div>

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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Color Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Select Color <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_COLORS.map((color: VariantColor) => {
                const isSelected = selectedColorId === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColorId(color.id)}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "border-black bg-gray-100 ring-2 ring-black"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-gray-300 mr-2 flex-shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-sm text-black capitalize truncate">
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Select Size <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SIZES.map((size: VariantSize) => {
                const isSelected = selectedSizeId === size.id;
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSelectedSizeId(size.id)}
                    className={`min-w-[3rem] h-12 px-4 border rounded-lg font-medium text-sm transition-colors ${
                      isSelected
                        ? "border-black bg-black text-white"
                        : "border-gray-300 hover:border-gray-400 text-gray-900"
                    }`}
                  >
                    {size.code}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Price (VND) <span className="text-red-500">*</span>
              </label>
              <CurrencyInput
                value={price}
                onChange={setPrice}
                placeholder="Enter price"
                className="w-full px-4 py-3"
              />
            </div>

            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Enter quantity"
                min="0"
                className="w-full px-3 py-3 text-black border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Product Images <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2">
                (Max 5 images, 5MB each)
              </span>
            </label>

            {/* Image Preview Grid */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="w-full h-20 relative rounded-lg overflow-hidden border border-gray-300">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 100vw, 160px"
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {imageFiles.length < 5 && (
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                <div className="text-center">
                  <svg
                    className="mx-auto h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="mt-2 block text-sm font-medium text-gray-600">
                    {imageFiles.length === 0
                      ? "Upload images"
                      : "Add more images"}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedColorId || !selectedSizeId}
              className="flex-1 px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductDetailModal;
