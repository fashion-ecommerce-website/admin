'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useToast } from '@/providers/ToastProvider';
import { useMinimumLoadingTime } from '@/hooks/useMinimumLoadingTime';
import { DashboardPresenter } from '../components/DashboardPresenter';
import { fetchDashboardRequest } from '../redux/dashboardSlice';
import type { RootState } from '@/store';

interface AggregatedChartData {
  label: string;
  date: string;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  paidRevenue: number;
  unpaidRevenue: number;
  refundedRevenue: number;
}

export const DashboardContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { showSuccess, showError, showWarning } = useToast();
  const { data, stats, loading, error } = useSelector((state: RootState) => state.dashboard);
  const displayLoading = useMinimumLoadingTime(loading, 300);
  const [currentPeriod, setCurrentPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial load with new API
    dispatch(fetchDashboardRequest(currentPeriod));

    // Set up auto-refresh every 5 minutes
    intervalRef.current = setInterval(() => {
      dispatch(fetchDashboardRequest(currentPeriod));
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dispatch, currentPeriod]);

  const handleRefresh = () => {
    dispatch(fetchDashboardRequest(currentPeriod));
  };

  const handlePeriodChange = (newPeriod: 'day' | 'week' | 'month' | 'year') => {
    setCurrentPeriod(newPeriod);
  };

  const handleExportExcel = () => {
    try {
      // Kiểm tra nếu không có dữ liệu để export
      if (!data || !data.chartData || data.chartData.length === 0) {
        showWarning('No data to export', 'There is no dashboard data to export. Please try again later.');
        return;
      }

      // Aggregate data nếu là month hoặc year (giống logic trong Presenter)
      let processedData = data.chartData;
      
      if (currentPeriod === 'month') {
        // Group by week
        const weeklyMap: Record<string, AggregatedChartData> = {};
        processedData.forEach((item, index) => {
          const weekNumber = Math.floor(index / 7);
          const weekKey = `Week ${weekNumber + 1}`;
          
          if (!weeklyMap[weekKey]) {
            weeklyMap[weekKey] = {
              label: weekKey,
              date: '',
              totalOrders: 0,
              completedOrders: 0,
              pendingOrders: 0,
              cancelledOrders: 0,
              totalRevenue: 0,
              paidRevenue: 0,
              unpaidRevenue: 0,
              refundedRevenue: 0,
            };
          }
          
          weeklyMap[weekKey].totalOrders += item.totalOrders;
          weeklyMap[weekKey].completedOrders += item.completedOrders || 0;
          weeklyMap[weekKey].pendingOrders += item.pendingOrders || 0;
          weeklyMap[weekKey].cancelledOrders += item.cancelledOrders || 0;
          weeklyMap[weekKey].totalRevenue += item.totalRevenue;
          weeklyMap[weekKey].paidRevenue += item.paidRevenue || 0;
          weeklyMap[weekKey].unpaidRevenue += item.unpaidRevenue || 0;
          weeklyMap[weekKey].refundedRevenue += item.refundedRevenue || 0;
        });
        processedData = Object.values(weeklyMap);
      } else if (currentPeriod === 'year') {
        // Group by month
        const currentYear = new Date().getFullYear();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyMap: Map<number, AggregatedChartData> = new Map();
        
        processedData.forEach((item) => {
          const dateStr = item.date || item.label;
          const date = new Date(dateStr);
          
          if (date.getFullYear() !== currentYear) return;
          
          const monthIndex = date.getMonth();
          
          if (!monthlyMap.has(monthIndex)) {
            monthlyMap.set(monthIndex, {
              label: monthNames[monthIndex],
              date: '',
              totalOrders: 0,
              completedOrders: 0,
              pendingOrders: 0,
              cancelledOrders: 0,
              totalRevenue: 0,
              paidRevenue: 0,
              unpaidRevenue: 0,
              refundedRevenue: 0,
            });
          }
          
          const monthData = monthlyMap.get(monthIndex)!;
          monthData.totalOrders += item.totalOrders;
          monthData.completedOrders += item.completedOrders || 0;
          monthData.pendingOrders += item.pendingOrders || 0;
          monthData.cancelledOrders += item.cancelledOrders || 0;
          monthData.totalRevenue += item.totalRevenue;
          monthData.paidRevenue += item.paidRevenue || 0;
          monthData.unpaidRevenue += item.unpaidRevenue || 0;
          monthData.refundedRevenue += item.refundedRevenue || 0;
        });
        
        processedData = Array.from(monthlyMap.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([, data]) => data);
      }

      // Chuẩn bị dữ liệu export từ processed data
      const exportData = processedData.map((item, index) => ({
        'No.': index + 1,
        'Date': item.label,
        'Total Orders': item.totalOrders,
        'Completed Orders': item.completedOrders,
        'Pending Orders': item.pendingOrders,
        'Cancelled Orders': item.cancelledOrders,
        'Total Revenue (VND)': item.totalRevenue.toLocaleString('en-US'),
        'Paid Revenue (VND)': item.paidRevenue.toLocaleString('en-US'),
        'Unpaid Revenue (VND)': item.unpaidRevenue.toLocaleString('en-US'),
        'Refunded Revenue (VND)': item.refundedRevenue.toLocaleString('en-US'),
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([]);

      // Thiết lập độ rộng cột
      const colWidths = [
        { wch: 6 },   // No.
        { wch: 20 },  // Date
        { wch: 15 },  // Total Orders
        { wch: 18 },  // Completed
        { wch: 16 },  // Pending
        { wch: 17 },  // Cancelled
        { wch: 22 },  // Total Revenue
        { wch: 20 },  // Paid Revenue
        { wch: 22 },  // Unpaid Revenue
        { wch: 23 },  // Refunded Revenue
      ];
      ws['!cols'] = colWidths;

      // Thêm header thông tin
      XLSX.utils.sheet_add_aoa(ws, [
        ['FASHION ECOMMERCE ADMIN'],
        ['DASHBOARD REPORT'],
        [`Export date: ${new Date().toLocaleDateString('en-US')}`],
        [`Period: ${currentPeriod.toUpperCase()}`],
        [''],
        ['SUMMARY STATISTICS'],
        [`Total Users: ${data.summary.totalUsers}`],
        [`Total Products: ${data.summary.totalProducts}`],
        [`Total Orders: ${data.summary.totalOrders}`],
        [`Total Revenue: ${data.summary.totalRevenue.toLocaleString('en-US')} VND`],
        [''],
        ['DETAILED DATA'],
        [''],
      ], { origin: 'A1' });

      // Thêm headers cho dữ liệu
      const headers = Object.keys(exportData[0]);
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A14' });
      
      // Thêm dữ liệu từ hàng 15 trở đi
      exportData.forEach((row, index) => {
        const rowData = headers.map(header => row[header as keyof typeof row]);
        XLSX.utils.sheet_add_aoa(ws, [rowData], { origin: `A${15 + index}` });
      });

      // Styling
      interface CellStyle {
        font?: { bold?: boolean; sz?: number; color?: { rgb: string } };
        fill?: { fgColor?: { rgb: string } };
        alignment?: { horizontal?: string; vertical?: string };
        border?: {
          top?: { style: string; color: { rgb: string } };
          bottom?: { style: string; color: { rgb: string } };
          left?: { style: string; color: { rgb: string } };
          right?: { style: string; color: { rgb: string } };
        };
      }
      
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

      const summaryTitleStyle: CellStyle = {
        font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '7C3AED' } },
        alignment: { horizontal: 'left', vertical: 'center' },
      };

      const summaryStyle: CellStyle = {
        font: { bold: true, sz: 12, color: { rgb: '1F2937' } },
        fill: { fgColor: { rgb: 'EDE9FE' } },
        alignment: { horizontal: 'left', vertical: 'center' },
      };

      const sectionTitleStyle: CellStyle = {
        font: { bold: true, sz: 13, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '059669' } },
        alignment: { horizontal: 'left', vertical: 'center' },
      };

      // Style cho title row (A1-J1)
      ['A1','B1','C1','D1','E1','F1','G1','H1','I1','J1'].forEach(cell => {
        if (!ws[cell]) ws[cell] = {};
        ws[cell].s = titleStyle;
      });

      // Style cho header info (rows 2-4)
      for (let row = 2; row <= 4; row++) {
        ['A','B','C','D','E','F','G','H','I','J'].forEach(col => {
          const cellRef = col + row;
          if (!ws[cellRef]) ws[cellRef] = {};
          ws[cellRef].s = headerStyle;
        });
      }

      // Style cho "SUMMARY STATISTICS" title (row 6)
      ['A6','B6','C6','D6','E6','F6','G6','H6','I6','J6'].forEach(cell => {
        if (!ws[cell]) ws[cell] = {};
        ws[cell].s = summaryTitleStyle;
      });

      // Style cho summary data (rows 7-10)
      for (let row = 7; row <= 10; row++) {
        ['A','B','C','D','E','F','G','H','I','J'].forEach(col => {
          const cellRef = col + row;
          if (!ws[cellRef]) ws[cellRef] = {};
          ws[cellRef].s = summaryStyle;
        });
      }

      // Style cho "DETAILED DATA" title (row 12)
      ['A12','B12','C12','D12','E12','F12','G12','H12','I12','J12'].forEach(cell => {
        if (!ws[cell]) ws[cell] = {};
        ws[cell].s = sectionTitleStyle;
      });

      // Style cho column headers (row 14)
      const columnHeaderStyle: CellStyle = {
        font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '059669' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: { 
          top: { style: 'thin', color: { rgb: '000000' } }, 
          bottom: { style: 'thin', color: { rgb: '000000' } }, 
          left: { style: 'thin', color: { rgb: '000000' } }, 
          right: { style: 'thin', color: { rgb: '000000' } } 
        },
      };

      headers.forEach((_, index) => {
        const cellRef = String.fromCharCode(65 + index) + '14';
        if (!ws[cellRef]) ws[cellRef] = {};
        ws[cellRef].s = columnHeaderStyle;
      });

      // Style cho data rows (alternating colors)
      const evenRowStyle: CellStyle = { 
        fill: { fgColor: { rgb: 'F8FAFC' } }, 
        alignment: { horizontal: 'center', vertical: 'center' }, 
        border: { 
          top: { style: 'thin', color: { rgb: 'E2E8F0' } }, 
          bottom: { style: 'thin', color: { rgb: 'E2E8F0' } }, 
          left: { style: 'thin', color: { rgb: 'E2E8F0' } }, 
          right: { style: 'thin', color: { rgb: 'E2E8F0' } } 
        } 
      };
      
      const oddRowStyle: CellStyle = { 
        fill: { fgColor: { rgb: 'FFFFFF' } }, 
        alignment: { horizontal: 'center', vertical: 'center' }, 
        border: { 
          top: { style: 'thin', color: { rgb: 'E2E8F0' } }, 
          bottom: { style: 'thin', color: { rgb: 'E2E8F0' } }, 
          left: { style: 'thin', color: { rgb: 'E2E8F0' } }, 
          right: { style: 'thin', color: { rgb: 'E2E8F0' } } 
        } 
      };

      exportData.forEach((_, rowIndex) => {
        const isEven = rowIndex % 2 === 0;
        const style = isEven ? evenRowStyle : oddRowStyle;
        headers.forEach((_, colIndex) => {
          const cellRef = String.fromCharCode(65 + colIndex) + (15 + rowIndex);
          if (!ws[cellRef]) ws[cellRef] = {};
          ws[cellRef].s = style;
        });
      });

      // Merge cells cho headers
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }, // Title (row 1)
        { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }, // Subtitle (row 2)
        { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } }, // Export date (row 3)
        { s: { r: 3, c: 0 }, e: { r: 3, c: 9 } }, // Period (row 4)
        { s: { r: 5, c: 0 }, e: { r: 5, c: 9 } }, // SUMMARY STATISTICS (row 6)
        { s: { r: 6, c: 0 }, e: { r: 6, c: 9 } }, // Total Users (row 7)
        { s: { r: 7, c: 0 }, e: { r: 7, c: 9 } }, // Total Products (row 8)
        { s: { r: 8, c: 0 }, e: { r: 8, c: 9 } }, // Total Orders (row 9)
        { s: { r: 9, c: 0 }, e: { r: 9, c: 9 } }, // Total Revenue (row 10)
        { s: { r: 11, c: 0 }, e: { r: 11, c: 9 } }, // DETAILED DATA (row 12)
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Dashboard Report');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const currentDate = new Date().toLocaleDateString('en-US').replace(/\//g, '-');
      const filename = `Dashboard_Report_${currentPeriod.toUpperCase()}_${currentDate}.xlsx`;
      saveAs(blob, filename);

      showSuccess('Export successful!', `Exported dashboard report to Excel: ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
      showError('Export error', 'An error occurred while exporting Excel. Please try again.');
    }
  };

  return (
    <DashboardPresenter
      data={data}
      stats={stats}
      loading={displayLoading}
      error={error}
      period={currentPeriod}
      onRefresh={handleRefresh}
      onPeriodChange={handlePeriodChange}
      onExportExcel={handleExportExcel}
    />
  );
};
