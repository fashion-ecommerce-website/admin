/**
 * Common types shared across the Admin application
 */

/**
 * Common enums response from API
 */
export interface CommonEnumsResponse {
  orderStatuses?: string[];
  paymentStatuses?: string[];
  paymentMethods?: string[];
  [key: string]: string[] | undefined;
}

/**
 * Common enums state for Redux
 */
export interface CommonEnumsState {
  data: CommonEnumsResponse | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Generic paginated response for list endpoints
 * Used by colorApi, sizeApi, and other list APIs
 */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Generic paginated response from backend (Spring Boot format)
 * Used by orderApi and other backend endpoints
 */
export interface BackendPaginatedResponse<T> {
  content: T[];
  pageable: {
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
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
