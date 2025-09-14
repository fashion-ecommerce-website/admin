// User interface for Admin panel
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Blocked' | 'Temporary Lock' | 'Permanent Lock';
  joinDate: string;
  lastLogin: string;
  totalOrders: number;
  totalSpent: number;
  phone?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  username?: string;
  // Enhanced lock properties
  lockType?: 'NONE' | 'TEMPORARY' | 'PERMANENT';
  lockReason?: string;
  lockedAt?: string;
  lockExpiresAt?: string;
  lockedByAdminId?: number;
}

// Backend User interface (from API response)
export interface BackendUser {
  id: number;
  email: string;
  username: string;
  phone?: string;
  dob?: string | null;
  avatarUrl?: string | null;
  reason?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  roles: string[];
  active: boolean;
}

// User list response from API
export interface UserListResponse {
  users: BackendUser[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// User state for Redux store
export interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
}

// Helper function to convert BackendUser to User
export const convertBackendUserToUser = (backendUser: BackendUser): User => {
  // Map roles array to a single role string
  const primaryRole = backendUser.roles.includes('ADMIN') ? 'Admin' : 
                     backendUser.roles.includes('VIP') ? 'VIP Customer' : 'Customer';
  
  // Import lock service to check lock status
  let lockType: 'NONE' | 'TEMPORARY' | 'PERMANENT' = 'NONE';
  let lockReason: string | undefined;
  let lockedAt: string | undefined;
  let lockExpiresAt: string | undefined;
  let lockedByAdminId: number | undefined;
  
  // Check if user is locked using lock service
  if (typeof window !== 'undefined') {
    try {
      const { userLockService } = require('../services/userLockService');
      const userLock = userLockService.getUserLock(backendUser.id);
      if (userLock) {
        lockType = userLock.lockType;
        lockReason = userLock.reason;
        lockedAt = userLock.lockedAt;
        lockExpiresAt = userLock.lockExpiresAt;
        lockedByAdminId = userLock.lockedByAdminId;
      }
    } catch (error) {
      console.warn('Lock service not available:', error);
    }
  }
  
  // Determine status based on active flag and lock type
  let status: 'Active' | 'Inactive' | 'Blocked' | 'Temporary Lock' | 'Permanent Lock';
  
  if (backendUser.active) {
    status = 'Active';
  } else {
    // User is inactive, check lock type
    if (lockType === 'TEMPORARY') {
      status = 'Temporary Lock';
    } else if (lockType === 'PERMANENT') {
      status = 'Permanent Lock';
    } else {
      status = 'Blocked'; // Default for inactive users without specific lock type
    }
  }
  
  return {
    id: backendUser.id,
    name: backendUser.username || 'Unknown User',
    email: backendUser.email,
    role: primaryRole,
    status: status,
    joinDate: backendUser.createdAt,
    lastLogin: backendUser.lastLoginAt || backendUser.updatedAt,
    totalOrders: 0, // Not available in API response, default to 0
    totalSpent: 0, // Not available in API response, default to 0
    phone: backendUser.phone || '',
    firstName: '', // Not available in API response
    lastName: '', // Not available in API response
    avatar: backendUser.avatarUrl || '',
    username: backendUser.username || '',
    // Enhanced lock properties
    lockType: lockType,
    lockReason: lockReason,
    lockedAt: lockedAt,
    lockExpiresAt: lockExpiresAt,
    lockedByAdminId: lockedByAdminId,
  };
};

// API request types
export interface GetUsersRequest {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateUserRequest {
  id: number;
  name?: string;
  email?: string;
  role?: string;
  status?: 'Active' | 'Inactive' | 'Blocked';
  phone?: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}