import { call, put, Effect } from 'redux-saga/effects';
import { takeEvery, ForkEffect } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { loginRequest, loginSuccess, loginFailure, logoutRequest, logout, AdminLoginRequest, AdminLoginResponse } from './adminAuthSlice';
import { setAdminInfo } from './adminAuthSlice';
import { adminAuthApi } from '@/services/api/adminAuthApi';

// Interface for authenticated user response
interface AuthenticatedUserResponse {
  id: number;
  username: string;
  email: string;
  roles?: string[];
  permissions?: string[];
  authorities?: string[];
  data?: {
    roles?: string[];
    permissions?: string[];
  };
}

function* handleLogin(action: PayloadAction<AdminLoginRequest>): Generator<Effect, void, unknown> {
  try {
    const response = yield call(
      () => adminAuthApi.login(action.payload)
    );
    
    yield put(loginSuccess(response as AdminLoginResponse));
    
    sessionStorage.setItem('admin_access_token', (response as AdminLoginResponse).accessToken);
    sessionStorage.setItem('admin_refresh_token', (response as AdminLoginResponse).refreshToken);
    
    const adminUser = {
      username: (response as AdminLoginResponse).username,
      email: (response as AdminLoginResponse).email,
    };
    sessionStorage.setItem('admin_user', JSON.stringify(adminUser));
    // fetch authenticated user with role/permissions
    try {
      const me = yield call(() => adminAuthApi.getAuthenticatedUser((response as AdminLoginResponse).accessToken));
      const meData = me as AuthenticatedUserResponse;
      const roles: string[] | undefined = meData?.roles || meData?.data?.roles || meData?.authorities;
      const primaryRole = Array.isArray(roles) ? roles[0] : undefined;
      const permissions = meData?.permissions || meData?.data?.permissions || undefined;
      if (primaryRole || roles) {
        yield put(setAdminInfo({ roles, permissions }));
        const stored = JSON.parse(sessionStorage.getItem('admin_user') || '{}');
        sessionStorage.setItem('admin_user', JSON.stringify({ ...stored, role: primaryRole, roles, permissions }));
      }
    } catch {
      // ignore role fetch failure; AuthGuard will handle redirect if needed
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    yield put(loginFailure(errorMessage));
  }
}

function* handleLogout(): Generator<Effect, void, unknown> {
  try {
    const accessToken = sessionStorage.getItem('admin_access_token');
    
    if (accessToken) {
      try {
        yield call(() => adminAuthApi.logout(accessToken));
      } catch (apiError) {
        console.warn('Logout API failed:', apiError);
      }
    }
    
    sessionStorage.removeItem('admin_access_token');
    sessionStorage.removeItem('admin_refresh_token');
    sessionStorage.removeItem('admin_user');
    
    yield put(logout());
    
  } catch (error: unknown) {
    console.error('Logout error:', error);
    yield put(logout());
  }
}

export function* adminAuthSaga(): Generator<ForkEffect<never>, void, unknown> {
  yield takeEvery(loginRequest.type, handleLogin);
  yield takeEvery(logoutRequest.type, handleLogout);
}
