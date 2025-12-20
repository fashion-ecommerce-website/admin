"use client";

import React from 'react';
import { colorApi, Color, ColorListResponse } from '@/services/api/colorApi';
import { ColorsPresenter } from './ColorsPresenter';
import { useToast } from '@/providers/ToastProvider';
import { useMinimumLoadingTime } from '@/hooks/useMinimumLoadingTime';

interface ColorsContainerProps {
    onPaginationChange?: (page: number, pageSize: number, totalItems: number) => void;
    externalPage?: number;
}

export const ColorsContainer: React.FC<ColorsContainerProps> = ({ onPaginationChange, externalPage }) => {
    const [items, setItems] = React.useState<Color[]>([]);
    const [allItems, setAllItems] = React.useState<Color[]>([]);
    const [loading, setLoading] = React.useState(false);
    const displayLoading = useMinimumLoadingTime(loading, 500);
    const [page, setPage] = React.useState(externalPage || 1);
    const [pageSize, setPageSize] = React.useState(10);
    const [totalItems, setTotalItems] = React.useState(0);
    const [searchName, setSearchName] = React.useState('');
    const { showSuccess, showError } = useToast();

    const applyFiltersAndPagination = React.useCallback(() => {
        const filtered = searchName
            ? allItems.filter((c) => c.name.toLowerCase().includes(searchName.toLowerCase()))
            : allItems;
        setTotalItems(filtered.length);
        const start = (page - 1) * pageSize;
        const paged = filtered.slice(start, start + pageSize);
        setItems(paged);
    }, [allItems, searchName, page, pageSize]);

    const fetchColors = async () => {
        setLoading(true);
        const res = await colorApi.getAllColors();
        if (res.success && res.data) {
            const data = res.data as ColorListResponse;
            console.log('🎨 Fetched colors:', data.items);
            console.log('🎨 Sample color structure:', data.items[0]);
            setAllItems(data.items);
            applyFiltersAndPagination();
        } else {
            showError('Failed to fetch colors', res.message || undefined);
        }
        setLoading(false);
    };

    React.useEffect(() => {
        fetchColors();
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

    const handleCreate = async (payload: { name: string; hexCode?: string }) => {
        setLoading(true);
        const res = await colorApi.createColor(payload);
        if (res.success) {
            showSuccess('Color created successfully');
            await fetchColors();
        } else {
            showError('Create failed', res.message || undefined);
        }
        setLoading(false);
    };

    const handleUpdate = async (id: number, payload: { name: string; hexCode?: string }) => {
        const res = await colorApi.updateColor(id, payload);
        if (res.success) {
            showSuccess('Color updated successfully');
            await fetchColors();
        } else {
            showError('Update failed', res.message || undefined);
        }
    };

    const handleToggleStatus = async (id: number) => {
        const res = await colorApi.toggleColorStatus(id);
        if (res.success) {
            showSuccess('Status updated successfully');
            await fetchColors();
        } else {
            showError('Toggle failed', res.message || undefined);
        }
    };

    const handleSearchByName = (name: string) => setSearchName(name);
    // Pagination handlers kept for future use
    void setPage;
    void setPageSize;

    return (
        <ColorsPresenter
            colors={items}
            loading={displayLoading}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onToggleStatus={handleToggleStatus}
            onSearchByName={handleSearchByName}
        />
    );
};
