'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useToast } from '@/providers/ToastProvider';
import { CustomDropdown } from '../ui';
import { User } from '@/types/user.types';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserModalProps extends BaseModalProps {
  user?: User | null;
  onSave?: (user: User) => void;
}

// Base Modal Component
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
        className="fixed inset-0 backdrop-blur-sm bg-black/20 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeInUp">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="cursor-pointer text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Add User Modal
export const AddUserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave }) => {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Customer',
    status: 'Active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (onSave) {
        const newUser: User = {
          id: Date.now(), // Temporary ID
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status as 'Active' | 'Inactive' | 'Blocked',
          joinDate: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          totalOrders: 0,
          totalSpent: 0,
        };
        onSave(newUser);
        showSuccess(
          'User added successfully!',
          `Added ${formData.name} to the system.`
        );
      }
      setFormData({ name: '', email: '', role: 'Customer', status: 'Active' });
      onClose();
    } catch {
      showError(
        'Add user error',
        'An error occurred while adding a new user.'
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add new user">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
            placeholder="Enter user name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
            placeholder="Nhập địa chỉ email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <CustomDropdown
            value={formData.role}
            onChange={(value) => setFormData({ ...formData, role: value })}
            options={[
              { value: 'Customer', label: 'Customer' },
              { value: 'VIP Customer', label: 'VIP Customer' }
            ]}
            padding="px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <CustomDropdown
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value })}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
              { value: 'Blocked', label: 'Blocked' }
            ]}
            padding="px-4 py-3"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cursor-pointer px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 font-medium transition-all duration-200 transform hover:scale-105"
          >
            Add user
          </button>
        </div>
      </form>
    </Modal>
  );
};

// View User Modal
export const ViewUserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user }) => {
  const [imgError, setImgError] = useState(false);

  // Reset imgError when user changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setImgError(false);
    }
  }, [isOpen, user?.id]);

  if (!user) return null;

  const showAvatar = user.avatar && !imgError;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User details">
      <div className="space-y-6">
        {/* User Avatar & Basic Info */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
          {showAvatar && user.avatar ? (
            <Image 
              src={user.avatar} 
              alt={user.name} 
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover shadow-lg"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">{user.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div>
            <h4 className="text-xl font-semibold text-gray-900">{user.name}</h4>
            <p className="text-gray-600">{user.email}</p>
            <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full mt-2 ${
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
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Phone</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{user.phone || 'Not provided'}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                user.status === 'Active' ? 'bg-green-500' : 
                user.status === 'Inactive' ? 'bg-yellow-500' : 'bg-red-500'
              } animate-pulse`}></div>
              <span className="text-sm font-medium text-gray-700">Status</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {user.status === 'Active' ? 'Active' : user.status === 'Inactive' ? 'Inactive' : 'Blocked'}
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Join date</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(user.joinDate).toLocaleDateString('en-US')}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Last login</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US') : 'Never'}
            </p>
          </div>
        </div>

        {/* Rank */}
        <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span className="text-sm font-medium text-amber-700">Member Rank</span>
          </div>
          <p className="text-xl font-bold text-amber-900">{user.rankName || 'No rank'}</p>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="cursor-pointer px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 font-medium transition-all duration-200 transform hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Lock/Unlock Confirmation Modal
interface LockModalProps extends BaseModalProps {
  user?: User | null;
  onConfirm?: (userId: number, action: 'lock' | 'unlock') => Promise<void>;
}

export const LockUserModal: React.FC<LockModalProps> = ({ isOpen, onClose, user, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  if (!user) return null;

  const isLocked = user.status === 'Blocked';
  const action = isLocked ? 'unlock' : 'lock';
  
  const handleConfirm = async () => {
    if (!onConfirm) return;
    
    try {
      setIsLoading(true);
      await onConfirm(user.id, action);
      onClose();
    } catch (error) {
      console.error('Error in lock modal:', error);
      // Error handling is done in the parent component
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isLocked ? 'Unlock user' : 'Lock user'}>
      <div className="text-center space-y-4">
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

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {isLocked ? 'Unlock account?' : 'Lock account?'}
          </h4>
          <p className="text-gray-600">
            Are you sure you want to {isLocked ? 'unlock' : 'lock'} the account of <span className="font-medium text-gray-900">{user.name}</span>?
          </p>
          {!isLocked && (
            <p className="text-sm text-yellow-600 mt-2">
              After locking, the user will not be able to access the system.
            </p>
          )}
        </div>

        <div className="flex justify-center space-x-3 pt-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`cursor-pointer px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 bg-gray-800 hover:bg-gray-900`}
          >
            {isLoading && (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            <span>{isLoading ? 'Processing...' : (isLocked ? 'Unlock' : 'Lock account')}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
