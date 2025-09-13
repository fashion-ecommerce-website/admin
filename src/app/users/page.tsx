'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { AddUserModal, ViewUserModal, EditUserModal, LockUserModal } from '@/components/modals/UserModals';
import { useState, useMemo, useEffect } from 'react';
import { useToast } from '@/providers/ToastProvider';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { userApi } from '@/services/api/userApi';
import { User, convertBackendUserToUser } from '@/types/user.types';

export default function UsersPage() {
  const { showSuccess, showError, showWarning } = useToast();
  
  // State for API data
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      
      const response = await userApi.getAllUsers();
      
      if (response.success && response.data) {
        // Convert backend users to frontend format
        const convertedUsers = response.data.users.map(convertBackendUserToUser);
        setUsers(convertedUsers);
        console.log('Fetched users from API:', convertedUsers);
      } else {
        setApiError(response.message || 'Failed to fetch users');
        showError('Lỗi tải dữ liệu', response.message || 'Không thể tải danh sách người dùng từ server');
        
        // For testing pagination, add some mock data when API fails
        const mockUsers = Array.from({ length: 15 }, (_, index) => ({
          id: index + 1,
          name: `Test User ${index + 1}`,
          email: `user${index + 1}@example.com`,
          role: index % 3 === 0 ? 'VIP Customer' : 'Customer',
          status: index % 4 === 0 ? 'Blocked' : (index % 2 === 0 ? 'Inactive' : 'Active'),
          joinDate: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
          lastLogin: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
          totalOrders: Math.floor(Math.random() * 50),
          totalSpent: Math.floor(Math.random() * 1000000),
          phone: '',
          firstName: '',
          lastName: '',
          avatar: '',
          username: `user${index + 1}`,
        } as User));
        setUsers(mockUsers);
        console.log('Using mock data for pagination testing:', mockUsers);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      showError('Lỗi kết nối', 'Không thể kết nối đến server. Vui lòng thử lại.');
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter and Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('joinDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Set to 5 to force pagination with current data

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Filter and sort logic with loading state
  const [isFilteringData, setIsFilteringData] = useState(false);
  
  const filteredAndSortedUsers = useMemo(() => {
    setIsFilteringData(true);
    
    const filtered = users
      .filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' || 
                             (statusFilter === 'active' && user.status === 'Active') ||
                             (statusFilter === 'inactive' && user.status === 'Inactive') ||
                             (statusFilter === 'blocked' && user.status === 'Blocked');
        const matchesRole = roleFilter === '' ||
                           (roleFilter === 'customer' && user.role === 'Customer') ||
                           (roleFilter === 'vip' && user.role === 'VIP Customer');
        
        return matchesSearch && matchesStatus && matchesRole;
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

    // Simulate brief loading for smooth transition
    setTimeout(() => setIsFilteringData(false), 150);
    
    return filtered;
  }, [users, searchTerm, statusFilter, roleFilter, sortBy, sortOrder]);

  // Pagination logic
  const totalItems = filteredAndSortedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  // Pagination helpers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, roleFilter]);

  // Export to Excel function with beautiful styling
  const handleExportExcel = () => {
    try {
      // Prepare data for export with Vietnamese headers
      const exportData = filteredAndSortedUsers.map((user, index) => ({
        'STT': index + 1,
        'Họ và tên': user.name,
        'Email': user.email,
        'Vai trò': user.role === 'Admin' ? 'Quản trị viên' : 
                  user.role === 'Manager' ? 'Quản lý' : 'Khách hàng',
        'Trạng thái': user.status === 'Active' ? 'Hoạt động' : 
                     user.status === 'Inactive' ? 'Không hoạt động' : 'Đã khóa',
        'Ngày tham gia': new Date(user.joinDate).toLocaleDateString('vi-VN'),
        'Lần đăng nhập cuối': new Date(user.lastLogin).toLocaleDateString('vi-VN'),
        'Tổng đơn hàng': user.totalOrders,
        'Tổng chi tiêu (VNĐ)': user.totalSpent.toLocaleString('vi-VN')
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths for better presentation
      const colWidths = [
        { wch: 6 },   // STT
        { wch: 25 },  // Họ và tên
        { wch: 30 },  // Email
        { wch: 15 },  // Vai trò
        { wch: 16 },  // Trạng thái
        { wch: 16 },  // Ngày tham gia
        { wch: 20 },  // Lần đăng nhập cuối
        { wch: 14 },  // Tổng đơn hàng
        { wch: 20 }   // Tổng chi tiêu
      ];
      ws['!cols'] = colWidths;

      // Add title row with company info
      XLSX.utils.sheet_add_aoa(ws, [
        ['FASHION ECOMMERCE ADMIN'],
        ['BÁO CÁO DANH SÁCH NGƯỜI DÙNG'],
        [`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
        [`Tổng số người dùng: ${exportData.length}`],
        [''], // Empty row for spacing
      ], { origin: 'A1' });

      // Shift existing data down
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      range.e.r += 5;
      ws['!ref'] = XLSX.utils.encode_range(range);

      // Move data down to make room for header
      const headers = Object.keys(exportData[0]);
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A6' });
      
      // Add data starting from row 7
      exportData.forEach((row, index) => {
        const rowData = headers.map(header => row[header as keyof typeof row]);
        XLSX.utils.sheet_add_aoa(ws, [rowData], { origin: `A${7 + index}` });
      });

      // Style the header rows (A1:I5)
      const headerStyle = {
        font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F46E5" } }, // Indigo background
        alignment: { horizontal: "center", vertical: "center" }
      };

      const titleStyle = {
        font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "312E81" } }, // Darker indigo
        alignment: { horizontal: "center", vertical: "center" }
      };

      // Apply title style to first row
      ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1'].forEach(cell => {
        if (!ws[cell]) ws[cell] = {};
        ws[cell].s = titleStyle;
      });

      // Apply header style to info rows
      for (let row = 2; row <= 4; row++) {
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].forEach(col => {
          const cellRef = col + row;
          if (!ws[cellRef]) ws[cellRef] = {};
          ws[cellRef].s = headerStyle;
        });
      }

      // Style the column headers (row 6)
      const columnHeaderStyle = {
        font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "059669" } }, // Emerald green
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };

      headers.forEach((_, index) => {
        const cellRef = String.fromCharCode(65 + index) + '6';
        if (!ws[cellRef]) ws[cellRef] = {};
        ws[cellRef].s = columnHeaderStyle;
      });

      // Style data rows with alternating colors
      const evenRowStyle = {
        fill: { fgColor: { rgb: "F8FAFC" } }, // Light gray
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "E2E8F0" } },
          bottom: { style: "thin", color: { rgb: "E2E8F0" } },
          left: { style: "thin", color: { rgb: "E2E8F0" } },
          right: { style: "thin", color: { rgb: "E2E8F0" } }
        }
      };

      const oddRowStyle = {
        fill: { fgColor: { rgb: "FFFFFF" } }, // White
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "E2E8F0" } },
          bottom: { style: "thin", color: { rgb: "E2E8F0" } },
          left: { style: "thin", color: { rgb: "E2E8F0" } },
          right: { style: "thin", color: { rgb: "E2E8F0" } }
        }
      };

      // Apply alternating row styles to data
      exportData.forEach((_, rowIndex) => {
        const isEven = rowIndex % 2 === 0;
        const style = isEven ? evenRowStyle : oddRowStyle;
        
        headers.forEach((_, colIndex) => {
          const cellRef = String.fromCharCode(65 + colIndex) + (7 + rowIndex);
          if (!ws[cellRef]) ws[cellRef] = {};
          ws[cellRef].s = style;
        });
      });

      // Merge title cells for better appearance
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // Merge A1:I1
        { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }, // Merge A2:I2
        { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } }, // Merge A3:I3
        { s: { r: 3, c: 0 }, e: { r: 3, c: 8 } }  // Merge A4:I4
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách người dùng');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create filename with current date
      const currentDate = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
      const filename = `Danh_sach_nguoi_dung_${currentDate}.xlsx`;
      
      // Save file
      saveAs(data, filename);
      
      console.log(`Exported ${exportData.length} users to Excel file: ${filename}`);
      showSuccess(
        'Xuất Excel thành công!',
        `Đã xuất ${exportData.length} người dùng ra file Excel với định dạng đẹp: ${filename}`
      );
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showError(
        'Lỗi xuất Excel',
        'Có lỗi xảy ra khi xuất file Excel. Vui lòng thử lại.'
      );
    }
  };

  const handleAddUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    console.log('Added user:', newUser);
    // Optionally refresh from API
    // fetchUsers();
  };

  const handleEditUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setEditModalOpen(true);
    }
  };

  const handleSaveEdit = (updatedUser: User) => {
    setUsers(prev => prev.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
    console.log('Updated user:', updatedUser);
    // Optionally refresh from API
    // fetchUsers();
  };

  const handleToggleUserStatus = (userId: number, currentStatus: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setLockModalOpen(true);
    }
  };

  const handleLockAction = (userId: number, action: 'lock' | 'unlock') => {
    const newStatus: 'Active' | 'Inactive' | 'Blocked' = action === 'lock' ? 'Blocked' : 'Active';
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    console.log(`${action} user:`, userId);
    // Optionally update via API
    // userApi.updateUserStatus(userId, newStatus);
  };

  const handleDeleteUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      // For now, we'll just show a warning toast instead of actually deleting
      showWarning(
        'Tính năng đang phát triển',
        'Chức năng xóa người dùng sẽ được bổ sung trong phiên bản tiếp theo.'
      );
    }
  };

  const handleViewDetails = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setViewModalOpen(true);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fadeInUp">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Quản lý người dùng
            </h1>
            <div className="flex items-center space-x-2 mt-2">
              <p className="text-gray-600">Quản lý thông tin và quyền hạn người dùng trong hệ thống</p>
              {isLoading && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-sm">Đang tải dữ liệu...</span>
                </div>
              )}
              {apiError && (
                <div className="flex items-center space-x-1 text-red-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">Lỗi kết nối API</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleExportExcel}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <span>Xuất Excel</span>
              </div>
            </button>
            <button 
              onClick={() => setAddModalOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Thêm người dùng</span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50 overflow-hidden group">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Tổng người dùng</p>
                  <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
                  <div className="flex items-center space-x-1 text-sm font-medium text-green-600 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>12.5%</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50 overflow-hidden group">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Hoạt động</p>
                  <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.status === 'Active').length}</p>
                  <div className="flex items-center space-x-1 text-sm font-medium text-green-600 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>8.2%</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50 overflow-hidden group">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">VIP Customer</p>
                  <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.role === 'VIP Customer').length}</p>
                  <div className="flex items-center space-x-1 text-sm font-medium text-green-600 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>15.3%</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-600 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50 overflow-hidden group">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Bị khóa</p>
                  <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.status === 'Blocked').length}</p>
                  <div className="flex items-center space-x-1 text-sm font-medium text-red-600 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span>-2.1%</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-orange-500 to-red-600 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transform transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 py-3 w-full sm:w-80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white focus:bg-white text-gray-900 placeholder-gray-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="relative group">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:bg-white focus:bg-white text-gray-900 min-w-[160px]"
                >
                  <option value="" className="text-gray-900">Tất cả trạng thái</option>
                  <option value="active" className="text-gray-900">Hoạt động</option>
                  <option value="inactive" className="text-gray-900">Không hoạt động</option>
                  <option value="blocked" className="text-gray-900">Đã khóa</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Role Filter */}
              <div className="relative group">
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:bg-white focus:bg-white text-gray-900 min-w-[140px]"
                >
                  <option value="" className="text-gray-900">Tất cả vai trò</option>
                  <option value="customer" className="text-gray-900">Customer</option>
                  <option value="vip" className="text-gray-900">VIP Customer</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || statusFilter || roleFilter) && (
              <div className="animate-fadeIn">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setRoleFilter('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 hover:text-gray-800 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Xóa bộ lọc</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Danh sách người dùng</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} trên tổng số {totalItems} người dùng
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-900">Hiển thị:</span>
                  <select 
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-900">Sắp xếp theo:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border-0 bg-transparent text-gray-900 font-medium focus:ring-0"
                  >
                    <option value="joinDate" className="text-gray-900">Ngày tham gia</option>
                    <option value="name" className="text-gray-900">Tên A-Z</option>
                    <option value="lastLogin" className="text-gray-900">Hoạt động gần nhất</option>
                    <option value="totalOrders" className="text-gray-900">Số đơn hàng</option>
                    <option value="totalSpent" className="text-gray-900">Tổng chi tiêu</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  >
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vai trò</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hoạt động</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thống kê</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-100 transition-opacity duration-300 ${isFilteringData || isLoading ? 'opacity-50' : 'opacity-100'}`}>
                {isLoading ? (
                  // API Loading state
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`api-loading-${index}`} className="animate-pulse">
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                          <div className="ml-4 space-y-2">
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                            <div className="h-3 w-40 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                          <div className="h-3 w-20 bg-gray-200 rounded"></div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-2">
                          <div className="h-4 w-16 bg-gray-200 rounded"></div>
                          <div className="h-3 w-20 bg-gray-200 rounded"></div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex justify-end space-x-2">
                          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : apiError ? (
                  // API Error state
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
                          <p className="text-gray-500 mb-4">{apiError}</p>
                          <button
                            onClick={fetchUsers}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                          >
                            Thử lại
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : isFilteringData ? (
                  // Loading state
                  Array.from({ length: 3 }).map((_, index) => (
                    <tr key={`loading-${index}`} className="animate-pulse">
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                          <div className="ml-4 space-y-2">
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                            <div className="h-3 w-40 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                          <div className="h-3 w-20 bg-gray-200 rounded"></div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-2">
                          <div className="h-4 w-16 bg-gray-200 rounded"></div>
                          <div className="h-3 w-20 bg-gray-200 rounded"></div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex justify-end space-x-2">
                          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : currentUsers.length === 0 ? (
                  // Empty state
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy người dùng</h3>
                          <p className="text-gray-500">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                        </div>
                        {(searchTerm || statusFilter || roleFilter) && (
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setStatusFilter('');
                              setRoleFilter('');
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                          >
                            Xóa tất cả bộ lọc
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user: User, index: number) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-gray-50/50 transition-all duration-300 group animate-slideInUp border-b border-gray-100/50 hover:border-indigo-100 hover:shadow-sm" 
                      style={{ 
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className={`h-12 w-12 ${
                              user.role === 'VIP Customer' 
                                ? 'bg-gradient-to-r from-purple-500 to-pink-600' 
                                : 'bg-gradient-to-r from-indigo-500 to-blue-600'
                            } rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                              <span className="text-white font-bold text-lg">{user.name.charAt(0)}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                              </svg>
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                          user.role === 'VIP Customer' 
                            ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200' 
                            : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                        }`}>
                          {user.role === 'VIP Customer' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          )}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            user.status === 'Active' ? 'bg-green-500' : 
                            user.status === 'Inactive' ? 'bg-yellow-500' : 'bg-red-500'
                          } animate-pulse`}></div>
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                            user.status === 'Active' 
                              ? 'bg-green-100 text-green-800 border border-green-200' :
                            user.status === 'Inactive'
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {user.status === 'Active' ? 'Hoạt động' : user.status === 'Inactive' ? 'Không hoạt động' : 'Đã khóa'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center space-x-1 mb-1">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs text-gray-500">
                              {new Date(user.lastLogin).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            Tham gia: {new Date(user.joinDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm">
                          <div className="flex items-center space-x-2 mb-1">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span className="text-gray-900 font-medium">{user.totalOrders} đơn</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span className="text-xs text-gray-500">{user.totalSpent.toLocaleString('vi-VN')} VNĐ</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-end space-x-2">
                          {/* View Details */}
                          <button
                            onClick={() => handleViewDetails(user.id)}
                            className="group relative p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md border border-blue-100 hover:border-blue-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {/* Edit User */}
                          <button
                            onClick={() => handleEditUser(user.id)}
                            className="group relative p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md border border-indigo-100 hover:border-indigo-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {/* Toggle Status */}
                          <button
                            onClick={() => handleToggleUserStatus(user.id, user.status)}
                            className={`group relative p-2.5 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md border ${
                              user.status === 'Blocked'
                                ? 'bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-100 hover:border-green-200'
                                : 'bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 border-amber-100 hover:border-amber-200'
                            }`}
                          >
                            {user.status === 'Blocked' ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            )}
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="group relative p-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md border border-red-100 hover:border-red-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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

        {/* Pagination Section - Always visible */}
        {totalItems > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-semibold text-indigo-600">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span> trên <span className="font-semibold text-gray-900">{totalItems}</span> người dùng
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Hiển thị:</span>
                  <select 
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-600">/ trang</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center sm:justify-end space-x-2">
                {/* Previous Button */}
                <button 
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Trước</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {(() => {
                    const pages = [];
                    const startPage = Math.max(1, currentPage - 2);
                    const endPage = Math.min(totalPages, currentPage + 2);

                    // Show first page if we're not close to it
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => goToPage(1)}
                          className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          1
                        </button>
                      );
                      if (startPage > 2) {
                        pages.push(
                          <span key="start-ellipsis" className="px-2 text-gray-400">...</span>
                        );
                      }
                    }

                    // Show current page range
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => goToPage(i)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
                            i === currentPage
                              ? 'text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg'
                              : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }

                    // Show last page if we're not close to it
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="end-ellipsis" className="px-2 text-gray-400">...</span>
                        );
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => goToPage(totalPages)}
                          className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}
                </div>

                {/* Next Button */}
                <button 
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
                >
                  <span className="hidden sm:inline">Tiếp</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modals - Temporarily disabled Add and Edit modals due to type conflicts */}
        
        <ViewUserModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          user={selectedUser}
        />

        <LockUserModal
          isOpen={lockModalOpen}
          onClose={() => setLockModalOpen(false)}
          user={selectedUser}
          onConfirm={handleLockAction}
        />
      </div>
    </AdminLayout>
  );
}
