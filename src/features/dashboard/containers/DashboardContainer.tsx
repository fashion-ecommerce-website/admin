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
import type { PeriodType, ChartDataDto } from '@/services/api/dashboardApi';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const DashboardContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { showSuccess, showError, showWarning } = useToast();
  const { data, loading, error } = useSelector((state: RootState) => state.dashboard);
  const displayLoading = useMinimumLoadingTime(loading, 300);
  const [currentPeriod, setCurrentPeriod] = useState<PeriodType>('MONTH');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    dispatch(fetchDashboardRequest(currentPeriod));

    // Auto-refresh every 5 minutes
    intervalRef.current = setInterval(() => {
      dispatch(fetchDashboardRequest(currentPeriod));
    }, 5 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dispatch, currentPeriod]);

  const handleRefresh = () => {
    dispatch(fetchDashboardRequest(currentPeriod));
  };

  const handlePeriodChange = (newPeriod: PeriodType) => {
    setCurrentPeriod(newPeriod);
  };

  const getChartLabel = (item: ChartDataDto): string => {
    if (currentPeriod === 'MONTH') {
      const monthIndex = parseInt(item.target, 10) - 1;
      return MONTH_NAMES[monthIndex] || item.target;
    }
    return item.target; // Year
  };

  const handleExportExcel = () => {
    try {
      if (!data || !data.chartData || data.chartData.length === 0) {
        showWarning('No data to export', 'There is no dashboard data to export.');
        return;
      }

      // For YEAR period, reverse to show from oldest to newest (2014 → 2025)
      const chartDataToExport = currentPeriod === 'YEAR' 
        ? [...data.chartData].reverse() 
        : data.chartData;

      const exportData = chartDataToExport.map((item, index) => ({
        'No.': index + 1,
        'Period': getChartLabel(item),
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

      ws['!cols'] = [
        { wch: 6 }, { wch: 12 }, { wch: 15 }, { wch: 18 },
        { wch: 16 }, { wch: 17 }, { wch: 22 }, { wch: 20 },
        { wch: 22 }, { wch: 23 },
      ];

      XLSX.utils.sheet_add_aoa(ws, [
        ['FASHION ECOMMERCE ADMIN'],
        ['DASHBOARD REPORT'],
        [`Export date: ${new Date().toLocaleDateString('en-US')}`],
        [`Period: ${currentPeriod}`],
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

      const headers = Object.keys(exportData[0]);
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A14' });
      
      exportData.forEach((row, index) => {
        const rowData = headers.map(header => row[header as keyof typeof row]);
        XLSX.utils.sheet_add_aoa(ws, [rowData], { origin: `A${15 + index}` });
      });

      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 9 } },
        { s: { r: 5, c: 0 }, e: { r: 5, c: 9 } },
        { s: { r: 6, c: 0 }, e: { r: 6, c: 9 } },
        { s: { r: 7, c: 0 }, e: { r: 7, c: 9 } },
        { s: { r: 8, c: 0 }, e: { r: 8, c: 9 } },
        { s: { r: 9, c: 0 }, e: { r: 9, c: 9 } },
        { s: { r: 11, c: 0 }, e: { r: 11, c: 9 } },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Dashboard Report');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const currentDate = new Date().toLocaleDateString('en-US').replace(/\//g, '-');
      const filename = `Dashboard_Report_${currentPeriod}_${currentDate}.xlsx`;
      saveAs(blob, filename);

      showSuccess('Export successful!', `Exported dashboard report: ${filename}`);
    } catch (err) {
      console.error('Export error:', err);
      showError('Export error', 'An error occurred while exporting Excel.');
    }
  };

  return (
    <DashboardPresenter
      data={data}
      loading={displayLoading}
      error={error}
      period={currentPeriod}
      onRefresh={handleRefresh}
      onPeriodChange={handlePeriodChange}
      onExportExcel={handleExportExcel}
    />
  );
};
