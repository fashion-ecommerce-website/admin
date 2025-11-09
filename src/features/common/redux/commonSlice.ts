import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CommonEnumsState, CommonEnumsResponse } from '@/types/common.types';

const initialState: CommonEnumsState = {
  data: null,
  isLoading: false,
  error: null,
};

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    // Fetch enums
    fetchEnumsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchEnumsSuccess: (state, action: PayloadAction<CommonEnumsResponse>) => {
      state.isLoading = false;
      state.data = action.payload;
      state.error = null;
    },
    fetchEnumsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchEnumsRequest,
  fetchEnumsSuccess,
  fetchEnumsFailure,
} = commonSlice.actions;

export const commonReducer = commonSlice.reducer;
