import { call, put } from 'redux-saga/effects';
import { takeEvery, takeLeading } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { userApi } from '../../../services/api/userApi';
import { convertBackendUserToUser } from '../../../types/user.types';
import type { ApiResponse } from '../../../services/api/baseApi';
import type { UserListResponse } from '../../../types/user.types';
import {
  // Fetch users
  fetchUsersRequest,
  fetchUsersSuccess,
  fetchUsersFailure,
  type FetchUsersRequest,
  
  // Create user
  createUserRequest,
  createUserFailure,
  
  // Update user
  updateUserRequest,
  updateUserFailure,
  
  // Update user status
  updateUserStatusRequest,
  updateUserStatusFailure,
  
  // Delete user
  deleteUserRequest,
  deleteUserFailure,
} from './userSlice';

// Fetch users saga
function* handleFetchUsers(action: PayloadAction<FetchUsersRequest>) {
  try {
    const response: ApiResponse<UserListResponse> = yield call(
      userApi.getAllUsers.bind(userApi),
      action.payload
    );

    if (response.success && response.data) {
      // Convert backend users to frontend user format
      const users = response.data.users.map(convertBackendUserToUser);
      
      yield put(fetchUsersSuccess({
        users,
        total: response.data.total ?? 0,
        currentPage: response.data.page ?? 1,
        totalPages: response.data.totalPages ?? 0,
      }));
    } else {
      yield put(fetchUsersFailure({
        error: response.message || 'Failed to fetch users',
      }));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    yield put(fetchUsersFailure({
      error: message || 'An error occurred while fetching users',
    }));
  }
}

// Create user saga - simplified
function* handleCreateUser() {
  try {
    // For now, just show success - can be implemented later when backend is ready
    yield put(createUserFailure({
      error: 'Create user functionality will be available when backend is integrated',
    }));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    yield put(createUserFailure({
      error: message || 'An error occurred while creating user',
    }));
  }
}

// Update user saga - simplified
function* handleUpdateUser() {
  try {
    yield put(updateUserFailure({
      error: 'Update user functionality will be available when backend is integrated',
    }));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    yield put(updateUserFailure({
      error: message || 'An error occurred while updating user',
    }));
  }
}

// Update user status saga - simplified
function* handleUpdateUserStatus() {
  try {
    yield put(updateUserStatusFailure({
      error: 'Update user status functionality will be available when backend is integrated',
    }));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    yield put(updateUserStatusFailure({
      error: message || 'An error occurred while updating user status',
    }));
  }
}

// Delete user saga - simplified
function* handleDeleteUser() {
  try {
    yield put(deleteUserFailure({
      error: 'Delete user functionality will be available when backend is integrated',
    }));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    yield put(deleteUserFailure({
      error: message || 'An error occurred while deleting user',
    }));
  }
}

// Root user saga
export function* userSaga() {
  yield takeEvery(fetchUsersRequest.type, handleFetchUsers);
  yield takeLeading(createUserRequest.type, handleCreateUser);
  yield takeLeading(updateUserRequest.type, handleUpdateUser);
  yield takeLeading(updateUserStatusRequest.type, handleUpdateUserStatus);
  yield takeLeading(deleteUserRequest.type, handleDeleteUser);
}

export default userSaga;