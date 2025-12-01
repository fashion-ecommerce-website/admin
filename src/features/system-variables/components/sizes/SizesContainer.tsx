"use client";

import React from 'react';
import { sizeApi, Size, SizeListResponse } from '@/services/api/sizeApi';
import { SizesPresenter } from './SizesPresenter';
import { useToast } from '@/providers/ToastProvider';
import { useMinimumLoadingTime } from '@/hooks/useMinimumLoadingTime';

interface SizesContainerProps {
    onPaginationChange?: (page: number, pageSize: number, totalItems: number) => void;
    externalPage?: number;
}

export const SizesContainer: React.FC<SizesContainerProps> = ({ onPaginationChange, externalPage }) => {
    const [items, setItems] = React.useState<Size[]>([]);
    const [allItems, setAllItems] = React.useState<Size[]>([]);
    const [loading, setLoading] = React.useState(false);
    const displayLoading = useMinimumLoadingTime(loading, 500);
    const [page, setPage] = React.useState(externalPage || 1);
    const [pageSize, setPageSize] = React.useState(10);
    const [totalItems, setTotalItems] = React.useState(0);
    const [searchTerm, setSearchTerm] = React.useState('');
    const { showSuccess, showError } = useToast();

    const applyFiltersAndPagination = React.useCallback(() => {
        const filtered = searchTerm
            ? allItems.filter((s) =>
                s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.label && s.label.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            : allItems;
        setTotalItems(filtered.length);
        const start = (page - 1) * pageSize;
        const paged = filtered.slice(start, start + pageSize);
        setItems(paged);
    }, [allItems, searchTerm, page, pageSize]);

    const fetchSizes = async () => {
        setLoading(true);
        const res = await sizeApi.getAllSizes();
        if (res.success && res.data) {
            const data = res.data as SizeListResponse;
            setAllItems(data.items);
            applyFiltersAndPagination();
        } else {
            showError('Failed to fetch sizes', res.message || undefined);
        }
        setLoading(false);
    };

    React.useEffect(() => {
        fetchSizes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        applyFiltersAndPagination();
    }, [applyFiltersAndPagination]);

    React.useEffect(() => {
        if (externalPage !== undefined) {
            setPage(externalPage);
        }
    }, [externalPage]);

    React.useEffect(() => {
        onPaginationChange?.(page, pageSize, totalItems);
    }, [page, pageSize, totalItems, onPaginationChange]);

    const handleCreate = async (payload: { code: string; label?: string }) => {
        setLoading(true);
        const res = await sizeApi.createSize(payload);
        if (res.success) {
            showSuccess('Size created successfully');
            await fetchSizes();
        } else {
            showError('Create failed', res.message || undefined);
        }
        setLoading(false);
    };

    const handleUpdate = async (id: number, payload: { code: string; label?: string }) => {
        const res = await sizeApi.updateSize(id, payload);
        if (res.success) {
            showSuccess('Size updated successfully');
            await fetchSizes();
        } else {
            showError('Update failed', res.message || undefined);
        }
    };

    const handleToggleStatus = async (id: number) => {
        const res = await sizeApi.toggleSizeStatus(id);
        if (res.success) {
            showSuccess('Status updated successfully');
            await fetchSizes();
        } else {
            showError('Toggle failed', res.message || undefined);
        }
    };

    const handleSearchByCodeOrLabel = (term: string) => setSearchTerm(term);
    // Pagination handlers kept for future use
    void setPage;
    void setPageSize;

    return (
        <SizesPresenter
            sizes={items}
            loading={displayLoading}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onToggleStatus={handleToggleStatus}
            onSearchByCodeOrLabel={handleSearchByCodeOrLabel}
        />
    );
};
