'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('admin_token');
      const isProtectedRoute = pathname.startsWith('/dashboard') ||
                              pathname.startsWith('/users') ||
                              pathname.startsWith('/products') ||
                              pathname.startsWith('/orders') ||
                              pathname.startsWith('/categories');
      
      const isAuthRoute = pathname.startsWith('/auth');

      if (token) {
        setIsAuthenticated(true);
        // If on auth route with valid token, redirect to dashboard
        if (isAuthRoute) {
          router.push('/dashboard');
          return;
        }
        // If on root with valid token, redirect to dashboard
        if (pathname === '/') {
          router.push('/dashboard');
          return;
        }
      } else {
        setIsAuthenticated(false);
        // If on protected route without token, redirect to login
        if (isProtectedRoute) {
          router.push('/auth/login');
          return;
        }
        // If on root without token, redirect to login
        if (pathname === '/') {
          router.push('/auth/login');
          return;
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
