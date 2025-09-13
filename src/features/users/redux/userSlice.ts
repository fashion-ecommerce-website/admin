import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserState, GetUsersRequest } from '../../../types/user.types';

// Initial state
const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  totalPages: 0,
};

// Action types
export interface FetchUsersRequest extends GetUsersRequest {}

export interface FetchUsersSuccess {
  users: User[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface FetchUsersFailure {
  error: string;
}

export interface UpdateUserRequest {
  userId: number;
  updates: Partial<User>;
}

export interface UpdateUserSuccess {
  user: User;
}

export interface DeleteUserRequest {
  userId: number;
}

export interface CreateUserRequest {
  user: Omit<User, 'id'>;
}

export interface CreateUserSuccess {
  user: User;
}

export interface UpdateUserStatusRequest {
  userId: number;
  status: 'Active' | 'Inactive' | 'Blocked';
}

// User slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Fetch users
    fetchUsersRequest: (state, action: PayloadAction<FetchUsersRequest>) => {
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess: (state, action: PayloadAction<FetchUsersSuccess>) => {
      state.loading = false;
      state.users = action.payload.users;
      state.total = action.payload.total;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
      state.error = null;
    },
    fetchUsersFailure: (state, action: PayloadAction<FetchUsersFailure>) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    // Create user
    createUserRequest: (state, action: PayloadAction<CreateUserRequest>) => {
      state.loading = true;
      state.error = null;
    },
    createUserSuccess: (state, action: PayloadAction<CreateUserSuccess>) => {
      state.loading = false;
      state.users.unshift(action.payload.user);
      state.total += 1;
      state.error = null;
    },
    createUserFailure: (state, action: PayloadAction<FetchUsersFailure>) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    // Update user
    updateUserRequest: (state, action: PayloadAction<UpdateUserRequest>) => {
      state.loading = true;
      state.error = null;
    },
    updateUserSuccess: (state, action: PayloadAction<UpdateUserSuccess>) => {
      state.loading = false;
      const index = state.users.findIndex((user: User) => user.id === action.payload.user.id);
      if (index !== -1) {
        state.users[index] = action.payload.user;
      }
      state.error = null;
    },
    updateUserFailure: (state, action: PayloadAction<FetchUsersFailure>) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    // Update user status
    updateUserStatusRequest: (state, action: PayloadAction<UpdateUserStatusRequest>) => {
      state.loading = true;
      state.error = null;
    },
    updateUserStatusSuccess: (state, action: PayloadAction<UpdateUserSuccess>) => {
      state.loading = false;
      const index = state.users.findIndex((user: User) => user.id === action.payload.user.id);
      if (index !== -1) {
        state.users[index] = action.payload.user;
      }
      state.error = null;
    },
    updateUserStatusFailure: (state, action: PayloadAction<FetchUsersFailure>) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    // Delete user
    deleteUserRequest: (state, action: PayloadAction<DeleteUserRequest>) => {
      state.loading = true;
      state.error = null;
    },
    deleteUserSuccess: (state, action: PayloadAction<DeleteUserRequest>) => {
      state.loading = false;
      state.users = state.users.filter((user: User) => user.id !== action.payload.userId);
      state.total -= 1;
      state.error = null;
    },
    deleteUserFailure: (state, action: PayloadAction<FetchUsersFailure>) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    // Clear error
    clearUserError: (state) => {
      state.error = null;
    },

    // Reset users state
    resetUsersState: (state) => {
      return initialState;
    },
  },
});

// Export actions
export const {
  fetchUsersRequest,
  fetchUsersSuccess,
  fetchUsersFailure,
  createUserRequest,
  createUserSuccess,
  createUserFailure,
  updateUserRequest,
  updateUserSuccess,
  updateUserFailure,
  updateUserStatusRequest,
  updateUserStatusSuccess,
  updateUserStatusFailure,
  deleteUserRequest,
  deleteUserSuccess,
  deleteUserFailure,
  clearUserError,
  resetUsersState,
} = userSlice.actions;

// Export reducer
export default userSlice.reducer;