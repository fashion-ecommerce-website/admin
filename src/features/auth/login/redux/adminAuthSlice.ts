import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AdminAuthState {
  isAuthenticated: boolean;
  admin: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresIn: number | null;
  loading: boolean;
  error: string | null;
}

export interface AdminUser {
  username: string;
  email: string;
  roles?: string[];
  permissions?: string[];
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string | null;
  expiresIn: number;
  username: string;
  email: string;
}

const initialState: AdminAuthState = {
  isAuthenticated: false,
  admin: null,
  accessToken: null,
  refreshToken: null,
  tokenType: null,
  expiresIn: null,
  loading: false,
  error: null,
};

export const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    // Login actions
    loginRequest: (state, action: PayloadAction<AdminLoginRequest>) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<AdminLoginResponse>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.admin = {
        username: action.payload.username,
        email: action.payload.email,
      };
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.tokenType = action.payload.tokenType;
      state.expiresIn = action.payload.expiresIn;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.admin = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenType = null;
      state.expiresIn = null;
      state.error = action.payload;
    },
    
    // Set or update admin info (including role/permissions)
    setAdminInfo: (state, action: PayloadAction<Partial<AdminUser>>) => {
      const current = state.admin || { username: '', email: '' };
      state.admin = {
        ...current,
        ...action.payload,
      };
    },

    // Logout actions
    logoutRequest: (state) => {
      state.loading = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.admin = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenType = null;
      state.expiresIn = null;
      state.loading = false;
      state.error = null;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  loginRequest, 
  loginSuccess, 
  loginFailure, 
  logoutRequest,
  logout, 
  clearError,
  setAdminInfo
} = adminAuthSlice.actions;

export const adminAuthReducer = adminAuthSlice.reducer;
