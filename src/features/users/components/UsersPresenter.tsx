'use client';

import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { User } from '@/types/user.types';

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
    isFilteringData,
  } = vm;

  const {
    setSearchTerm,
    setStatusFilter,
    setRoleFilter,
    setSortBy,
    setSortOrder,
    setItemsPerPage,
    goToPrevPage,
    goToNextPage,
    goToPage,
    handleExportExcel,
    handleEditUser,
    handleToggleUserStatus,
    handleDeleteUser,
  } = handlers;

  return (
    <AdminLayout>
      <style jsx global>{`
        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              User Management
            </h1>
            <div className="flex items-center space-x-2 mt-2">
              <p className="text-gray-600">Manage user information and permissions across the system</p>
              {isLoading && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  <span className="text-sm">Loading data...</span>
                </div>
              )}
              {apiError && (
                <div className="flex items-center space-x-1 text-red-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-sm">API connection error</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={handleExportExcel} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                <span>Export Excel</span>
              </div>
            </button>
            <button onClick={() => handlers.setAddModalOpen(true)} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                <span>Add user</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transform transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-10 py-3 w-full sm:w-80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white focus:bg-white text-gray-900 placeholder-gray-500" />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>

              <div className="relative group">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:bg-white focus:bg-white text-gray-900 min-w-[160px]">
                  <option value="" className="text-gray-900">All statuses</option>
                  <option value="active" className="text-gray-900">Active</option>
                  <option value="inactive" className="text-gray-900">Inactive</option>
                  <option value="blocked" className="text-gray-900">Blocked</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none"><svg className="w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
              </div>

              <div className="relative group">
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="appearance-none bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:bg-white focus:bg-white text-gray-900 min-w-[140px]">
                  <option value="" className="text-gray-900">All roles</option>
                  <option value="customer" className="text-gray-900">Customer</option>
                  <option value="vip" className="text-gray-900">VIP Customer</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none"><svg className="w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
              </div>
            </div>

            {(searchTerm || statusFilter || roleFilter) && (
              <div>
                <button onClick={() => { setSearchTerm(''); setStatusFilter(''); setRoleFilter(''); }} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 hover:text-gray-800 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  <span>Clear filters</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">User List</h3>
                <p className="text-gray-600 text-sm mt-1">Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} users</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-900">Show:</span>
                  <select value={itemsPerPage} onChange={(e) => { handlers.setItemsPerPage(Number(e.target.value)); handlers.setCurrentPage(1); }} className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-900">Sort by:</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border-0 bg-transparent text-gray-900 font-medium focus:ring-0">
                    <option value="joinDate" className="text-gray-900">Join date</option>
                    <option value="name" className="text-gray-900">Name A-Z</option>
                    <option value="lastLogin" className="text-gray-900">Latest activity</option>
                    <option value="totalOrders" className="text-gray-900">Orders</option>
                    <option value="totalSpent" className="text-gray-900">Total spent</option>
                  </select>
                  <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors">
                    <svg className={`w-4 h-4 transition-transform duration-200 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statistics</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-100 transition-opacity duration-300 ${isFilteringData || isLoading ? 'opacity-50' : 'opacity-100'}`}>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`api-loading-${index}`} className="animate-pulse">
                      <td className="px-8 py-6"><div className="flex items-center"><div className="h-12 w-12 bg-gray-200 rounded-full" /><div className="ml-4 space-y-2"><div className="h-4 w-32 bg-gray-200 rounded" /><div className="h-3 w-40 bg-gray-200 rounded" /></div></div></td>
                      <td className="px-6 py-6"><div className="h-6 w-20 bg-gray-200 rounded-full" /></td>
                      <td className="px-6 py-6"><div className="h-6 w-24 bg-gray-200 rounded-full" /></td>
                      <td className="px-6 py-6"><div className="space-y-2"><div className="h-4 w-24 bg-gray-200 rounded" /><div className="h-3 w-20 bg-gray-200 rounded" /></div></td>
                      <td className="px-6 py-6"><div className="space-y-2"><div className="h-4 w-16 bg-gray-200 rounded" /><div className="h-3 w-20 bg-gray-200 rounded" /></div></td>
                      <td className="px-6 py-6"><div className="flex justify-end space-x-2"><div className="h-8 w-8 bg-gray-200 rounded-lg" /><div className="h-8 w-8 bg-gray-200 rounded-lg" /><div className="h-8 w-8 bg-gray-200 rounded-lg" /></div></td>
                    </tr>
                  ))
                ) : apiError ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center"><svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Data load error</h3>
                          <p className="text-gray-500 mb-4">{apiError}</p>
                          <button onClick={handlers.fetchUsers} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">Retry</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : isFilteringData ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <tr key={`loading-${index}`} className="animate-pulse">
                      <td className="px-8 py-6"><div className="flex items-center"><div className="h-12 w-12 bg-gray-200 rounded-full" /><div className="ml-4 space-y-2"><div className="h-4 w-32 bg-gray-200 rounded" /><div className="h-3 w-40 bg-gray-200 rounded" /></div></div></td>
                      <td className="px-6 py-6"><div className="h-6 w-20 bg-gray-200 rounded-full" /></td>
                      <td className="px-6 py-6"><div className="h-6 w-24 bg-gray-200 rounded-full" /></td>
                      <td className="px-6 py-6"><div className="space-y-2"><div className="h-4 w-24 bg-gray-200 rounded" /><div className="h-3 w-20 bg-gray-200 rounded" /></div></td>
                      <td className="px-6 py-6"><div className="space-y-2"><div className="h-4 w-16 bg-gray-200 rounded" /><div className="h-3 w-20 bg-gray-200 rounded" /></div></td>
                      <td className="px-6 py-6"><div className="flex justify-end space-x-2"><div className="h-8 w-8 bg-gray-200 rounded-lg" /><div className="h-8 w-8 bg-gray-200 rounded-lg" /><div className="h-8 w-8 bg-gray-200 rounded-lg" /></div></td>
                    </tr>
                  ))
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center"><svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg></div>
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                          <p className="text-gray-500">Try adjusting filters or your search keywords.</p>
                        </div>
                        {(searchTerm || statusFilter || roleFilter) && (
                          <button onClick={() => { setSearchTerm(''); setStatusFilter(''); setRoleFilter(''); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">Clear all filters</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-all duration-300 group border-b border-gray-100/50 hover:border-indigo-100 hover:shadow-sm">
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className={`h-12 w-12 ${user.role === 'VIP Customer' ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 'bg-gradient-to-r from-indigo-500 to-blue-600'} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
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
                        <div className="text-sm">
                          <div className="flex items-center space-x-2 mb-1">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            <span className="text-gray-900 font-medium">{user.totalOrders} orders</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
                            <span className="text-xs text-gray-500">{user.totalSpent.toLocaleString('en-US')} VND</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => handlers.setViewModalOpen(true)} className="group relative p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md border border-blue-100 hover:border-blue-200">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button onClick={() => handleEditUser(user.id)} className="group relative p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md border border-indigo-100 hover:border-indigo-200">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleToggleUserStatus(user.id)} className={`group relative p-2.5 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md border ${user.status === 'Blocked' ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 border-orange-100 hover:border-orange-200' : 'bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-100 hover:border-green-200'}`}>
                            {user.status === 'Blocked' ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            )}
                          </button>
                          <button onClick={() => handleDeleteUser(user.id)} className="group relative p-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md border border-red-100 hover:border-red-200">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
                <div className="text-sm text-gray-700">Showing <span className="font-semibold text-indigo-600">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span> of <span className="font-semibold text-gray-900">{totalItems}</span> users</div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Show:</span>
                  <select value={itemsPerPage} onChange={(e) => { handlers.setItemsPerPage(Number(e.target.value)); handlers.setCurrentPage(1); }} className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all duration-200">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-600">/ page</span>
                </div>
              </div>
              <div className="flex items-center justify-center sm:justify-end space-x-2">
                <button onClick={goToPrevPage} disabled={vm.currentPage === 1} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <div className="flex items-center space-x-1">
                  {(() => {
                    const pages = [] as React.ReactNode[];
                    const startPage = Math.max(1, vm.currentPage - 2);
                    const endPage = Math.min(vm.totalPages, vm.currentPage + 2);
                    if (startPage > 1) {
                      pages.push(<button key={1} onClick={() => goToPage(1)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-200 hover:scale-105">1</button>);
                      if (startPage > 2) pages.push(<span key="start-ellipsis" className="px-2 text-gray-400">...</span>);
                    }
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button key={i} onClick={() => goToPage(i)} className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 ${i === vm.currentPage ? 'text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'}`}>
                          {i}
                        </button>
                      );
                    }
                    if (endPage < vm.totalPages) {
                      if (endPage < vm.totalPages - 1) pages.push(<span key="end-ellipsis" className="px-2 text-gray-400">...</span>);
                      pages.push(<button key={vm.totalPages} onClick={() => goToPage(vm.totalPages)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-200 hover:scale-105">{vm.totalPages}</button>);
                    }
                    return pages;
                  })()}
                </div>
                <button onClick={goToNextPage} disabled={vm.currentPage === vm.totalPages} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100">
                  <span className="hidden sm:inline">Next</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UsersPresenter;


