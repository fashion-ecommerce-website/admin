'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { useMinimumLoadingTime } from '../../../hooks/useMinimumLoadingTime';
import { useToast } from '../../../providers/ToastProvider';
import { ConfirmModal } from '../../../components/modals/ConfirmModal';
import {
  fetchRefundsRequest,
  updateRefundStatusRequest,
  clearSelectedRefund,
  clearError,
} from '../redux/refundSlice';
import { RefundsPresenter } from '../components/RefundsPresenter';
import { RefundDetailModal } from '../components/RefundDetailModal';
import { Refund, RefundStatus, RefundQueryParams } from '../../../types/refund.types';

export const RefundsContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<RefundStatus | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    refund: Refund;
    action: 'approve' | 'reject';
    adminNote: string;
  } | null>(null);

  // Selectors
  const refunds = useAppSelector((state) => state.refunds.refunds);
  const loading = useAppSelector((state) => state.refunds.loading);
  const error = useAppSelector((state) => state.refunds.error);
  const total = useAppSelector((state) => state.refunds.total);
  const currentPage = useAppSelector((state) => state.refunds.currentPage);
  const totalPages = useAppSelector((state) => state.refunds.totalPages);
  const pageSize = useAppSelector((state) => state.refunds.pageSize);

  const displayLoading = useMinimumLoadingTime(loading, 500);

  // Filter refunds by search term (client-side)
  const filteredRefunds = useMemo(() => {
    if (!searchTerm.trim()) return refunds;
    
    const term = searchTerm.toLowerCase();
    return refunds.filter((refund) => {
      return (
        refund.userEmail.toLowerCase().includes(term) ||
        refund.id.toString().includes(term) ||
        refund.orderId.toString().includes(term) ||
        refund.reason.toLowerCase().includes(term)
      );
    });
  }, [refunds, searchTerm]);

  // Fetch refunds on mount and when filters change
  useEffect(() => {
    const params: RefundQueryParams = {
      page: 0,
      size: pageSize,
    };

    if (statusFilter) {
      params.status = statusFilter;
    }

    dispatch(fetchRefundsRequest(params));
  }, [dispatch, pageSize, statusFilter]);

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

  // Handlers
  const handlePageChange = (page: number) => {
    const params: RefundQueryParams = {
      page,
      size: pageSize,
    };

    if (statusFilter) {
      params.status = statusFilter;
    }

    dispatch(fetchRefundsRequest(params));
  };

  const handleFilterStatus = useCallback((status: RefundStatus | null) => {
    setStatusFilter(status);
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleViewDetail = (refund: Refund) => {
    setSelectedRefund(refund);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedRefund(null);
    dispatch(clearSelectedRefund());
  };

  const handleApproveFromList = (refund: Refund) => {
    setPendingAction({ refund, action: 'approve', adminNote: '' });
    setConfirmModalOpen(true);
  };

  const handleRejectFromList = (refund: Refund) => {
    setPendingAction({ refund, action: 'reject', adminNote: '' });
    setConfirmModalOpen(true);
  };

  const handleApproveFromModal = (refundId: number, adminNote: string) => {
    dispatch(
      updateRefundStatusRequest({
        refundId,
        data: { status: 'APPROVED', adminNote },
      })
    );
    showToast({
      type: 'success',
      title: 'Refund Approved',
      message: 'The refund request has been approved and processed.',
    });
    handleCloseDetail();
  };

  const handleRejectFromModal = (refundId: number, adminNote: string) => {
    if (!adminNote.trim()) {
      showToast({
        type: 'error',
        title: 'Note Required',
        message: 'Please provide a reason for rejection.',
      });
      return;
    }
    dispatch(
      updateRefundStatusRequest({
        refundId,
        data: { status: 'REJECTED', adminNote },
      })
    );
    showToast({
      type: 'success',
      title: 'Refund Rejected',
      message: 'The refund request has been rejected.',
    });
    handleCloseDetail();
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;

    const { refund, action, adminNote } = pendingAction;

    if (action === 'reject' && !adminNote.trim()) {
      showToast({
        type: 'error',
        title: 'Note Required',
        message: 'Please provide a reason for rejection.',
      });
      return;
    }

    dispatch(
      updateRefundStatusRequest({
        refundId: refund.id,
        data: {
          status: action === 'approve' ? 'APPROVED' : 'REJECTED',
          adminNote,
        },
      })
    );

    showToast({
      type: 'success',
      title: action === 'approve' ? 'Refund Approved' : 'Refund Rejected',
      message:
        action === 'approve'
          ? 'The refund request has been approved and processed.'
          : 'The refund request has been rejected.',
    });

    setConfirmModalOpen(false);
    setPendingAction(null);
  };

  const handleCloseConfirmModal = () => {
    setConfirmModalOpen(false);
    setPendingAction(null);
  };

  const handleRefresh = useCallback(() => {
    const params: RefundQueryParams = {
      page: currentPage,
      size: pageSize,
    };

    if (statusFilter) {
      params.status = statusFilter;
    }

    dispatch(fetchRefundsRequest(params));
    showToast({
      type: 'info',
      title: 'Refreshed',
      message: 'Refunds list has been refreshed',
    });
  }, [dispatch, currentPage, pageSize, statusFilter, showToast]);

  return (
    <>
      <RefundsPresenter
        refunds={filteredRefunds}
        loading={displayLoading}
        error={error}
        pagination={{
          currentPage,
          pageSize,
          total: searchTerm ? filteredRefunds.length : total,
          totalPages: searchTerm ? Math.ceil(filteredRefunds.length / pageSize) : totalPages,
        }}
        onPageChange={handlePageChange}
        onViewDetail={handleViewDetail}
        onApprove={handleApproveFromList}
        onReject={handleRejectFromList}
        onRefresh={handleRefresh}
        onFilterStatus={handleFilterStatus}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      <RefundDetailModal
        refund={selectedRefund}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onApprove={handleApproveFromModal}
        onReject={handleRejectFromModal}
      />

      <ConfirmModal
        isOpen={confirmModalOpen}
        title={pendingAction?.action === 'approve' ? 'Approve Refund' : 'Reject Refund'}
        description={
          pendingAction?.action === 'approve'
            ? `Are you sure you want to approve this refund request for ${pendingAction?.refund ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pendingAction.refund.refundAmount) : ''}? This will process the refund through Stripe.`
            : 'Are you sure you want to reject this refund request? Please provide a reason.'
        }
        confirmLabel={pendingAction?.action === 'approve' ? 'Approve' : 'Reject'}
        cancelLabel="Cancel"
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmAction}
      />
    </>
  );
};

export default RefundsContainer;
