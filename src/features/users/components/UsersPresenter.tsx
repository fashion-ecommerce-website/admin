'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../../types/user.types';
import { CustomDropdown } from '../../../components/ui';
import { Skeleton } from '../../../components/ui/Skeleton';

interface UsersViewModel {
  users: User[];
  isLoading: boolean;
  apiError: string | null;
  searchTerm: string;
  statusFilter: string;
  roleFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;
  addModalOpen: boolean;
  viewModalOpen: boolean;
  editModalOpen: boolean;
  lockModalOpen: boolean;
  selectedUser: User | null;
  isFilteringData: boolean;
  filteredAndSortedUsers: User[];
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  currentUsers: User[];
}

interface UsersHandlers {
  setSearchTerm: (v: string) => void;
  setStatusFilter: (v: string) => void;
  setRoleFilter: (v: string) => void;
  setSortBy: (v: string) => void;
  setSortOrder: (v: 'asc' | 'desc') => void;
  setItemsPerPage: (v: number) => void;
  setCurrentPage: (v: number) => void;
  setAddModalOpen: (v: boolean) => void;
  setViewModalOpen: (v: boolean) => void;
  setEditModalOpen: (v: boolean) => void;
  setLockModalOpen: (v: boolean) => void;
  setSelectedUser: (u: User | null) => void;
  fetchUsers: () => void;
  goToPrevPage: () => void;
  goToNextPage: () => void;
  goToPage: (p: number) => void;
  handleExportExcel: () => void;
  handleAddUser: (u: User) => void;
  handleEditUser: (id: number) => void;
  handleSaveEdit: (u: User) => void;
  handleToggleUserStatus: (id: number) => void;
  handleDeleteUser: (id: number) => void;
}

