'use client';

import React, { useEffect, useRef } from 'react';
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

    if (finishedAttempt && isAuthenticated && hasAttemptedLoginRef.current) {
      showSuccess(
        'Login successful!',
        'Welcome to the Fashion Administration System.'
      );
      

      router.push('/dashboard');
      router.refresh(); 
      // reset attempt flag after successful navigation trigger
      hasAttemptedLoginRef.current = false;
    } else if (finishedAttempt && error) {
      showError(
        'Login failed',
        error
      );
    }
    prevLoadingRef.current = loading;
  }, [loading, isAuthenticated, error, router, showSuccess, showError]);

  return (
    <AdminLoginPresenter
      onLogin={handleLogin}
      loading={loading}
      error={error}
    />
  );
};
