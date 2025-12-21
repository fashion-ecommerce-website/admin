'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { useMinimumLoadingTime } from '../../../hooks/useMinimumLoadingTime';
import { useToast } from '../../../providers/ToastProvider';
import {
  fetchOrdersRequest,
  fetchOrderByIdRequest,
  cancelOrderRequest,
  clearSelectedOrder,
  clearError,
} from '../redux/orderSlice';
import { OrdersPresenter } from '../components/OrdersPresenter';
import { OrderDetailPresenter } from '../components/OrderDetailPresenter';
import { Order, OrderStatus, PaymentStatus } from '../../../types/order.types';

export const OrdersContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);

  // Selectors
  const orders = useAppSelector((state) => state.orders.orders);
  const selectedOrder = useAppSelector((state) => state.orders.selectedOrder);
  const loading = useAppSelector((state) => state.orders.loading);
  const detailLoading = useAppSelector((state) => state.orders.detailLoading);
  const error = useAppSelector((state) => state.orders.error);
  const total = useAppSelector((state) => state.orders.total);
  const currentPage = useAppSelector((state) => state.orders.currentPage);
  const totalPages = useAppSelector((state) => state.orders.totalPages);
  const pageSize = useAppSelector((state) => state.orders.pageSize);

  // Use minimum loading time hook to ensure skeleton shows for at least 500ms
  const displayLoading = useMinimumLoadingTime(loading, 500);
  // Keep for future use when detail modal needs loading state
  void detailLoading;

  // Fetch orders on mount and when filters change
  useEffect(() => {
    const params: {
      page: number;
      size: number;
      sortBy: string;
      direction: 'asc' | 'desc';
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
      keyword?: string;
    } = { 
      page: 0, 
      size: pageSize,
      sortBy: 'createdAt',
      direction: 'desc'
    };
    
    if (statusFilter) {
      params.status = statusFilter;
    }
    if (paymentFilter) {
      params.paymentStatus = paymentFilter;
    }
    if (searchQuery.trim()) {
      params.keyword = searchQuery.trim();
    }
    
    dispatch(fetchOrdersRequest(params));
  }, [dispatch, pageSize, statusFilter, paymentFilter, searchQuery]);

  // Show toast on error
  useEffect(() => {
    if (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error,
      });
      dispatch(clearError());
    }
  }, [error, showToast, dispatch]);

  // Define handleCloseDetail early so it can be used in useEffect
  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedOrderId(null);
    dispatch(clearSelectedOrder());
  }, [dispatch]);

  // Handle successful order cancellation
  useEffect(() => {
    // Check if we were cancelling an order and it's now cancelled
    if (cancellingOrderId && !loading) {
      const cancelledOrder = orders.find(o => o.id === cancellingOrderId);
      if (cancelledOrder && cancelledOrder.status === OrderStatus.CANCELLED) {
        showToast({
          type: 'success',
          title: 'Order Cancelled',
          message: 'Order has been cancelled successfully',
        });
        setCancellingOrderId(null);
        
        // Close detail modal if the cancelled order is currently being viewed
        if (selectedOrderId === cancellingOrderId) {
          handleCloseDetail();
        }
      }
    }
  }, [cancellingOrderId, loading, orders, selectedOrderId, showToast, handleCloseDetail]);

  // Fetch order detail when selected
  useEffect(() => {
    if (selectedOrderId) {
      dispatch(fetchOrderByIdRequest({ orderId: selectedOrderId }));
    }
  }, [selectedOrderId, dispatch]);

  // Handlers
  const handlePageChange = (page: number) => {
    const params: {
      page: number;
      size: number;
      sortBy: string;
      direction: 'asc' | 'desc';
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
      keyword?: string;
    } = { 
      page, 
      size: pageSize,
      sortBy: 'createdAt',
      direction: 'desc'
    };
    
    if (statusFilter) {
      params.status = statusFilter;
    }
    if (paymentFilter) {
      params.paymentStatus = paymentFilter;
    }
    if (searchQuery.trim()) {
      params.keyword = searchQuery.trim();
    }
    
    dispatch(fetchOrdersRequest(params));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Search is now handled by useEffect with debounce in presenter
  };

  const handleFilterStatus = (status: OrderStatus | null) => {
    setStatusFilter(status);
  };

  const handleFilterPaymentStatus = (status: PaymentStatus | null) => {
    setPaymentFilter(status);
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrderId(order.id);
    setIsDetailOpen(true);
  };

  const handleCancelOrder = async (orderId: number) => {
    // Find the order to check payment status
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      showToast({
        type: 'error',
        title: 'Order Not Found',
        message: 'Cannot find the order to cancel',
      });
      return;
    }

    // Check if order is already paid
    if (order.paymentStatus === PaymentStatus.PAID) {
      showToast({
        type: 'error',
        title: 'Cannot Cancel Order',
        message: 'Cannot cancel an order that has already been paid. Please refund instead.',
      });
      return;
    }

    // Check if order is already refunded
    if (order.paymentStatus === PaymentStatus.REFUNDED || order.paymentStatus === PaymentStatus.PARTIALLY_REFUNDED) {
      showToast({
        type: 'error',
        title: 'Cannot Cancel Order',
        message: 'Cannot cancel an order that has been refunded.',
      });
      return;
    }

    // Check if order is already cancelled
    if (order.status === OrderStatus.CANCELLED) {
      showToast({
        type: 'warning',
        title: 'Already Cancelled',
        message: 'This order has already been cancelled.',
      });
      return;
    }

    // Set cancelling state and call API
    setCancellingOrderId(orderId);
    dispatch(cancelOrderRequest({ orderId }));
  };

  const handleRefresh = () => {
    const params: {
      page: number;
      size: number;
      sortBy: string;
      direction: 'asc' | 'desc';
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
      keyword?: string;
    } = { 
      page: currentPage, 
      size: pageSize,
      sortBy: 'createdAt',
      direction: 'desc'
    };
    
    if (statusFilter) {
      params.status = statusFilter;
    }
    if (paymentFilter) {
      params.paymentStatus = paymentFilter;
    }
    if (searchQuery.trim()) {
      params.keyword = searchQuery.trim();
    }
    
    dispatch(fetchOrdersRequest(params));
    showToast({
      type: 'info',
      title: 'Refreshed',
      message: 'Orders list has been refreshed',
    });
  };

  return (
    <>
      <OrdersPresenter
        orders={orders}
        loading={displayLoading}
        error={error}
        pagination={{
          currentPage,
          pageSize,
          total,
          totalPages,
        }}
        onPageChange={handlePageChange}
        onViewDetail={handleViewDetail}
        onCancelOrder={handleCancelOrder}
        onRefresh={handleRefresh}
        onSearch={handleSearch}
        onFilterStatus={handleFilterStatus}
        onFilterPaymentStatus={handleFilterPaymentStatus}
      />

      <OrderDetailPresenter
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </>
  );
};

export default OrdersContainer;