export const UsersPresenter: React.FC<{ vm: UsersViewModel; handlers: UsersHandlers }> = ({ vm, handlers }) => {
  const {
    isLoading,
    apiError,
    searchTerm,
    statusFilter,
    roleFilter,
    sortBy,
    sortOrder,
    itemsPerPage,
    startIndex,
    endIndex,
    totalItems,
    currentUsers,
  } = vm;

  const {
    setSearchTerm,
    setStatusFilter,
    setRoleFilter,
    setSortBy,
    setSortOrder,
    goToPrevPage,
    goToNextPage,
    goToPage,
    handleExportExcel,
    handleEditUser,
    handleToggleUserStatus,
  } = handlers;

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time search with 300ms debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [localSearchTerm, setSearchTerm]);

  return (
    <>
      <style jsx global>{`
        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-black bg-clip-text text-transparent">
              User Management
            </h1>
            <div className="flex items-center space-x-2 mt-2">
              <p className="text-gray-600">Manage user information and permissions across the system</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={handleExportExcel} className="cursor-pointer bg-black text-white px-6 py-3 rounded-xl font-medium  focus:outline-none focus:ring-2 focus:ring-offset-2  transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                <span>Export Excel</span>
              </div>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="w-full">
          <label className="block text-sm font-medium text-black mb-2">
            Search
          </label>
          <div className="flex justify-between">
            <div className="w-[40%] relative">
              <input
                type="text"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full px-4 py-2 rounded-md border border-gray-600 text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                </div>
              )}
            </div>
                     </div>
        </div>

        {/* Status Filter Buttons */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Status
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => setStatusFilter('')}
              className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === ''
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === 'active'
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('blocked')}
              className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === 'blocked'
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              Blocked
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">User List</h3>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-900">Show:</span>
                  <CustomDropdown
                    value={itemsPerPage.toString()}
                    onChange={(value) => { handlers.setItemsPerPage(Number(value)); handlers.setCurrentPage(1); }}
                    options={[
                      { value: '5', label: '5' },
                      { value: '10', label: '10' },
                      { value: '20', label: '20' },
                      { value: '50', label: '50' }
                    ]}
                    padding="px-2 py-1"
                    borderRadius="rounded-lg"
                    bgColor="bg-white"
                    className="text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-900">Sort by:</span>
                  <CustomDropdown
                    value={sortBy}
                    onChange={(value) => setSortBy(value)}
                    options={[
                      { value: 'joinDate', label: 'Join date' },
                      { value: 'name', label: 'Name A-Z' },
                      { value: 'lastLogin', label: 'Latest activity' },
                      { value: 'totalOrders', label: 'Orders' },
                      { value: 'totalSpent', label: 'Total spent' }
                    ]}
                    padding="px-2 py-1"
                    borderRadius="rounded-lg"
                    bgColor="bg-white"
                    className="text-sm"
                  />
                  <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="cursor-pointer ml-2 p-1 text-gray-600 hover:text-gray-800 rounded border border-gray-300 hover:border-gray-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-100 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                {isLoading ? (
                  [...Array(5)].map((_, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-8 py-4">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : apiError ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center"><svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Data load error</h3>
                          <p className="text-gray-500 mb-4">{apiError}</p>
                          <button onClick={handlers.fetchUsers} className="cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">Retry</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                          <p className="text-gray-500">Try adjusting filters or your search keywords.</p>
                        </div>
                        {(searchTerm || statusFilter || roleFilter) && (
                          <button onClick={() => { setSearchTerm(''); setStatusFilter(''); setRoleFilter(''); }} className="cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">Clear all filters</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-all duration-300 group border-b border-gray-100/50 hover:border-indigo-100 hover:shadow-sm">
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className={`h-12 w-12 bg-gray-700 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                              <span className="text-white font-bold text-lg">{user.name.charAt(0)}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{user.name}</div>
                            <div className="text-sm text-gray-500 flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${user.role === 'VIP Customer' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200' : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'}`}>
                          {user.role === 'VIP Customer' && (<svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${user.status === 'Active' ? 'bg-green-500' : user.status === 'Inactive' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800 border border-green-200' : user.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center space-x-1 mb-1">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-xs text-gray-500">{new Date(user.lastLogin).toLocaleDateString('en-US')}</span>
                          </div>
                          <div className="text-xs text-gray-400">Joined: {new Date(user.joinDate).toLocaleDateString('en-US')}</div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => { handlers.setSelectedUser(user); handlers.setEditModalOpen(false); handlers.setViewModalOpen(true); }} className="cursor-pointer group relative w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md border border-blue-100 hover:border-blue-200">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button onClick={() => handleEditUser(user.id)} className="cursor-pointer group relative w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md border border-indigo-100 hover:border-indigo-200">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleToggleUserStatus(user.id)} className={`cursor-pointer group relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md border ${user.status === 'Blocked' ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 border-orange-100 hover:border-orange-200' : 'bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-100 hover:border-green-200'}`}>
                            {user.status === 'Blocked' ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            )}
                          </button>
                          
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalItems > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">Showing <span className="font-semibold text-gray-800">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span> of <span className="font-semibold text-gray-900">{totalItems}</span> users</div>
                
              </div>
              <div className="flex items-center justify-center sm:justify-end space-x-2">
                <button onClick={goToPrevPage} disabled={vm.currentPage === 1} className="cursor-pointer flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <div className="flex items-center space-x-1">
                  {(() => {
                    const pages = [] as React.ReactNode[];
                    const startPage = Math.max(1, vm.currentPage - 2);
                    const endPage = Math.min(vm.totalPages, vm.currentPage + 2);
                    if (startPage > 1) {
                      pages.push(<button key={1} onClick={() => goToPage(1)} className="cursor-pointer px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-200 hover:scale-105">1</button>);
                      if (startPage > 2) pages.push(<span key="start-ellipsis" className="px-2 text-gray-400">...</span>);
                    }
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button key={i} onClick={() => goToPage(i)} className={`cursor-pointer px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 ${i === vm.currentPage ? 'text-white bg-black shadow-lg' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}>
                          {i}
                        </button>
                      );
                    }
                    if (endPage < vm.totalPages) {
                      if (endPage < vm.totalPages - 1) pages.push(<span key="end-ellipsis" className="px-2 text-gray-400">...</span>);
                      pages.push(<button key={vm.totalPages} onClick={() => goToPage(vm.totalPages)} className="cursor-pointer px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-200 hover:scale-105">{vm.totalPages}</button>);
                    }
                    return pages;
                  })()}
                </div>
                <button onClick={goToNextPage} disabled={vm.currentPage === vm.totalPages} className="cursor-pointer flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100">
                  <span className="hidden sm:inline">Next</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UsersPresenter;


