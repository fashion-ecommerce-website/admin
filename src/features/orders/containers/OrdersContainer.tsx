'use client';

import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
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
    const params: {
      page: number;
      size: number;
      sortBy: string;
      direction: string;
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
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
    const params: {
      page: number;
      size: number;
      sortBy: string;
      direction: string;
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
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
    const params: {
      page: number;
      size: number;
      sortBy: string;
      direction: string;
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
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
    
    dispatch(fetchOrdersRequest(params));
    showToast({
      type: 'info',
      title: 'Refreshed',
      message: 'Orders list has been refreshed',
    });
  };

  const handleExportExcel = async () => {
    try {
      // Fetch all orders without pagination
      const params: {
        page: number;
        size: number;
        sortBy: string;
        direction: string;
        search?: string;
        status?: OrderStatus;
        paymentStatus?: PaymentStatus;
      } = { 
        page: 0, 
        size: 10000,
        sortBy: 'createdAt',
        direction: 'desc'
      }; // Large size to get all orders
      
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;

      // Import orderApi
      const { orderApi } = await import('../../../services/api/orderApi');
      const response = await orderApi.getAllOrders(params);

      if (!response.success || !response.data?.content || response.data.content.length === 0) {
        showToast({
          type: 'warning',
          title: 'No Data',
          message: 'There are no orders to export.',
        });
        return;
      }

      const allOrders = response.data.content;

      // Prepare export data
      const exportData = allOrders.map((order, index) => ({
        'No.': index + 1,
        'Order ID': order.id,
        'User ID': order.userId,
        'Status': order.status,
        'Payment Status': order.paymentStatus,
        'Total Amount (VND)': order.totalAmount.toLocaleString('en-US'),
        'Recipient': order.shippingAddress.fullName,
        'Phone': order.shippingAddress.phone,
        'Address': `${order.shippingAddress.line}, ${order.shippingAddress.ward}, ${order.shippingAddress.city}`,
        'Created At': new Date(order.createdAt).toLocaleDateString('en-US'),
        'Updated At': order.updatedAt ? new Date(order.updatedAt).toLocaleDateString('en-US') : 'N/A',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([]);

      // Column widths
      const colWidths = [
        { wch: 6 },   // No.
        { wch: 12 },  // Order ID
        { wch: 12 },  // User ID
        { wch: 20 },  // Status
        { wch: 20 },  // Payment Status
        { wch: 20 },  // Total Amount
        { wch: 25 },  // Recipient
        { wch: 15 },  // Phone
        { wch: 50 },  // Address
        { wch: 15 },  // Created At
        { wch: 15 },  // Updated At
      ];
      ws['!cols'] = colWidths;

      // Add header
      XLSX.utils.sheet_add_aoa(ws, [
        ['FASHION ECOMMERCE ADMIN'],
        ['ORDERS REPORT'],
        [`Export date: ${new Date().toLocaleDateString('en-US')}`],
        [`Total orders: ${allOrders.length}`],
        [`Filters: ${statusFilter ? `Status: ${statusFilter}` : ''}${paymentFilter ? ` Payment: ${paymentFilter}` : ''}${searchQuery ? ` Search: ${searchQuery}` : ''}`],
        [''],
      ], { origin: 'A1' });

      // Add column headers
      const headers = Object.keys(exportData[0]);
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A7' });

      // Add data
      exportData.forEach((row, index) => {
        const rowData = headers.map(header => row[header as keyof typeof row]);
        XLSX.utils.sheet_add_aoa(ws, [rowData], { origin: `A${8 + index}` });
      });

      // Styling
      interface CellStyle {
        font?: { bold?: boolean; sz?: number; color?: { rgb: string } };
        fill?: { fgColor?: { rgb: string } };
        alignment?: { horizontal?: string; vertical?: string };
        border?: {
          top?: { style: string; color: { rgb: string } };
          bottom?: { style: string; color: { rgb: string } };
          left?: { style: string; color: { rgb: string } };
          right?: { style: string; color: { rgb: string } };
        };
      }

      const titleStyle: CellStyle = {
        font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '312E81' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };

      const headerStyle: CellStyle = {
        font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4F46E5' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };

      const columnHeaderStyle: CellStyle = {
        font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '059669' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } }
        },
      };

      // Apply styles
      ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1', 'K1', 'L1'].forEach(cell => {
        if (!ws[cell]) ws[cell] = {};
        ws[cell].s = titleStyle;
      });

      for (let row = 2; row <= 5; row++) {
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].forEach(col => {
          const cellRef = col + row;
          if (!ws[cellRef]) ws[cellRef] = {};
          ws[cellRef].s = headerStyle;
        });
      }

      headers.forEach((_, index) => {
        const cellRef = String.fromCharCode(65 + index) + '7';
        if (!ws[cellRef]) ws[cellRef] = {};
        ws[cellRef].s = columnHeaderStyle;
      });

      // Merge cells
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 11 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 11 } },
        { s: { r: 4, c: 0 }, e: { r: 4, c: 11 } },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Orders');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `orders_${new Date().getTime()}.xlsx`);

      showToast({
        type: 'success',
        title: 'Export Successful',
        message: 'Orders have been exported to Excel.',
      });
    } catch (error) {
      console.error('Error exporting Excel:', error);
      showToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export orders to Excel.',
      });
    }
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
        onExportExcel={handleExportExcel}
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
