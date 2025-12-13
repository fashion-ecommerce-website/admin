'use client';

import React, { useState } from 'react';
import { Refund, RefundStatus } from '../../../types/refund.types';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Pagination } from '../../../components/ui/Pagination';
import { SearchInput } from '../../../components/ui/SearchInput';

interface RefundsPresenterProps {
  refunds: Refund[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onViewDetail: (refund: Refund) => void;
  onApprove: (refund: Refund) => void;
  onReject: (refund: Refund) => void;
  onRefresh: () => void;
  onFilterStatus?: (status: RefundStatus | null) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export const RefundsPresenter: React.FC<RefundsPresenterProps> = ({
  refunds,
  loading,
  error,
  pagination,
  onPageChange,
  onViewDetail,
  onApprove: _onApprove,
  onReject: _onReject,
  onRefresh,
  onFilterStatus,
  searchTerm = '',
  onSearchChange,
}) => {
  // These handlers are available for future use in action buttons
  void _onApprove;
  void _onReject;
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleStatusFilter = (status: string) => {
    setActiveStatusFilter(status);
    if (onFilterStatus) {
      onFilterStatus(status === 'all' ? null : (status as RefundStatus));
    }
  };

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
    onSearchChange?.(value);
  };

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
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case RefundStatus.APPROVED:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case RefundStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-300';
      case RefundStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)]">
      <div className="space-y-6 flex-grow">
        {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Refund Management</h1>
          <p className="mt-1 text-sm text-gray-700">
            Review and process customer refund requests
          </p>
        </div>
      </div>

      {/* Search */}
      <SearchInput
        value={localSearchTerm}
        onChange={handleSearchChange}
        placeholder="Search by email, order ID, or refund ID..."
        loading={loading}
      />

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {['all', RefundStatus.PENDING, RefundStatus.APPROVED, RefundStatus.REJECTED, RefundStatus.COMPLETED].map(
            (status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeStatusFilter === status
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            )
          )}
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

      {/* Refunds Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Date</th>
                    <th className="px-6 py-3 pr-10 text-right text-xs font-medium text-black uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...Array(5)].map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-24" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : refunds.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-black">No refund requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Date</th>
                    <th className="px-6 py-3 pr-10 text-right text-xs font-medium text-black uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {refunds.map((refund) => (
                    <tr key={refund.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                        #{refund.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        #{refund.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {refund.userEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-black">
                        {formatPrice(refund.refundAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(refund.status)}`}>
                          {refund.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {formatDate(refund.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => onViewDetail(refund)}
                          className="cursor-pointer px-4 py-1.5 text-sm font-medium text-black bg-white border border-gray-300 rounded-md hover:bg-gray-100"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      </div>

      {/* Pagination - always at bottom */}
      {!loading && refunds.length > 0 && (
        <div className="mt-auto pt-6">
          <Pagination
            currentPage={pagination.currentPage + 1}
            totalItems={pagination.total}
            pageSize={pagination.pageSize}
            onPageChange={(page) => onPageChange(page - 1)}
          />
        </div>
      )}
    </div>
  );
};

export default RefundsPresenter;
