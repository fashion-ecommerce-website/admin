'use client';

import React, { useState } from 'react';
import { Refund, RefundStatus } from '../../../types/refund.types';

interface RefundDetailModalProps {
  refund: Refund | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (refundId: number, adminNote: string) => void;
  onReject: (refundId: number, adminNote: string) => void;
}

export const RefundDetailModal: React.FC<RefundDetailModalProps> = ({
  refund,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const [adminNote, setAdminNote] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  if (!isOpen || !refund) return null;

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status: RefundStatus): string => {
    switch (status) {
      case RefundStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case RefundStatus.APPROVED:
        return 'bg-blue-100 text-blue-800';
      case RefundStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case RefundStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleConfirmAction = () => {
    if (action === 'approve') {
      onApprove(refund.id, adminNote);
    } else if (action === 'reject') {
      onReject(refund.id, adminNote);
    }
    setAdminNote('');
    setAction(null);
  };

  const handleClose = () => {
    setAdminNote('');
    setAction(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative inline-block w-full max-w-2xl p-6 my-8 text-left align-middle bg-white rounded-lg shadow-xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-black">
              Refund Request #{refund.id}
            </h3>
            <button
              onClick={handleClose}
              className="cursor-pointer text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(refund.status)}`}>
                {refund.status}
              </span>
            </div>

            {/* Order ID */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Order ID</span>
              <span className="text-sm text-black font-semibold">#{refund.orderId}</span>
            </div>

            {/* Customer */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Customer</span>
              <span className="text-sm text-black">{refund.userEmail}</span>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Refund Amount</span>
              <span className="text-lg font-bold text-black">{formatPrice(refund.refundAmount)}</span>
            </div>

            {/* Reason */}
            <div>
              <span className="text-sm font-medium text-gray-600">Reason</span>
              <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-black">
                {refund.reason}
              </p>
            </div>

            {/* Evidence Images */}
            {refund.imageUrls && refund.imageUrls.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600">Evidence Images</span>
                <div className="mt-2 flex gap-3 flex-wrap">
                  {refund.imageUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Refund image ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-md border border-gray-200 hover:border-gray-400 transition-colors"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Created At</span>
                <p className="text-sm text-black">{formatDate(refund.createdAt)}</p>
              </div>
              {refund.processedAt && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Processed At</span>
                  <p className="text-sm text-black">{formatDate(refund.processedAt)}</p>
                </div>
              )}
            </div>

            {/* Admin Note (if exists) */}
            {refund.adminNote && (
              <div>
                <span className="text-sm font-medium text-gray-600">Admin Note</span>
                <p className="mt-1 p-3 bg-blue-50 rounded-md text-sm text-black">
                  {refund.adminNote}
                </p>
              </div>
            )}

            {/* Stripe Refund ID (if exists) */}
            {refund.stripeRefundId && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Stripe Refund ID</span>
                <span className="text-sm text-black font-mono">{refund.stripeRefundId}</span>
              </div>
            )}

            {/* Action Section (only for PENDING) */}
            {refund.status === RefundStatus.PENDING && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                {action ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Note {action === 'reject' && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                        placeholder={
                          action === 'approve'
                            ? 'Optional note for approval...'
                            : 'Please provide a reason for rejection...'
                        }
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setAction(null);
                          setAdminNote('');
                        }}
                        className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmAction}
                        disabled={action === 'reject' && !adminNote.trim()}
                        className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setAction('reject')}
                      className="cursor-pointer px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-md hover:bg-gray-100"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setAction('approve')}
                      className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Close button for non-pending */}
          {refund.status !== RefundStatus.PENDING && (
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleClose}
                className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RefundDetailModal;
