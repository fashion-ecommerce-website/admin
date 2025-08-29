import { call, put } from 'redux-saga/effects';
import { takeEvery } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { loginRequest, loginSuccess, loginFailure, AdminLoginRequest } from './adminAuthSlice';
// Import admin auth API service khi đã có

function* handleLogin(action: PayloadAction<AdminLoginRequest>) {
  try {
    // TODO: Implement admin auth API call
    // const response: AdminLoginResponse = yield call(adminAuthApi.login, action.payload);
    
    // Mock successful login for now
    const mockResponse = {
      admin: {
        id: '1',
        email: action.payload.email,
        username: 'admin',
        role: 'ADMIN' as const,
        permissions: ['USER_MANAGEMENT', 'PRODUCT_MANAGEMENT', 'DASHBOARD_VIEW'],
        lastLoginAt: new Date().toISOString(),
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
    };
    
    yield put(loginSuccess(mockResponse));
    
    // Store tokens in localStorage
    localStorage.setItem('admin_access_token', mockResponse.tokens.accessToken);
    localStorage.setItem('admin_refresh_token', mockResponse.tokens.refreshToken);
    
  } catch (error: any) {
    yield put(loginFailure(error.message || 'Login failed'));
  }
}

export function* adminAuthSaga() {
  yield takeEvery(loginRequest.type, handleLogin);
}
