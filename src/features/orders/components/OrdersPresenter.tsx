'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus, PaymentStatus } from '../../../types/order.types';
import { Skeleton } from '../../../components/ui/Skeleton';
import { SearchInput } from '../../../components/ui/SearchInput';
import { ConfirmModal } from '../../../components/modals/ConfirmModal';

interface OrdersPresenterProps {
  orders: Order[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onViewDetail: (order: Order) => void;
  onCancelOrder: (orderId: number) => void;
  onRefresh: () => void;
  onSearch?: (query: string) => void;
  onFilterStatus?: (status: OrderStatus | null) => void;
  onFilterPaymentStatus?: (status: PaymentStatus | null) => void;
}

export const OrdersPresenter: React.FC<OrdersPresenterProps> = ({
  orders,
  loading,
  error,
  pagination,
  onPageChange,
  onViewDetail,
  onCancelOrder,
  onRefresh,
  onSearch,
  onFilterStatus,
  onFilterPaymentStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  // Real-time search with 300ms debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (onSearch) {
        onSearch(searchQuery);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, onSearch]);

  // Handle combined status filter
  const handleCombinedStatusFilter = (status: string) => {
    setActiveStatusFilter(status);
    
    if (status === 'all') {
      if (onFilterStatus) onFilterStatus(null);
      if (onFilterPaymentStatus) onFilterPaymentStatus(null);
    } else if (status === OrderStatus.UNFULFILLED) {
      if (onFilterStatus) onFilterStatus(OrderStatus.UNFULFILLED);
      if (onFilterPaymentStatus) onFilterPaymentStatus(null);
    } else if (status === OrderStatus.FULFILLED) {
      if (onFilterStatus) onFilterStatus(OrderStatus.FULFILLED);
      if (onFilterPaymentStatus) onFilterPaymentStatus(null);
    } else if (status === OrderStatus.CANCELLED) {
      if (onFilterStatus) onFilterStatus(OrderStatus.CANCELLED);
      if (onFilterPaymentStatus) onFilterPaymentStatus(null);
    } else {
      // Payment statuses: unpaid, paid, refunded
      if (onFilterStatus) onFilterStatus(null);
      if (onFilterPaymentStatus) onFilterPaymentStatus(status as PaymentStatus);
    }
  };

  // Format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge color
  const getStatusBadgeClass = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.FULFILLED:
        return 'bg-green-100 text-green-800 border-green-300';
      case OrderStatus.UNFULFILLED:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-300';
      case OrderStatus.RETURNED:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get payment status badge color
  const getPaymentBadgeClass = (status: PaymentStatus): string => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'bg-green-100 text-green-800 border-green-300';
      case PaymentStatus.UNPAID:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case PaymentStatus.REFUNDED:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case PaymentStatus.PARTIALLY_REFUNDED:
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Handle cancel button click - open confirm modal
  const handleCancelClick = (order: Order) => {
    setOrderToCancel(order);
    setCancelModalOpen(true);
  };

  // Handle confirm cancel
  const handleConfirmCancel = () => {
    if (orderToCancel) {
      onCancelOrder(orderToCancel.id);
      setCancelModalOpen(false);
      setOrderToCancel(null);
    }
  };

