'use client';

import React from 'react';
import { Order, OrderStatus, PaymentStatus } from '../../../types/order.types';

interface OrderDetailPresenterProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (orderId: number, status: OrderStatus) => void;
  onUpdatePaymentStatus?: (orderId: number, status: PaymentStatus) => void;
}

export const OrderDetailPresenter: React.FC<OrderDetailPresenterProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdatePaymentStatus,
}) => {
  if (!isOpen || !order) return null;

  // Format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('vi-VN', {
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
        return 'bg-green-50 text-green-700 border-green-200';
      case OrderStatus.UNFULFILLED:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case OrderStatus.PARTIALLY_FULFILLED:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case OrderStatus.CANCELLED:
        return 'bg-red-50 text-red-700 border-red-200';
      case OrderStatus.RETURNED:
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Get payment status badge color
  const getPaymentBadgeClass = (status: PaymentStatus): string => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'bg-green-50 text-green-700 border-green-200';
      case PaymentStatus.UNPAID:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case PaymentStatus.REFUNDED:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case PaymentStatus.PARTIALLY_REFUNDED:
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-black">Order #{order.id}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Created: {formatDate(order.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Status and Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Order Status
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`px-3 py-1.5 inline-flex text-sm font-semibold rounded-lg border ${getStatusBadgeClass(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
                {onUpdateStatus && order.status === OrderStatus.UNFULFILLED && (
                  <button
                    onClick={() => onUpdateStatus(order.id, OrderStatus.FULFILLED)}
                    className="cursor-pointer px-3 py-1.5 text-sm bg-white text-black border border-black rounded hover:bg-gray-50 font-medium transition-colors"
                  >
                    Mark as Fulfilled
                  </button>
                )}
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Status
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`px-3 py-1.5 inline-flex text-sm font-semibold rounded-lg border ${getPaymentBadgeClass(
                    order.paymentStatus
                  )}`}
                >
                  {order.paymentStatus}
                </span>
                {onUpdatePaymentStatus && order.paymentStatus === PaymentStatus.UNPAID && (
                  <button
                    onClick={() => onUpdatePaymentStatus(order.id, PaymentStatus.PAID)}
                    className="cursor-pointer px-3 py-1.5 text-sm bg-white text-black border border-black rounded hover:bg-gray-50 font-medium transition-colors"
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-black mb-3 border-b pb-2">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="text-base font-medium text-black">{order.userUsername}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-base font-medium text-black">{order.userEmail}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-black mb-3 border-b pb-2">
              Shipping Address
            </h3>
            <div className="space-y-2">
              <p className="text-base text-black">
                <span className="font-medium">{order.shippingAddress.fullName}</span>
              </p>
              <p className="text-base text-gray-700">{order.shippingAddress.phone}</p>
              <p className="text-base text-gray-700">
                {order.shippingAddress.line}, {order.shippingAddress.ward}
              </p>
              <p className="text-base text-gray-700">
                {order.shippingAddress.city}, {order.shippingAddress.countryCode}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-black mb-3 border-b pb-2">
              Order Items
            </h3>
            <div className="space-y-3">
              {order.orderDetails.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-black">{item.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Color: {item.colorLabel} | Size: {item.sizeLabel}
                      </p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      {item.promotionName && (
                        <p className="text-sm text-green-600 mt-1">
                          Promotion: {item.promotionName} (-{item.percentOff}%)
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-black">
                      {formatPrice((item.finalPrice || item.unitPrice))}
                    </p>
                    {item.finalPrice && item.finalPrice !== item.unitPrice && (
                      <p className="text-sm text-gray-500 line-through mt-1">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-black mb-3 border-b pb-2">
              Order Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-base">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-black">{formatPrice(order.subtotalAmount)}</span>
              </div>
              {order.voucherCode && (
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">Voucher Code</span>
                  <span className="text-black font-medium">{order.voucherCode}</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-red-600">-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base">
                <span className="text-gray-600">Shipping Fee</span>
                <span className="text-black">{formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                <span className="text-black">Total</span>
                <span className="text-black">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {order.payments && order.payments.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-black mb-3 border-b pb-2">
                Payment Information
              </h3>
              <div className="space-y-3">
                {order.payments.map((payment) => (
                  <div key={payment.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Method</p>
                        <p className="font-medium text-black">{payment.method}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <p className="font-medium text-black">{payment.status}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amount</p>
                        <p className="font-medium text-black">{formatPrice(payment.amount)}</p>
                      </div>
                      {payment.provider && (
                        <div>
                          <p className="text-gray-600">Provider</p>
                          <p className="font-medium text-black">{payment.provider}</p>
                        </div>
                      )}
                      {payment.transactionNo && (
                        <div className="col-span-2">
                          <p className="text-gray-600">Transaction ID</p>
                          <p className="font-medium text-black text-xs break-all">{payment.transactionNo}</p>
                        </div>
                      )}
                      {payment.paidAt && (
                        <div className="col-span-2">
                          <p className="text-gray-600">Paid At</p>
                          <p className="font-medium text-black">{formatDate(payment.paidAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipment Information */}
          {order.shipments && order.shipments.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-black mb-3 border-b pb-2">
                Shipment Information
              </h3>
              <div className="space-y-3">
                {order.shipments.map((shipment) => (
                  <div key={shipment.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Carrier</p>
                        <p className="font-medium text-black">{shipment.carrier}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tracking Number</p>
                        <p className="font-medium text-black">{shipment.trackingNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <p className="font-medium text-black">{shipment.status}</p>
                      </div>
                      {shipment.shippedAt && (
                        <div>
                          <p className="text-gray-600">Shipped At</p>
                          <p className="font-medium text-black">
                            {formatDate(shipment.shippedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          {order.note && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-black mb-3 border-b pb-2">
                Order Note
              </h3>
              <p className="text-base text-gray-700">{order.note}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="cursor-pointer px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPresenter;
