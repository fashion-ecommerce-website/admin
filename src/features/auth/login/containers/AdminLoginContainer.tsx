'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLoginPresenter } from '../components/AdminLoginPresenter';
import { useToast } from '@/providers/ToastProvider';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { loginRequest, clearError } from '../redux/adminAuthSlice';
import { logoutRequest } from '../redux/adminAuthSlice';

export const AdminLoginContainer: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useToast();
  
  const { loading, error, isAuthenticated, admin } = useAppSelector(state => state.adminAuth);
  const prevLoadingRef = useRef(false);
  const hasAttemptedLoginRef = useRef(false);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    dispatch(clearError());
    
    dispatch(loginRequest(credentials));
    hasAttemptedLoginRef.current = true;
  };


  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    const finishedAttempt = wasLoading && !loading;

    if (finishedAttempt && hasAttemptedLoginRef.current) {
      if (isAuthenticated) {
        // Wait until roles are available
        const roles = admin?.roles || [];
        const isAdmin = roles.includes('ADMIN');
        if (roles.length === 0) {
          return;
        }
        if (isAdmin) {
          showSuccess(
            'Login successful!',
            'Welcome to the Fashion Administration System.'
          );
          router.push('/dashboard');
          router.refresh();
          hasAttemptedLoginRef.current = false;
        } else {
          showError('Access denied', 'Your account does not have admin privileges.');
          dispatch(logoutRequest());
          hasAttemptedLoginRef.current = false;
        }
      } else if (error) {
      showError(
        'Login failed',
        error
      );
      dispatch(clearError());
      hasAttemptedLoginRef.current = false;
    }
    }
    prevLoadingRef.current = loading;
  }, [loading, isAuthenticated, error, router, showSuccess, showError, admin, dispatch]);

  return (
    <AdminLoginPresenter
      onLogin={handleLogin}
      loading={loading}
      error={error}
    />
  );
};
