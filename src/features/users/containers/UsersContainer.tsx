'use client';

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useAppDispatch } from '@/hooks/redux';
import { useToast } from '@/providers/ToastProvider';
import { useMinimumLoadingTime } from '@/hooks/useMinimumLoadingTime';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { fetchUsersRequest } from '../redux/userSlice';
import { userApi } from '@/services/api/userApi';
import { User, convertBackendUserToUser, UserRank } from '@/types/user.types';
import { AddUserModal, ViewUserModal, LockUserModal } from '@/components/modals/UserModals';
import { UsersPresenter } from '../components/UsersPresenter';

export const UsersContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showSuccess, showError, showWarning } = useToast();

  // Local state for users and error
  const [users, setUsers] = useState<User[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ranks map for mapping rankId to rankName
  const ranksMapRef = useRef<Map<number, string>>(new Map());

  // Server-side pagination state
  const [serverPage, setServerPage] = useState(0); // Backend uses 0-based index
  const [serverPageSize, setServerPageSize] = useState(10);
  const [serverTotalItems, setServerTotalItems] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Server-side filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

  // Use minimum loading time hook to ensure skeleton shows for at least 500ms
  const displayLoading = useMinimumLoadingTime(isLoading, 500);

  // Fetch ranks once on mount
  const fetchRanks = useCallback(async () => {
    try {
      const response = await userApi.getUserRanks();
      if (response.success && response.data) {
        const map = new Map<number, string>();
        response.data.forEach((rank: UserRank) => {
          map.set(rank.id, rank.name);
        });
        ranksMapRef.current = map;
      }
    } catch (error) {
      console.error('Failed to fetch ranks:', error);
    }
  }, []);

  const fetchUsers = useCallback(async (
    page: number = serverPage, 
    pageSize: number = serverPageSize,
    search?: string,
    isActive?: boolean
  ) => {
    setIsLoading(true);
    dispatch(fetchUsersRequest());
    
    try {
      const response = await userApi.getAllUsers({ 
        page, 
        pageSize,
        search: search || undefined,
        isActive
      });

      if (response.success && response.data) {
        // Map rankId to rankName using ranksMap
        const convertedUsers = response.data.items.map(backendUser => {
          const user = convertBackendUserToUser(backendUser);
          // If rankName not provided by backend, lookup from ranksMap
          if (!user.rankName && backendUser.rankId) {
            user.rankName = ranksMapRef.current.get(backendUser.rankId) || undefined;
          }
          return user;
        });
        setUsers(convertedUsers);
        setServerPage(response.data.page);
        setServerTotalItems(response.data.totalItems);
        setServerTotalPages(response.data.totalPages);
        setHasNext(response.data.hasNext);
        setHasPrevious(response.data.hasPrevious);
        setApiError(null);
      } else {
        setApiError(response.message || 'Failed to fetch users');
        showError('Data load error', response.message || 'Unable to fetch users from server');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      showError('Connection error', 'Unable to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, serverPage, serverPageSize, showError]);

  // Convert statusFilter to isActive boolean
  const getIsActiveFromFilter = useCallback((filter: 'all' | 'active' | 'blocked'): boolean | undefined => {
    if (filter === 'active') return true;
    if (filter === 'blocked') return false;
    return undefined;
  }, []);

  // Track if initial load has happened using ref to avoid re-renders
  const isInitialLoadRef = React.useRef(true);

  useEffect(() => {
    // Fetch ranks first, then fetch users
    const init = async () => {
      await fetchRanks();
      fetchUsers(0, serverPageSize, '', undefined);
    };
    init();
    // Mark initial load as complete after a small delay
    setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search effect - only runs after initial load
  useEffect(() => {
    if (isInitialLoadRef.current) return;
    
    const timeoutId = setTimeout(() => {
      fetchUsers(0, serverPageSize, searchTerm, getIsActiveFromFilter(statusFilter));
    }, 300);
    
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter]);

  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('joinDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Client-side pagination for filtered results
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Handle server page size change
  const handleServerPageSizeChange = useCallback((newPageSize: number) => {
    setServerPageSize(newPageSize);
    setItemsPerPage(newPageSize);
    fetchUsers(0, newPageSize, searchTerm, getIsActiveFromFilter(statusFilter));
  }, [fetchUsers, searchTerm, statusFilter, getIsActiveFromFilter]);

  // Handle server page change
  const handleServerPageChange = useCallback((newPage: number) => {
    fetchUsers(newPage, serverPageSize, searchTerm, getIsActiveFromFilter(statusFilter));
  }, [fetchUsers, serverPageSize, searchTerm, statusFilter, getIsActiveFromFilter]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((filter: 'all' | 'active' | 'blocked') => {
    setStatusFilter(filter);
  }, []);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [isFilteringData, setIsFilteringData] = useState(false);

  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users
      .filter(user => {
        // Exclude admin users from the list
        const isNotAdmin = user.role !== 'Admin' && user.role !== 'ADMIN' && !user.email?.toLowerCase().includes('admin');
        
        // Role filter (client-side only since backend doesn't support it)
        const matchesRole = roleFilter === '' ||
                           (roleFilter === 'customer' && user.role === 'Customer') ||
                           (roleFilter === 'vip' && user.role === 'VIP Customer');

        return isNotAdmin && matchesRole;
      })
      .sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'joinDate':
            comparison = new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
            break;
          case 'lastLogin':
            comparison = new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime();
            break;
          case 'totalOrders':
            comparison = a.totalOrders - b.totalOrders;
            break;
          case 'totalSpent':
            comparison = a.totalSpent - b.totalSpent;
            break;
          default:
            comparison = 0;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });

    return filtered;
  }, [users, roleFilter, sortBy, sortOrder]);

  // Handle filtering state in useEffect instead of useMemo
  useEffect(() => {
    setIsFilteringData(true);
    const timer = setTimeout(() => setIsFilteringData(false), 150);
    return () => clearTimeout(timer);
  }, [roleFilter, sortBy, sortOrder]);

  // Server-side filtering is now used for search and status
  const isFiltering = !!roleFilter;
  
  const totalItems = isFiltering ? filteredAndSortedUsers.length : serverTotalItems;
  const totalPages = isFiltering ? Math.ceil(filteredAndSortedUsers.length / itemsPerPage) : serverTotalPages;
  const startIndex = isFiltering ? (currentPage - 1) * itemsPerPage : serverPage * serverPageSize;
  const endIndex = startIndex + (isFiltering ? itemsPerPage : serverPageSize);
  const currentUsers = isFiltering 
    ? filteredAndSortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredAndSortedUsers;

  const goToPage = (page: number) => {
    if (isFiltering) {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    } else {
      // Server-side: page is 0-based
      handleServerPageChange(page - 1);
    }
  };

  const goToPrevPage = () => {
    if (isFiltering) {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } else {
      if (hasPrevious) {
        handleServerPageChange(serverPage - 1);
      }
    }
  };

  const goToNextPage = () => {
    if (isFiltering) {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    } else {
      if (hasNext) {
        handleServerPageChange(serverPage + 1);
      }
    }
  };

  // Reset to first page when role filter changes (client-side only)
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter]);

  // Current page for display (1-based)
  const displayCurrentPage = isFiltering ? currentPage : serverPage + 1;

  const handleExportExcel = () => {
    try {
      // Kiểm tra nếu không có dữ liệu để export
      if (!filteredAndSortedUsers || filteredAndSortedUsers.length === 0) {
        showWarning('No data to export', 'There are no users to export. Please check your filters.');
        return;
      }

      const exportData = filteredAndSortedUsers.map((user, index) => ({
        'No.': index + 1,
        'Full name': user.name,
        'Email': user.email,
        'Role': user.role,
        'Status': user.status,
        'Join date': new Date(user.joinDate).toLocaleDateString('en-US'),
        'Last login': new Date(user.lastLogin).toLocaleDateString('en-US'),
        'Total orders': user.totalOrders,
        'Total spending (VND)': user.totalSpent.toLocaleString('en-US')
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([]);

      // Thiết lập độ rộng cột
      const colWidths = [
        { wch: 6 },
        { wch: 25 },
        { wch: 30 },
        { wch: 15 },
        { wch: 16 },
        { wch: 16 },
        { wch: 20 },
        { wch: 14 },
        { wch: 20 }
      ];
      ws['!cols'] = colWidths;

      // Thêm header thông tin trước
      XLSX.utils.sheet_add_aoa(ws, [
        ['FIT ECOMMERCE ADMIN'],
        ['USERS REPORT'],
        [`Export date: ${new Date().toLocaleDateString('en-US')}`],
        [`Total users: ${exportData.length}`],
        [''],
      ], { origin: 'A1' });

      // Thêm headers cho dữ liệu
      const headers = Object.keys(exportData[0]);
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A6' });
      
      // Thêm dữ liệu từ hàng 7 trở đi
      exportData.forEach((row, index) => {
        const rowData = headers.map(header => row[header as keyof typeof row]);
        XLSX.utils.sheet_add_aoa(ws, [rowData], { origin: `A${7 + index}` });
      });

      type CellStyle = {
        font?: { bold?: boolean; sz?: number; color?: { rgb: string } };
        fill?: { fgColor: { rgb: string } };
        alignment?: { horizontal?: string; vertical?: string };
        border?: {
          top?: { style: string; color: { rgb: string } };
          bottom?: { style: string; color: { rgb: string } };
          left?: { style: string; color: { rgb: string } };
          right?: { style: string; color: { rgb: string } };
        };
      };

      const headerStyle: CellStyle = {
        font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4F46E5' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };

      const titleStyle: CellStyle = {
        font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '312E81' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };

      ['A1','B1','C1','D1','E1','F1','G1','H1','I1'].forEach(cell => {
        if (!ws[cell]) ws[cell] = {};
        ws[cell].s = titleStyle;
      });

      for (let row = 2; row <= 4; row++) {
        ['A','B','C','D','E','F','G','H','I'].forEach(col => {
          const cellRef = col + row;
          if (!ws[cellRef]) ws[cellRef] = {};
          ws[cellRef].s = headerStyle;
        });
      }

      const columnHeaderStyle: CellStyle = {
        font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '059669' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: { top: { style: 'thin', color: { rgb: '000000' } }, bottom: { style: 'thin', color: { rgb: '000000' } }, left: { style: 'thin', color: { rgb: '000000' } }, right: { style: 'thin', color: { rgb: '000000' } } },
      };

      headers.forEach((_, index) => {
        const cellRef = String.fromCharCode(65 + index) + '6';
        if (!ws[cellRef]) ws[cellRef] = {};
        ws[cellRef].s = columnHeaderStyle;
      });

      const evenRowStyle: CellStyle = { fill: { fgColor: { rgb: 'F8FAFC' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: { top: { style: 'thin', color: { rgb: 'E2E8F0' } }, bottom: { style: 'thin', color: { rgb: 'E2E8F0' } }, left: { style: 'thin', color: { rgb: 'E2E8F0' } }, right: { style: 'thin', color: { rgb: 'E2E8F0' } } } };
      const oddRowStyle: CellStyle = { fill: { fgColor: { rgb: 'FFFFFF' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: { top: { style: 'thin', color: { rgb: 'E2E8F0' } }, bottom: { style: 'thin', color: { rgb: 'E2E8F0' } }, left: { style: 'thin', color: { rgb: 'E2E8F0' } }, right: { style: 'thin', color: { rgb: 'E2E8F0' } } } };

      exportData.forEach((_, rowIndex) => {
        const isEven = rowIndex % 2 === 0;
        const style = isEven ? evenRowStyle : oddRowStyle;
        headers.forEach((_, colIndex) => {
          const cellRef = String.fromCharCode(65 + colIndex) + (7 + rowIndex);
          if (!ws[cellRef]) ws[cellRef] = {};
          ws[cellRef].s = style;
        });
      });

      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 8 } },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Users');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const currentDate = new Date().toLocaleDateString('en-US').replace(/\//g, '-');
      const filename = `Users_List_${currentDate}.xlsx`;
      saveAs(data, filename);

      showSuccess('Export successful!', `Exported ${exportData.length} users to Excel: ${filename}`);
    } catch {
      showError('Export error', 'An error occurred while exporting Excel. Please try again.');
    }
  };

  const coerceStatus = (status: string): User['status'] => {
    return status === 'Active' || status === 'Inactive' || status === 'Blocked' ? status : 'Active';
  };

  const convertModalUserToTyped = (modalUser: User): User => {
    const typed: User = {
      id: modalUser.id,
      name: modalUser.name,
      email: modalUser.email,
      role: modalUser.role,
      status: coerceStatus(modalUser.status),
      joinDate: modalUser.joinDate,
      lastLogin: modalUser.lastLogin,
      totalOrders: modalUser.totalOrders,
      totalSpent: modalUser.totalSpent,
      phone: modalUser.phone ?? '',
      firstName: modalUser.firstName ?? '',
      lastName: modalUser.lastName ?? '',
      avatar: modalUser.avatar ?? '',
      username: modalUser.username ?? '',
    };
    return typed;
  };

  const handleAddUser = (newUser: User) => {
    const typed = convertModalUserToTyped(newUser);
    setUsers(prev => [...prev, typed]);
  };

  const handleToggleUserStatus = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setLockModalOpen(true);
    }
  };

  const handleLockAction = async (userId: number, action: 'lock' | 'unlock') => {
    try {
      const isActive = action === 'unlock';
      const response = await userApi.toggleUserActiveStatus(userId, isActive);
      if (response.success && response.data) {
        const updatedBackendUser = response.data;
        const convertedUser = convertBackendUserToUser(updatedBackendUser);
        // Map rankName from ranksMap if not provided
        if (!convertedUser.rankName && updatedBackendUser.rankId) {
          convertedUser.rankName = ranksMapRef.current.get(updatedBackendUser.rankId) || undefined;
        }
        setUsers(prev => prev.map(user => user.id === userId ? convertedUser : user));
        if (action === 'lock') {
          showWarning('Account locked successfully!', 'The user account has been locked.');
        } else {
          showSuccess('Unlocked successfully!', 'The user account has been unlocked.');
        }
      } else {
        showError('An error occurred', response.message || 'Unable to perform this action. Please try again.');
      }
    } catch {
      showError('System error', 'An error occurred while performing the action. Please try again later.');
    }
  };

  const handleDeleteUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      showWarning('Feature under development', 'User deletion will be added in a future release.');
    }
  };

  const vm = {
    users,
    isLoading: displayLoading,
    apiError,
    searchTerm,
    statusFilter,
    roleFilter,
    sortBy,
    sortOrder,
    currentPage: displayCurrentPage,
    itemsPerPage,
    addModalOpen,
    viewModalOpen,
    lockModalOpen,
    selectedUser,
    isFilteringData,
    filteredAndSortedUsers,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    currentUsers,
    // Server pagination info
    serverPage,
    serverPageSize,
    hasNext,
    hasPrevious,
    isFiltering,
  };

  const handlers = {
    setSearchTerm,
    setStatusFilter: handleStatusFilterChange,
    setRoleFilter,
    setSortBy,
    setSortOrder,
    setItemsPerPage: handleServerPageSizeChange,
    setCurrentPage,
    setAddModalOpen,
    setViewModalOpen,
    setLockModalOpen,
    setSelectedUser,
    fetchUsers: () => fetchUsers(serverPage, serverPageSize, searchTerm, getIsActiveFromFilter(statusFilter)),
    goToPrevPage,
    goToNextPage,
    goToPage,
    handleExportExcel,
    handleAddUser,
    handleToggleUserStatus,
    handleDeleteUser,
    handleLockAction,
  };

  return (
    <>
      {/* Keep existing modals mounted here to retain context/state */}
      <AddUserModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onSave={handleAddUser} />
      <ViewUserModal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} user={selectedUser} />
      <LockUserModal isOpen={lockModalOpen} onClose={() => setLockModalOpen(false)} user={selectedUser} onConfirm={handleLockAction} />

      <UsersPresenter vm={vm} handlers={handlers} />
    </>
  );
};

export default UsersContainer;


