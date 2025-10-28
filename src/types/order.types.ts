// Order types for Admin panel

// Order status enum (matching backend FulfillmentStatus)
export enum OrderStatus {
  UNFULFILLED = 'UNFULFILLED',
  FULFILLED = 'FULFILLED',
  PARTIALLY_FULFILLED = 'PARTIALLY_FULFILLED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

// Payment status enum
export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

// Payment method enum
export enum PaymentMethod {
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  E_WALLET = 'E_WALLET'
}

// Shipping address interface
export interface ShippingAddress {
  id: number;
  fullName: string;
  phone: string;
  line: string;
  ward: string;
  city: string;
  countryCode: string;
}

// Order detail interface
export interface OrderDetail {
  id: number;
  productDetailId: number;
  title: string;
  colorLabel: string;
  sizeLabel: string;
  quantity: number;
  unitPrice: number;
  finalPrice?: number;
  totalPrice: number;
  percentOff?: number;
  promotionId?: number;
  promotionName?: string;
  imageUrl?: string;
}

// Payment interface
export interface Payment {
  id: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  provider: string | null;
  transactionNo: string | null;
  paidAt: string | null;
  createdAt: string;
}

// Shipment interface
export interface Shipment {
  id: number;
  trackingNumber: string;
  carrier: string;
  status: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

// Complete order interface
export interface Order {
  id: number;
  userId: number;
  userEmail: string;
  userUsername: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  currency: string;
  subtotalAmount: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  note: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
  orderDetails: OrderDetail[];
  payments: Payment[];
  shipments: Shipment[];
  voucherCode?: string;
}

// Pagination interfaces
export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: Sort;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// Order query parameters for admin
export interface OrderQueryParams {
  userId?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  sortBy?: string;
  direction?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

// Update order request
export interface UpdateOrderRequest {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  currency?: string;
  subtotalAmount?: number;
  discountAmount?: number;
  shippingFee?: number;
  totalAmount?: number;
  note?: string;
}

// Order state for Redux store
export interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}
