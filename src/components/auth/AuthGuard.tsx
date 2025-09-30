'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { logout } from '@/features/auth/login';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  const { isAuthenticated, accessToken } = useAppSelector(state => state.adminAuth);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkAuth = () => {
      const tokenFromStorage = sessionStorage.getItem('admin_access_token');
      const hasValidToken = accessToken || tokenFromStorage;
      
      const isProtectedRoute = pathname.startsWith('/dashboard') ||
                              pathname.startsWith('/users') ||
                              pathname.startsWith('/products') ||
                              pathname.startsWith('/orders') ||
                              pathname.startsWith('/categories');
      
      const isAuthRoute = pathname.startsWith('/auth');

      if (isAuthenticated && !tokenFromStorage) {
        dispatch(logout());
        router.push('/auth/login');
        return;
      }

      if (hasValidToken) {
        if (pathname === '/') {
          router.push('/dashboard');
          return;
        }
      } else {
        if (isProtectedRoute) {
          router.push('/auth/login');
          return;
        }
        if (pathname === '/') {
          router.push('/auth/login');
          return;
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router, isClient, isAuthenticated, accessToken, dispatch]);

  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
