import { useAppSelector } from './redux';
import { CommonEnumsResponse, Color, Size } from '@/types/common.types';
import { useMemo } from 'react';

/**
 * Custom hook to access common enums
 * @returns Object containing all enum values and loading state
 */
export function useEnums() {
  const { data, isLoading, error } = useAppSelector((state) => state.common);

  // Create color map for easy lookup by name
  const colorMap = useMemo(() => {
    const map: Record<string, Color> = {};
    if (data?.colors) {
      data.colors.forEach(color => {
        map[color.name.toLowerCase()] = color;
      });
    }
    return map;
  }, [data?.colors]);

  // Create size map for easy lookup by code
  const sizeMap = useMemo(() => {
    const map: Record<string, Size> = {};
    if (data?.sizes) {
      data.sizes.forEach(size => {
        map[size.code.toUpperCase()] = size;
      });
    }
    return map;
  }, [data?.sizes]);

  return {
    enums: data as CommonEnumsResponse | null,
    isLoading,
    error,
    // Individual enum accessors for convenience
    orderStatus: data?.orderStatus || {},
    paymentMethod: data?.paymentMethod || {},
    paymentStatus: data?.paymentStatus || {},
    fulfillmentStatus: data?.fulfillmentStatus || {},
    voucherUsageStatus: data?.voucherUsageStatus || {},
    audienceType: data?.audienceType || {},
    voucherType: data?.voucherType || {},
    periodType: data?.periodType || {},
    // Colors and sizes
    colors: data?.colors || [],
    sizes: data?.sizes || [],
    colorMap,
    sizeMap,
  };
}
