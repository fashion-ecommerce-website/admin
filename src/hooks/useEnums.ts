import { useAppSelector } from './redux';
import { CommonEnumsResponse } from '@/types/common.types';

/**
 * Custom hook to access common enums
 * @returns Object containing all enum values and loading state
 */
export function useEnums() {
  const { data, isLoading, error } = useAppSelector((state) => state.common);

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
  };
}
