"use client";

import React, { useState, useEffect, useRef } from "react";
import { Promotion, PromotionFilters, CreatePromotionRequest, UpdatePromotionRequest } from "../../../types/promotion.types";
import PromotionModal from "../../../components/modals/PromotionModals";
import { PromotionRowSkeleton, TableSkeletonWithRows } from "../../../components/ui/Skeleton";

interface PromotionsPresenterProps {
  promotions: Promotion[];
  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: PromotionFilters;
  onUpdateFilters: (filters: Partial<PromotionFilters>) => void;
  onPageChange: (page: number) => void;
  onTogglePromotionActive: (promotionId: number) => void;
  onCreatePromotion: (promotionData: CreatePromotionRequest) => void;
  onUpdatePromotion: (id: number, promotionData: UpdatePromotionRequest) => void;
  onTargetsUpdated: () => void;
}

export const PromotionsPresenter: React.FC<PromotionsPresenterProps> = ({
  promotions,
  loading,
  createLoading,
  updateLoading,
  pagination,
  filters,
  onUpdateFilters,
  onPageChange,
  onTogglePromotionActive,
  onCreatePromotion,
  onUpdatePromotion,
  onTargetsUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState(filters.name || "");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [prevCreateLoading, setPrevCreateLoading] = useState(false);
  const [prevUpdateLoading, setPrevUpdateLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close create modal when create completes successfully
  useEffect(() => {
    if (prevCreateLoading && !createLoading) {
      setIsCreateModalOpen(false);
    }
    setPrevCreateLoading(createLoading);
  }, [createLoading, prevCreateLoading]);

  // Close edit modal when update completes successfully
  useEffect(() => {
    if (prevUpdateLoading && !updateLoading) {
      setIsEditModalOpen(false);
      setSelectedPromotion(null);
    }
    setPrevUpdateLoading(updateLoading);
  }, [updateLoading, prevUpdateLoading]);

  // Real-time search with 300ms debounce
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      onUpdateFilters({ name: searchQuery });
    }, 300);

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, onUpdateFilters]);

  const handleStatusFilter = (isActive: boolean | null) => {
    onUpdateFilters({ isActive });
  };

  const handleCreatePromotion = (promotionData: CreatePromotionRequest) => {
    onCreatePromotion(promotionData);
    setIsCreateModalOpen(false);
  };

  const handleEditPromotion = (promotionData: CreatePromotionRequest) => {
    if (selectedPromotion) {
      onUpdatePromotion(selectedPromotion.id, promotionData);
      setIsEditModalOpen(false);
      setSelectedPromotion(null);
    }
  };

  const openEditModal = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Promotion Management</h1>
          <p className="mt-1 text-sm text-gray-700">
            Manage promotional discounts and sales campaigns
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="w-full">
        <label className="block text-sm font-medium text-black mb-2">
          Search
        </label>
        <div className="flex justify-between">
          <div className="w-[40%] relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search promotions by name..."
              className="w-full px-4 py-2 rounded-md border border-gray-600 text-black focus:outline-none focus:ring-2 focus:ring-black"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center space-x-2 cursor-pointer"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Add New Promotion</span>
          </button>
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => handleStatusFilter(null)}
          className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer ${
            filters.isActive === null
              ? "bg-black text-white"
              : "bg-gray-200 text-black hover:bg-gray-300"
          }`}
        >
          All
        </button>
        <button
          onClick={() => handleStatusFilter(true)}
          className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer ${
            filters.isActive === true
              ? "bg-black text-white"
              : "bg-gray-200 text-black hover:bg-gray-300"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => handleStatusFilter(false)}
          className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer ${
            filters.isActive === false
              ? "bg-black text-white"
              : "bg-gray-200 text-black hover:bg-gray-300"
          }`}
        >
          Inactive
        </button>
      </div>

      {/* Promotions Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Promotion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Targets
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
                  <TableSkeletonWithRows rows={5} rowComponent={PromotionRowSkeleton} />
                </tbody>
              </table>
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-black">No promotions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Promotion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Targets
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
                  {promotions.map((promotion) => (
                      <tr key={promotion.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-black">
                              {promotion.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              ID: {promotion.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-black">
                            Percentage
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-black">
                            {promotion.value}%
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            {promotion.targets && promotion.targets.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {promotion.targets.slice(0, 3).map((target, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-black"
                                    title={target.targetName || `${target.targetType} ID: ${target.targetId}`}
                                  >
                                    {target.targetName 
                                      ? (target.targetName.length > 20 
                                          ? target.targetName.substring(0, 20) + '...' 
                                          : target.targetName)
                                      : `${target.targetType === 'SKU' ? 'Detail' : target.targetType} #${target.targetId}`}
                                  </span>
                                ))}
                                {promotion.targets.length > 3 && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-black">
                                    +{promotion.targets.length - 3} more
                                  </span>
                                )}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                          <div>
                            <div className="font-medium">
                              {new Date(promotion.startAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-600">
                              to {new Date(promotion.endAt).toLocaleDateString()}
                            </div>
                            {new Date(promotion.endAt) < new Date() && (
                              <div className="text-xs text-red-600 font-medium">
                                Expired
                              </div>
                            )}
                            {new Date(promotion.startAt) > new Date() && (
                              <div className="text-xs text-yellow-700 font-medium">
                                Upcoming
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() => openEditModal(promotion)}
                              className="text-black hover:text-gray-700 cursor-pointer"
                              title="Edit promotion"
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <span className="text-sm font-medium text-black">
                              Status
                            </span>
                            <button
                              onClick={() => onTogglePromotionActive(promotion.id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                                promotion.isActive ? "bg-black" : "bg-gray-300"
                              }`}
                              aria-label={`Toggle status - currently ${
                                promotion.isActive ? "active" : "inactive"
                              }`}
                              title={`Click to ${
                                promotion.isActive ? "deactivate" : "activate"
                              } promotion`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  promotion.isActive
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
            )
          }
        </div>
      </div>

      {/* Pagination */}
      {!loading && promotions.length > 0 && (
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
              className="px-3 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <PromotionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePromotion}
        title="Create New Promotion"
      />

      <PromotionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPromotion(null);
        }}
        onSubmit={handleEditPromotion}
        promotion={selectedPromotion}
        title="Edit Promotion"
        onTargetsUpdated={onTargetsUpdated}
      />
    </div>
  );
};
