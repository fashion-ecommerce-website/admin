// Common enums response from backend
export interface CommonEnumsResponse {
  orderStatus: Record<string, string>;
  paymentMethod: Record<string, string>;
  paymentStatus: Record<string, string>;
  fulfillmentStatus: Record<string, string>;
  voucherUsageStatus: Record<string, string>;
  audienceType: Record<string, string>;
  voucherType: Record<string, string>;
  periodType: Record<string, string>;
}

// Enum state for Redux
export interface CommonEnumsState {
  data: CommonEnumsResponse | null;
  isLoading: boolean;
  error: string | null;
}