  // Handle close cancel modal
  const handleCloseCancelModal = () => {
    setCancelModalOpen(false);
    setOrderToCancel(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Order Management</h1>
          <p className="mt-1 text-sm text-gray-700">
            Manage and track all customer orders
          </p>
        </div>
      </div>

      {/* Search */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by Order ID, Customer name or email..."
        loading={loading}
      />

      {/* Combined Status Filter Buttons */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCombinedStatusFilter('all')}
            className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeStatusFilter === 'all'
                ? 'bg-black text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleCombinedStatusFilter(OrderStatus.UNFULFILLED)}
            className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeStatusFilter === OrderStatus.UNFULFILLED
                ? 'bg-black text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            Unfulfilled
          </button>
          <button
            onClick={() => handleCombinedStatusFilter(OrderStatus.FULFILLED)}
            className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeStatusFilter === OrderStatus.FULFILLED
                ? 'bg-black text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            Fulfilled
          </button>
          <button
            onClick={() => handleCombinedStatusFilter(OrderStatus.CANCELLED)}
            className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeStatusFilter === OrderStatus.CANCELLED
                ? 'bg-black text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            Cancelled
          </button>
          <button
            onClick={() => handleCombinedStatusFilter(PaymentStatus.UNPAID)}
            className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeStatusFilter === PaymentStatus.UNPAID
                ? 'bg-black text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            Unpaid
          </button>
          <button
            onClick={() => handleCombinedStatusFilter(PaymentStatus.PAID)}
            className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeStatusFilter === PaymentStatus.PAID
                ? 'bg-black text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => handleCombinedStatusFilter(PaymentStatus.REFUNDED)}
            className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeStatusFilter === PaymentStatus.REFUNDED
                ? 'bg-black text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            Refunded
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={onRefresh}
              className="cursor-pointer ml-4 text-red-800 hover:text-red-900 font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...Array(5)].map((_, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-black">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-black">#{order.id}</div>
                          <div className="text-xs text-gray-600">
                            {order.orderDetails?.length || 0} items
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-black">
                            {order.userUsername || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-600">{order.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        <div>
                          <div className="font-medium">{formatDate(order.createdAt)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-black">
                            {formatPrice(order.totalAmount)}
                          </div>
                          {order.discountAmount > 0 && (
                            <div className="text-xs text-gray-600">
                              Discount: -{formatPrice(order.discountAmount)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentBadgeClass(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => onViewDetail(order)}
                            className="cursor-pointer text-black hover:text-gray-700 transition-colors"
                            title="View order details"
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleCancelClick(order)}
                            disabled={order.paymentStatus === PaymentStatus.PAID || order.paymentStatus === PaymentStatus.REFUNDED || order.paymentStatus === PaymentStatus.PARTIALLY_REFUNDED || order.status === OrderStatus.CANCELLED}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                              order.paymentStatus === PaymentStatus.PAID || order.paymentStatus === PaymentStatus.REFUNDED || order.paymentStatus === PaymentStatus.PARTIALLY_REFUNDED || order.status === OrderStatus.CANCELLED
                                ? 'text-gray-400 bg-gray-100 border border-gray-300 cursor-not-allowed'
                                : 'cursor-pointer text-black bg-white border border-black hover:bg-gray-50'
                            }`}
                            title={
                              order.paymentStatus === PaymentStatus.PAID
                                ? 'Cannot cancel paid order'
                                : order.paymentStatus === PaymentStatus.REFUNDED || order.paymentStatus === PaymentStatus.PARTIALLY_REFUNDED
                                ? 'Cannot cancel refunded order'
                                : order.status === OrderStatus.CANCELLED
                                ? 'Order already cancelled'
                                : 'Cancel order'
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && orders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-6 py-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-700">
            Showing <span className="font-semibold text-gray-800">{pagination.currentPage * pagination.pageSize + 1}</span> to{' '}
            <span className="font-semibold text-gray-800">
              {Math.min(
                (pagination.currentPage + 1) * pagination.pageSize,
                pagination.total
              )}
            </span>{' '}
            of <span className="font-semibold text-gray-900">{pagination.total}</span> results
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Previous Button */}
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 0}
              className="cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className="hidden sm:flex items-center space-x-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => {
                const isFirst = i === 0;
                const isLast = i === pagination.totalPages - 1;
                const isCurrent = i === pagination.currentPage;
                const isAdjacent = Math.abs(i - pagination.currentPage) === 1;
                const showPage = isFirst || isLast || isCurrent || isAdjacent;
                
                const shouldShowLeftEllipsis = i === 1 && pagination.currentPage > 2;
                const shouldShowRightEllipsis = i === pagination.totalPages - 2 && pagination.currentPage < pagination.totalPages - 3;

                if (shouldShowLeftEllipsis || shouldShowRightEllipsis) {
                  return (
                    <span key={i} className="px-2 py-2 text-sm text-gray-400">
                      •••
                    </span>
                  );
                }

                if (!showPage) {
                  return null;
                }

                return (
                  <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`cursor-pointer min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      isCurrent
                        ? 'bg-black text-white shadow-sm'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Mobile Page Indicator */}
            <div className="sm:hidden px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-300">
              Page {pagination.currentPage + 1} of {pagination.totalPages}
            </div>

            {/* Next Button */}
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages - 1}
              className="cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
            >
              Next
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        title="Cancel Order"
        description={orderToCancel ? `Are you sure you want to cancel order #${orderToCancel.id}? This action cannot be undone.` : ''}
        confirmLabel="Cancel Order"
        cancelLabel="Keep Order"
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
};

export default OrdersPresenter;
