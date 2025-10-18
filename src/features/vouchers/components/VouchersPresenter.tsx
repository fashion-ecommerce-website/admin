"use client";

import React, { useState } from "react";
import { Voucher, VoucherFilters } from "../../../types/voucher.types";

interface VouchersPresenterProps {
  vouchers: Voucher[];
  loading: boolean;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: VoucherFilters;
  onUpdateFilters: (filters: Partial<VoucherFilters>) => void;
  onPageChange: (page: number) => void;
  onToggleVoucherActive: (voucherId: number) => void;
}

export const VouchersPresenter: React.FC<VouchersPresenterProps> = ({
  vouchers,
  loading,
  pagination,
  filters,
  onUpdateFilters,
  onPageChange,
  onToggleVoucherActive,
}) => {
  const [searchQuery, setSearchQuery] = useState(filters.name || "");

  const handleSearch = () => {
    onUpdateFilters({ name: searchQuery });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Voucher Management</h1>
          <p className="mt-1 text-sm text-gray-700">
            Manage discount vouchers and promotional codes
          </p>
        </div>
        
      </div>

      {/* Filters */}
      <div className="w-full">
        <label className="block text-sm font-medium text-black mb-2">
          Search
        </label>
        <div className="flex justify-between">
          <div className="w-[40%] flex border-1 border-gray-600 rounded-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vouchers..."
            className="px-2 flex-1 rounded-l-md border-black text-black"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-black text-white rounded-r-md hover:bg-gray-800"
          >
            Search
          </button>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center space-x-2">
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Add New Voucher</span>
        </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      )}

      {/* Vouchers Table */}
      {!loading && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            {vouchers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-black">No vouchers found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Voucher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Valid Period
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vouchers.map((voucher) => (
                      <tr key={voucher.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-black">
                              {voucher.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              Min order:{" "}
                              {voucher.minOrderAmount.toLocaleString()}đ
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-black font-mono">
                            {voucher.code}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              voucher.type === "PERCENT"
                                ? "bg-gray-100 text-black"
                                : "bg-gray-200 text-black"
                            }`}
                          >
                            {voucher.type === "PERCENT"
                              ? "Percentage"
                              : "Fixed Amount"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-black">
                              {voucher.type === "PERCENT"
                                ? `${voucher.value}%`
                                : `${voucher.value.toLocaleString()}đ`}
                            </div>
                            {voucher.maxDiscount !== undefined &&
                              voucher.type === "PERCENT" && (
                                <div className="text-xs text-gray-600">
                                  Max: {voucher.maxDiscount.toLocaleString()}đ
                                </div>
                              )}
                            <div className="text-xs text-gray-600">
                              Used: {voucher.usedCount ?? 0}/
                              {voucher.usageLimitTotal}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                          <div>
                            <div className="font-medium">
                              {new Date(voucher.startAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-600">
                              to {new Date(voucher.endAt).toLocaleDateString()}
                            </div>
                            {new Date(voucher.endAt) < new Date() && (
                              <div className="text-xs text-red-600 font-medium">
                                Expired
                              </div>
                            )}
                            {new Date(voucher.startAt) > new Date() && (
                              <div className="text-xs text-yellow-700 font-medium">
                                Upcoming
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-3">
                            <span className="text-sm font-medium text-black">
                              Status
                            </span>
                            <button
                              onClick={() => onToggleVoucherActive(voucher.id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                                voucher.isActive ? "bg-black" : "bg-gray-300"
                              }`}
                              aria-label={`Toggle status - currently ${
                                voucher.isActive ? "active" : "inactive"
                              }`}
                              title={`Click to ${
                                voucher.isActive ? "deactivate" : "activate"
                              } voucher`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  voucher.isActive
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                }`}
                              />
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
      )}

      {/* Pagination */}
      {!loading && vouchers.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-black">
            Showing {pagination.page * pagination.pageSize + 1} to{" "}
            {Math.min(
              (pagination.page + 1) * pagination.pageSize,
              pagination.totalItems
            )}{" "}
            of {pagination.totalItems} results
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevious}
              className="px-3 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
