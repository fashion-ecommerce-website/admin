import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AdminAuthState {
  isAuthenticated: boolean;
  admin: AdminUser | null;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  };
  loading: boolean;
  error: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  permissions: string[];
  lastLoginAt: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  admin: AdminUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

const initialState: AdminAuthState = {
  isAuthenticated: false,
  admin: null,
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
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
      state.admin = action.payload.admin;
      state.tokens = action.payload.tokens;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.admin = null;
      state.tokens = { accessToken: null, refreshToken: null };
      state.error = action.payload;
    },
    
    // Logout action
    logout: (state) => {
      state.isAuthenticated = false;
      state.admin = null;
      state.tokens = { accessToken: null, refreshToken: null };
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
  logout, 
  clearError 
} = adminAuthSlice.actions;

export const adminAuthReducer = adminAuthSlice.reducer;
