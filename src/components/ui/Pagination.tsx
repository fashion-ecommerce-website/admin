"use client";

import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
}) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const goToPrevPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const goToPage = (page: number) => {
        onPageChange(page);
    };

    if (totalItems === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-700">
                        Showing <span className="font-semibold text-gray-800">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span> of <span className="font-semibold text-gray-900">{totalItems}</span> items
                    </div>
                </div>
                <div className="flex items-center justify-center sm:justify-end space-x-2">
                    <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                        className="cursor-pointer flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden sm:inline">Previous</span>
                    </button>
                    <div className="flex items-center space-x-1">
                        {(() => {
                            const pages = [] as React.ReactNode[];
                            const startPage = Math.max(1, currentPage - 2);
                            const endPage = Math.min(totalPages, currentPage + 2);

                            if (startPage > 1) {
                                pages.push(
                                    <button
                                        key={1}
                                        onClick={() => goToPage(1)}
                                        className="cursor-pointer px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-200 hover:scale-105"
                                    >
                                        1
                                    </button>
                                );
                                if (startPage > 2) {
                                    pages.push(
                                        <span key="start-ellipsis" className="px-2 text-gray-400">
                                            ...
                                        </span>
                                    );
                                }
                            }

                            for (let i = startPage; i <= endPage; i++) {
                                pages.push(
                                    <button
                                        key={i}
                                        onClick={() => goToPage(i)}
                                        className={`cursor-pointer px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 ${i === currentPage
                                                ? 'text-white bg-black shadow-lg'
                                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                    >
                                        {i}
                                    </button>
                                );
                            }

                            if (endPage < totalPages) {
                                if (endPage < totalPages - 1) {
                                    pages.push(
                                        <span key="end-ellipsis" className="px-2 text-gray-400">
                                            ...
                                        </span>
                                    );
                                }
                                pages.push(
                                    <button
                                        key={totalPages}
                                        onClick={() => goToPage(totalPages)}
                                        className="cursor-pointer px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-200 hover:scale-105"
                                    >
                                        {totalPages}
                                    </button>
                                );
                            }

                            return pages;
                        })()}
                    </div>
                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="cursor-pointer flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
