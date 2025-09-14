import React, { useState, useEffect } from 'react';
import { cronJobManager } from '@/services/cronJobManager';

export const LockStatusWidget: React.FC = () => {
  const [status, setStatus] = useState(cronJobManager.getStatus());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(cronJobManager.getStatus());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const { isRunning, stats } = status;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Hệ thống tự động mở khóa
            </h3>
            <p className="text-xs text-gray-600">
              {isRunning ? 'Đang hoạt động' : 'Tạm dừng'} • {stats.total} khóa đang theo dõi
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg 
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <div className="text-lg font-bold text-blue-600">{stats.temporary}</div>
              <div className="text-xs text-gray-600">Khóa tạm thời</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <div className="text-lg font-bold text-red-600">{stats.permanent}</div>
              <div className="text-xs text-gray-600">Khóa vĩnh viễn</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <div className="text-lg font-bold text-orange-600">{stats.expiring24h}</div>
              <div className="text-xs text-gray-600">Hết hạn trong 24h</div>
            </div>
          </div>
          
          <div className="mt-3 flex justify-center space-x-2">
            <button
              onClick={() => cronJobManager.runAutoUnlock()}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              Kiểm tra ngay
            </button>
            <button
              onClick={() => isRunning ? cronJobManager.stopAutoUnlockJob() : cronJobManager.startAutoUnlockJob()}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                isRunning 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isRunning ? 'Tạm dừng' : 'Khởi động'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};