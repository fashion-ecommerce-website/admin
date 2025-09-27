'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLoginPresenter } from '../components/AdminLoginPresenter';
import { useToast } from '@/providers/ToastProvider';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { loginRequest, clearError } from '../redux/adminAuthSlice';

export const AdminLoginContainer: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useToast();
  
  const { loading, error, isAuthenticated } = useAppSelector(state => state.adminAuth);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    dispatch(clearError());
    
    dispatch(loginRequest(credentials));
  };


  useEffect(() => {
    if (isAuthenticated) {
      showSuccess(
        'Đăng nhập thành công!',
        'Chào mừng bạn đến với hệ thống quản trị Fashion.'
      );
      

      router.push('/dashboard');
      router.refresh(); 
    } else if (error) {
      showError(
        'Đăng nhập thất bại',
        error
      );
    }
  }, [isAuthenticated, error, router, showSuccess, showError]);

  return (
    <AdminLoginPresenter
      onLogin={handleLogin}
      loading={loading}
      error={error}
    />
  );
};
