// User interface for Admin panel
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Blocked';
  joinDate: string;
  lastLogin: string;
  totalOrders: number;
  totalSpent: number;
  phone?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  username?: string;
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

// User list response from API (matches backend PageResult)
export interface UserListResponse {
  items: BackendUser[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
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
  
  // Map active status to frontend status format
  // If active is false, we consider it as Blocked (locked by admin)
  // If active is true, we consider it as Active
  const status: 'Active' | 'Inactive' | 'Blocked' = backendUser.active ? 'Active' : 'Blocked';
  
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
  };
};

// API request types
export interface GetUsersRequest {
  page?: number;
  pageSize?: number;
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