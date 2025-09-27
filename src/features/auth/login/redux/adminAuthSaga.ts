import { call, put } from 'redux-saga/effects';
import { takeEvery } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { loginRequest, loginSuccess, loginFailure, logoutRequest, logout, AdminLoginRequest, AdminLoginResponse } from './adminAuthSlice';
import { adminAuthApi } from '@/services/api/adminAuthApi';

function* handleLogin(action: PayloadAction<AdminLoginRequest>) {
  try {
    const response: AdminLoginResponse = yield call(
      () => adminAuthApi.login(action.payload)
    );
    
    yield put(loginSuccess(response));
    
    localStorage.setItem('admin_access_token', response.accessToken);
    localStorage.setItem('admin_refresh_token', response.refreshToken);
    
    const adminUser = {
      username: response.username,
      email: response.email,
    };
    localStorage.setItem('admin_user', JSON.stringify(adminUser));
    
  } catch (error: any) {
    yield put(loginFailure(error.message || 'Đăng nhập thất bại'));
  }
}

function* handleLogout() {
  try {
    const accessToken = localStorage.getItem('admin_access_token');
    
    if (accessToken) {
      try {
        yield call(() => adminAuthApi.logout(accessToken));
      } catch (apiError) {
        console.warn('Logout API failed:', apiError);
      }
    }
    
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
    
    yield put(logout());
    
  } catch (error: any) {
    console.error('Logout error:', error);
    yield put(logout());
  }
}

export function* adminAuthSaga() {
  yield takeEvery(loginRequest.type, handleLogin);
  yield takeEvery(logoutRequest.type, handleLogout);
}
