"use client";

import React, { useEffect, useState } from "react";
import { useToast } from "@/providers/ToastProvider";
import { productApi } from "@/services/api/productApi";
import type { ProductDetailAdmin } from '@/types/product.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productDetailId: number | null;
  // optional initial values to avoid extra fetch
  initialPrice?: number;
  initialQuantity?: number;
  onConfirm?: (payload: { detailId: number; price: number; quantity: number }) => void;
}

const EditProductDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  productDetailId,
  initialPrice,
  initialQuantity,
  onConfirm,
}) => {
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [price, setPrice] = useState<number>(initialPrice ?? 0);
  const [quantity, setQuantity] = useState<number>(initialQuantity ?? 0);
  const [detail, setDetail] = useState<ProductDetailAdmin | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    // reset local state when opening
    setDetail(null);
    if (typeof initialPrice === 'number') setPrice(initialPrice);
    if (typeof initialQuantity === 'number') setQuantity(initialQuantity);

    const load = async () => {
      if (!productDetailId) return;
      setLoading(true);
      try {
        const res = await productApi.getProductDetailAdmin(productDetailId);
        if (res.success && res.data) {
          setDetail(res.data);
          // prefer values from API if not provided by initial props
          if (typeof initialPrice !== 'number' && typeof res.data.price === 'number') setPrice(res.data.price);
          if (typeof initialQuantity !== 'number' && typeof res.data.quantity === 'number') setQuantity(res.data.quantity);
        } else {
          showError(res.message || 'Failed to load product detail');
        }
      } catch (error) {
        console.error('Error loading product detail:', error);
        showError('Failed to load product detail');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we don't have initial props
    if (typeof initialPrice !== 'number' || typeof initialQuantity !== 'number' || !detail) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, productDetailId]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!productDetailId) return;

    // Basic validation
    if (!Number.isFinite(price) || price <= 0) {
      showError('Price must be a positive number');
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 0) {
      showError('Quantity must be an integer >= 0');
      return;
    }

    setSaving(true);
    try {
      const body = {
        price,
        quantity,
      } as Partial<{ price: number; quantity: number }>;

      const res = await productApi.updateProductDetailAdmin(productDetailId, body);
      if (res.success) {
        showSuccess('Product detail updated');
        if (onConfirm) onConfirm({ detailId: productDetailId, price, quantity });
        onClose();
      } else {
        showError(res.message || 'Failed to update product detail');
      }
    } catch (error) {
      console.error('Error updating product detail:', error);
      showError('Failed to update product detail');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-black px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Edit Variant</h3>
            <button onClick={onClose} className="text-white">✕</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Variant</label>
            <div className="text-sm text-gray-700">
              {detail ? (
                <>
                  <div className="font-medium">{detail.productTitle || detail.title || 'Product'}</div>
                  <div className="text-xs text-gray-500">Color: {detail.colorName || detail.color?.name}</div>
                  <div className="text-xs text-gray-500">Size: {detail.sizeName ?? (typeof detail.size === 'string' ? detail.size : detail.size?.code ?? '')}</div>
                </>
              ) : (
                <div className="text-sm text-gray-500">Loading variant...</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Price (VND)</label>
            <input
              type="number"
              min={0}
              step={1000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Quantity</label>
            <input
              type="number"
              min={0}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
            <button type="button" onClick={handleSubmit} disabled={saving || loading} className="px-4 py-2 bg-black text-white rounded-lg">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductDetailModal;
