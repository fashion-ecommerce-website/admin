'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLoginPresenter } from '../components/AdminLoginPresenter';
import { useToast } from '@/providers/ToastProvider';

export const AdminLoginContainer: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      // Mock login - replace with real API call later
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (credentials.email === 'admin@fashion.com' && credentials.password === 'password123') {
        // Mock successful login - using consistent token key
        const mockToken = 'mock-admin-token-' + Date.now();
        const userData = {
          id: 1,
          name: 'Admin User',
          email: credentials.email,
          role: 'admin'
        };
        
        localStorage.setItem('admin_token', mockToken);
        localStorage.setItem('admin_user', JSON.stringify(userData));
        
        // Also set cookie for middleware
        document.cookie = `admin_token=${mockToken}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        
        showSuccess(
          'Đăng nhập thành công!',
          'Chào mừng bạn đến với hệ thống quản trị Fashion.'
        );
        
        // Immediate redirect without delay to avoid middleware conflicts
        router.push('/dashboard');
        router.refresh(); // Force refresh to update middleware state
      } else {
        setError('Email hoặc mật khẩu không đúng');
        showError(
          'Đăng nhập thất bại',
          'Email hoặc mật khẩu không đúng. Vui lòng thử lại.'
        );
      }
    } catch (err) {
      setError('Đăng nhập thất bại');
      showError(
        'Lỗi hệ thống',
        'Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLoginPresenter
      onLogin={handleLogin}
      loading={loading}
      error={error}
    />
  );
};
