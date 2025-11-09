'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { useMinimumLoadingTime } from '../../../hooks/useMinimumLoadingTime';
import { useToast } from '../../../providers/ToastProvider';
import { ConfirmModal } from '../../../components/modals/ConfirmModal';
import {
  fetchOrdersRequest,
  fetchOrderByIdRequest,
  updateOrderRequest,
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
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null);

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
  const displayDetailLoading = useMinimumLoadingTime(detailLoading, 500);

  // Fetch orders on mount and when filters change
  useEffect(() => {
    const params: any = { page: 0, size: pageSize };
    
    if (statusFilter) {
      params.status = statusFilter;
    }
    if (paymentFilter) {
      params.paymentStatus = paymentFilter;
    }
    
    dispatch(fetchOrdersRequest(params));
  }, [dispatch, pageSize, statusFilter, paymentFilter]);

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

  // Fetch order detail when selected
  useEffect(() => {
    if (selectedOrderId) {
      dispatch(fetchOrderByIdRequest({ orderId: selectedOrderId }));
    }
  }, [selectedOrderId, dispatch]);

  // Handlers
  const handlePageChange = (page: number) => {
    const params: any = { page, size: pageSize };
    
    if (statusFilter) {
      params.status = statusFilter;
    }
    if (paymentFilter) {
      params.paymentStatus = paymentFilter;
    }
    
    dispatch(fetchOrdersRequest(params));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search API call when backend supports it
    // For now, we'll filter on frontend
    console.log('Search query:', query);
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

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedOrderId(null);
    dispatch(clearSelectedOrder());
  };

  const handleUpdateStatus = (orderId: number, status: OrderStatus) => {
    dispatch(updateOrderRequest({ 
      orderId, 
      updates: { status } 
    }));
    showToast({
      type: 'success',
      title: 'Order Updated',
      message: `Order status updated to ${status}`,
    });
    // Close detail modal after update
    setTimeout(() => {
      handleCloseDetail();
    }, 500);
  };

  const handleUpdatePaymentStatus = (orderId: number, paymentStatus: PaymentStatus) => {
    dispatch(updateOrderRequest({ 
      orderId, 
      updates: { paymentStatus } 
    }));
    showToast({
      type: 'success',
      title: 'Payment Updated',
      message: `Payment status updated to ${paymentStatus}`,
    });
  };

  const handleCancelOrder = (orderId: number) => {
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

    setOrderToCancel(orderId);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (orderToCancel) {
      dispatch(cancelOrderRequest({ orderId: orderToCancel }));
      showToast({
        type: 'success',
        title: 'Order Cancelled',
        message: 'Order has been cancelled successfully',
      });
      setCancelModalOpen(false);
      setOrderToCancel(null);
      handleCloseDetail();
    }
  };

  const handleCloseCancelModal = () => {
    setCancelModalOpen(false);
    setOrderToCancel(null);
  };

  const handleRefresh = () => {
    const params: any = { page: currentPage, size: pageSize };
    
    if (statusFilter) {
      params.status = statusFilter;
    }
    if (paymentFilter) {
      params.paymentStatus = paymentFilter;
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
        onUpdateStatus={handleUpdateStatus}
        onCancelOrder={handleCancelOrder}
        onRefresh={handleRefresh}
        onSearch={handleSearch}
        onFilterStatus={handleFilterStatus}
        onFilterPaymentStatus={handleFilterPaymentStatus}
      />

      <OrderDetailPresenter
        order={selectedOrder}
        isOpen={isDetailOpen}
        loading={displayDetailLoading}
        onClose={handleCloseDetail}
        onUpdateStatus={handleUpdateStatus}
        onUpdatePaymentStatus={handleUpdatePaymentStatus}
      />

      <ConfirmModal
        isOpen={cancelModalOpen}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel="Cancel Order"
        cancelLabel="Keep Order"
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
      />
    </>
  );
};

export default OrdersContainer;
