"use client"

/**
 * EditProductDetailModal - A comprehensive modal for editing product detail information
 * 
 * Features:
 * - Similar UI to ProductQuickViewModal with image display
 * - Edit price and quantity for a specific product detail
 * - Uses productApi.updateProductDetailAdmin() to save changes
 * - Responsive design for mobile and desktop
 * 
 * Usage:
 * ```tsx
 * <EditProductDetailModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   productDetailId={selectedDetailId}
 *   onConfirm={(payload) => {
 *     console.log('Updated detail:', payload);
 *     // Refresh your product list or update state
 *   }}
 * />
 * ```
 * 
 * API Integration:
 * - GET /products/details/{detailId} - Fetch product detail info
 * - PUT /products/admin/details/{detailId} - Update price/quantity
 */

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/providers/ToastProvider"
import { productApi, ProductDetail } from "@/services/api/productApi"
import { CustomDropdown } from '../ui';

interface EditProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  productDetailId: number | null
  productId?: number  // Add productId prop
  // optional initial values to avoid extra fetch
  initialPrice?: number
  initialQuantity?: number
  onConfirm?: (payload: { detailId: number; price: number; quantity: number }) => void
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
  const { showError, showSuccess } = useToast()
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [price, setPrice] = useState<number>(initialPrice ?? 0)
  const [quantity, setQuantity] = useState<number>(initialQuantity ?? 0)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  // New states for color/size management
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [productId, setProductId] = useState<number | null>(null)

  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      const timer = setTimeout(() => {
        setIsAnimating(true)
      }, 50)
      return () => clearTimeout(timer)
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Image handling functions (simplified)
  const handleImageLoad = useCallback((index: number) => {
    if (index === selectedImageIndex) {
      setImageError(false)
    }
  }, [selectedImageIndex])

  const handleImageError = useCallback((index: number) => {
    if (index === selectedImageIndex) {
      setImageError(true)
    }
  }, [selectedImageIndex])

  const preloadImage = useCallback((src: string, index: number) => {
    if (src) {
      const img = document.createElement('img')
      img.onload = () => {
        if (index === selectedImageIndex) setImageError(false)
      }
      img.onerror = () => {
        if (index === selectedImageIndex) setImageError(true)
      }
      img.src = src
    }
  }, [selectedImageIndex])

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index)
    // Calculate displayImages here to avoid dependency issues
    const images = productDetail?.images && productDetail.images.length > 0 
      ? productDetail.images 
      : ["/images/placeholder-product.jpg"]
    
    const targetImage = images[index]
    if (targetImage) {
      preloadImage(targetImage, index)
    }
  }

  // Handle color change - call API with new color
  const handleColorChange = useCallback(async (newColor: string) => {
    if (!propProductId || !productDetail) return
    
    try {
      setLoading(true)
      const response = await productApi.getProductByColorPublic(
        propProductId.toString(),
        newColor,
        selectedSize || undefined
      )
      
      if (response.success && response.data) {
        setProductDetail(response.data)
        setSelectedColor(response.data.activeColor)
        setPrice(response.data.price || 0)
        
        // Update quantity based on selected size
        const currentSize = response.data.activeSize
        const quantityForSize = currentSize ? response.data.mapSizeToQuantity?.[currentSize] : 0
        setQuantity(quantityForSize || 0)
        
        // Reset image selection
        setSelectedImageIndex(0)
        setImageError(false)
        
        // Important: Update the detailId for save operations
        // The parent component should be updated too, but this ensures we use the right detailId
        console.log('Updated detailId from', productDetailId, 'to', response.data.detailId)
      } else {
        showError('Failed to load product detail for color: ' + newColor)
      }
    } catch (error) {
      console.error('Error changing color:', error)
      showError('Failed to change color')
    } finally {
      setLoading(false)
    }
  }, [propProductId, selectedSize, showError, productDetailId])

  // Handle size change - call API with new size
  const handleSizeChange = useCallback(async (newSize: string) => {
    if (!propProductId || !productDetail) return
    
    try {
      setLoading(true)
      const response = await productApi.getProductByColorPublic(
        propProductId.toString(),
        selectedColor,
        newSize
      )
      
      if (response.success && response.data) {
        setProductDetail(response.data)
        setSelectedSize(response.data.activeSize || '')
        setPrice(response.data.price || 0)
        
        // Update quantity based on new size
        const quantityForSize = response.data.mapSizeToQuantity?.[newSize]
        setQuantity(quantityForSize || 0)
        
        // Important: Update the detailId for save operations
        console.log('Updated detailId from', productDetailId, 'to', response.data.detailId)
      } else {
        showError('Failed to load product detail for size: ' + newSize)
      }
    } catch (error) {
      console.error('Error changing size:', error)
      showError('Failed to change size')
    } finally {
      setLoading(false)
    }
  }, [propProductId, selectedColor, showError, productDetailId])

  // Fetch product detail when modal opens
  useEffect(() => {
    if (!isOpen) return
    
    // Reset local state when opening
    setProductDetail(null)
    setSelectedImageIndex(0)
    setImageError(false)
    
    if (typeof initialPrice === 'number') setPrice(initialPrice)
    if (typeof initialQuantity === 'number') setQuantity(initialQuantity)

    const fetchProductDetail = async () => {
      if (!productDetailId) return
      
      setLoading(true)
      try {
        // If we have productId prop, use it directly
        if (propProductId) {
          setProductId(propProductId)
          
          // Step 1: Get full product info using public API
          const productInfoRes = await productApi.getProductByIdPublic(propProductId.toString())
          if (!productInfoRes.success || !productInfoRes.data) {
            showError('Failed to load product information')
            return
          }
          
          const productInfo = productInfoRes.data
          
          // Step 2: Use first available color to get detailed info
          const firstColor = productInfo.colors?.[0] || productInfo.activeColor
          if (!firstColor) {
            showError('No colors found for this product')
            return
          }
          
          // Step 3: Get color-specific detail
          const detailRes = await productApi.getProductByColorPublic(
            propProductId.toString(),
            firstColor,
            productInfo.activeSize
          )
          
          if (detailRes.success && detailRes.data) {
            setProductDetail(detailRes.data)
            setSelectedColor(detailRes.data.activeColor)
            setSelectedSize(detailRes.data.activeSize || '')
            
            // Set price and quantity from the loaded data
            if (typeof initialPrice !== 'number') {
              setPrice(detailRes.data.price || 0)
            }
            if (typeof initialQuantity !== 'number') {
              const currentSize = detailRes.data.activeSize
              const quantityForSize = currentSize ? detailRes.data.mapSizeToQuantity?.[currentSize] : 0
              setQuantity(quantityForSize || 0)
            }
            
            // Preload first image
            if (detailRes.data.images && detailRes.data.images.length > 0) {
              const img = document.createElement('img')
              img.onload = () => setImageError(false)
              img.onerror = () => setImageError(true)
              img.src = detailRes.data.images[0]
            }
          } else {
            showError('Failed to load product detail')
          }
        } else {
          // Fallback: Try to use admin API if no productId prop provided
          const adminResponse = await productApi.getProductDetailAdmin(productDetailId)
          if (adminResponse.success && adminResponse.data) {
            // This will have different structure, but we'll try to adapt
            showError('Please provide productId for proper color/size selection')
          } else {
            showError('Failed to load product detail')
          }
        }
      } catch (error) {
        console.error("Error fetching product detail:", error)
        showError('Failed to load product detail')
      } finally {
        setLoading(false)
      }
    }

    fetchProductDetail()
  }, [isOpen, productDetailId, propProductId, initialPrice, initialQuantity, showError])

  // Helper functions to map color and size names to IDs
  const getColorId = (colorName: string): number => {
    const colorMap: { [key: string]: number } = {
      'black': 1,
      'white': 2,
      'dark blue': 3,
      'red': 4,
      'pink': 5,
      'orange': 6,
      'mint': 7,
      'brown': 8,
      'yellow': 9
    }
    return colorMap[colorName.toLowerCase()] || 1 // Default to black if not found
  }

  const getSizeId = (sizeName: string): number => {
    const sizeMap: { [key: string]: number } = {
      'S': 1,
      'M': 2,
      'L': 3,
      'XL': 4,
      'F': 5
    }
    return sizeMap[sizeName.toUpperCase()] || 1 // Default to S if not found
  }

  const handleSave = async () => {
    // Use detailId from productDetail instead of prop since it may change when color/size changes
    const currentDetailId = productDetail?.detailId || productDetailId
    if (!currentDetailId) return

    // Basic validation
    if (!Number.isFinite(price) || price <= 0) {
      showError('Price must be a positive number')
      return
    }
    if (!Number.isInteger(quantity) || quantity < 0) {
      showError('Quantity must be an integer >= 0')
      return
    }

    setSaving(true)
    try {
      // Get colorId and sizeId from current selections
      const colorId = getColorId(selectedColor || productDetail?.activeColor || 'black')
      const sizeId = getSizeId(selectedSize || productDetail?.activeSize || 'S')
      
      const updateData = { 
        price, 
        quantity,
        colorId,
        sizeId
      }
      
      console.log('Updating product detail with payload:', updateData)
      const response = await productApi.updateProductDetailAdmin(currentDetailId, updateData)
      
      if (response.success) {
        showSuccess('Product detail updated successfully')
        if (onConfirm) {
          onConfirm({ detailId: currentDetailId, price, quantity })
        }
        onClose()
      } else {
        showError(response.message || 'Failed to update product detail')
      }
    } catch (error) {
      console.error("Error updating product detail:", error)
      showError('Failed to update product detail')
    } finally {
      setSaving(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US").format(price) + " VND"
  }

  if (!shouldRender) return null

  const displayImages =
    productDetail?.images && productDetail.images.length > 0 
      ? productDetail.images 
      : ["/images/placeholder-product.jpg"]

  return (
    <div
      className={`fixed inset-0 bg-black/75 flex items-end md:items-center justify-center z-50 transition-opacity duration-300 ${
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : productDetail ? (
          <div className="flex flex-col md:flex-row gap-4 h-full">
            {/* Product Images (hidden on mobile) */}
            <div className="hidden md:flex md:w-1/3 flex-col h-full">
              <div className="flex-1 mb-1 min-h-0 relative">
                {imageError && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded">
                    <div className="text-center text-gray-400">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
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
                        selectedImageIndex === index ? "border-black border-2" : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
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
            <div className="w-full md:w-2/3 flex flex-col justify-between overflow-y-auto">
              {/* Mobile condensed view */}
              <div className="block md:hidden space-y-4">
                <h2 className="text-lg font-bold text-black line-clamp-2 py-4">
                  Edit Product Detail
                </h2>

                {/* Product Info */}
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-black">Product: </span>
                    <span className="text-black">{productDetail.title || 'N/A'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-black">Color: </span>
                    <span className="text-black">{productDetail.activeColor || 'N/A'}</span>
                  </div>
                  {productDetail.activeSize && (
                    <div className="text-sm">
                      <span className="font-medium text-black">Size: </span>
                      <span className="text-black">{productDetail.activeSize}</span>
                    </div>
                  )}
                </div>

                {/* Price Input */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Price (VND)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    min="0"
                    step="1000"
                  />
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
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
                    <label className="block text-sm font-medium text-black mb-2">Product</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-black">
                      {productDetail.title || 'N/A'}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Color</label>
                    <CustomDropdown
                      value={selectedColor}
                      onChange={(value) => handleColorChange(value)}
                      options={productDetail.colors.map((color) => ({ value: color, label: color }))}
                      disabled={loading}
                      padding="px-3 py-2"
                      borderRadius="rounded-md"
                      bgColor="bg-white"
                    />
                  </div>

                  {/* Size Selection */}
                  {productDetail.mapSizeToQuantity && Object.keys(productDetail.mapSizeToQuantity).length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Size</label>
                      <CustomDropdown
                        value={selectedSize}
                        onChange={(value) => handleSizeChange(value)}
                        options={Object.keys(productDetail.mapSizeToQuantity).map((size) => ({
                          value: size,
                          label: `${size} (Available: ${productDetail.mapSizeToQuantity[size]})`
                        }))}
                        disabled={loading}
                        padding="px-3 py-2"
                        borderRadius="rounded-md"
                        bgColor="bg-white"
                      />
                    </div>
                  )}
                </div>

                {/* Price Input */}
                <div>
                  <label className="block text-sm font-medium text-black mb-3">Price (VND)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full text-black px-4 py-3 border border-gray-300 rounded-md"
                    min="0"
                    step="1000"
                    placeholder="Enter price in VND"
                  />
                  <div className="mt-1 text-sm text-gray-500">
                    Formatted: {formatPrice(price)}
                  </div>
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="block text-sm font-medium text-black mb-3">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full text-black px-4 py-3 border border-gray-300 rounded-md"
                    min="0"
                    step="1"
                    placeholder="Enter available quantity"
                  />
                </div>
              </div>

              {/* Desktop Action Buttons */}
              <div className="hidden md:grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  type="button"
                  className="bg-black text-white py-4 px-6 font-bold text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {saving ? "SAVING..." : "SAVE CHANGES"}
                </button>
                <button
                  onClick={onClose}
                  type="button"
                  className="bg-white text-black py-4 px-6 font-bold text-sm uppercase border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm">Unable to load product detail</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditProductDetailModal
