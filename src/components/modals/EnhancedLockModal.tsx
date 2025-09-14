import React, { useState } from 'react';
import { User } from '@/types/user.types';
import { userLockService, TempLockRequest, PermanentLockRequest } from '@/services/userLockService';
import { cronJobManager } from '@/services/cronJobManager';

// Base Modal Component (copied from UserModals.tsx)
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<BaseModalProps & { children: React.ReactNode; title: string }> = ({
  isOpen,
  onClose,
  children,
  title,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-transparent transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-fadeInUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

interface EnhancedLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onConfirm?: (userId: number, action: 'lock' | 'unlock') => Promise<void>;
}

export const EnhancedLockModal: React.FC<EnhancedLockModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onConfirm 
}) => {
  const [lockType, setLockType] = useState<'TEMPORARY' | 'PERMANENT'>('TEMPORARY');
  const [duration, setDuration] = useState<number>(7); // Default 7 days
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  if (!user) return null;

  const isLocked = user.status === 'Blocked' || user.status === 'Temporary Lock' || user.status === 'Permanent Lock';
  const action = isLocked ? 'unlock' : 'lock';
  
  const handleConfirm = async () => {
    if (!onConfirm) return;
    
    try {
      setIsLoading(true);
      
      if (action === 'unlock') {
        // Remove lock from local storage
        userLockService.removeLock(user.id);
        
        // Call API to unlock user
        await onConfirm(user.id, 'unlock');
      } else {
        // Add lock to local storage
        const adminId = 1; // TODO: Get from current admin user context
        
        if (lockType === 'TEMPORARY') {
          const request: TempLockRequest = {
            userId: user.id,
            duration: duration,
            reason: reason || 'Temporary lock applied by admin',
            adminId: adminId
          };
          userLockService.addTemporaryLock(request);
          
          // Schedule automatic unlock
          const unlockTime = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
          cronJobManager.scheduleUnlock(user.id, unlockTime);
        } else {
          const request: PermanentLockRequest = {
            userId: user.id,
            reason: reason || 'Permanent lock applied by admin',
            adminId: adminId
          };
          userLockService.addPermanentLock(request);
        }
        
        // Call API to lock user
        await onConfirm(user.id, 'lock');
      }
      
      onClose();
      
      // Reset form
      setLockType('TEMPORARY');
      setDuration(7);
      setReason('');
      
    } catch (error) {
      console.error('Error in enhanced lock modal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLockStatusInfo = () => {
    if (!isLocked) return null;
    
    const lockInfo = userLockService.getUserLock(user.id);
    if (!lockInfo) return null;
    
    const isTemp = lockInfo.lockType === 'TEMPORARY';
    const lockedAt = new Date(lockInfo.lockedAt).toLocaleString();
    const expiresAt = lockInfo.lockExpiresAt ? new Date(lockInfo.lockExpiresAt).toLocaleString() : null;
    
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-orange-800 mb-2">
          Thông tin khóa hiện tại
        </h4>
        <div className="text-sm text-orange-700 space-y-1">
          <p><strong>Loại:</strong> {isTemp ? 'Khóa tạm thời' : 'Khóa vĩnh viễn'}</p>
          <p><strong>Thời gian khóa:</strong> {lockedAt}</p>
          {expiresAt && <p><strong>Hết hạn:</strong> {expiresAt}</p>}
          {lockInfo.reason && <p><strong>Lý do:</strong> {lockInfo.reason}</p>}
        </div>
      </div>
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isLocked ? 'Mở khóa người dùng' : 'Khóa người dùng'}
    >
      <div className="space-y-6">
        {/* Current lock status */}
        {getLockStatusInfo()}
        
        {/* User info */}
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
            isLocked ? 'bg-green-100' : 'bg-orange-100'
          }`}>
            {isLocked ? (
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </div>

          <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
            {isLocked ? 'Mở khóa tài khoản?' : 'Khóa tài khoản?'}
          </h4>
          <p className="text-gray-600">
            <strong>{user.name}</strong> ({user.email})
          </p>
        </div>

        {/* Lock options (only show when locking) */}
        {!isLocked && (
          <div className="space-y-4">
            {/* Lock type selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại khóa
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="TEMPORARY"
                    checked={lockType === 'TEMPORARY'}
                    onChange={(e) => setLockType(e.target.value as 'TEMPORARY')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Khóa tạm thời (tự động mở khóa sau thời gian nhất định)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="PERMANENT"
                    checked={lockType === 'PERMANENT'}
                    onChange={(e) => setLockType(e.target.value as 'PERMANENT')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Khóa vĩnh viễn (cần mở khóa thủ công)
                  </span>
                </label>
              </div>
            </div>

            {/* Duration selection (only for temporary lock) */}
            {lockType === 'TEMPORARY' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian khóa
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={0.0007}>1 phút (test)</option>
                  <option value={7}>7 ngày</option>
                  <option value={14}>14 ngày</option>
                  <option value={21}>21 ngày</option>
                  <option value={30}>30 ngày</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {duration === 0.0007 ? 'Tài khoản sẽ tự động được mở khóa sau 1 phút (chỉ để test)' : `Tài khoản sẽ tự động được mở khóa sau ${duration} ngày`}
                </p>
              </div>
            )}

            {/* Reason input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do khóa (tùy chọn)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do khóa tài khoản..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
              isLocked
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                : 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Đang xử lý...
              </div>
            ) : (
              isLocked ? 'Mở khóa' : 'Khóa tài khoản'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};