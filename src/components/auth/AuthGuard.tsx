'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { logout } from '@/features/auth/login';
import { adminAuthApi } from '@/services/api/adminAuthApi';
import { setAdminInfo } from '@/features/auth/login/redux/adminAuthSlice';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  const { isAuthenticated, accessToken, admin } = useAppSelector(state => state.adminAuth);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkAuth = async () => {
      const tokenFromStorage = sessionStorage.getItem('admin_access_token');
      const hasValidToken = accessToken || tokenFromStorage;
      
      const isProtectedRoute = pathname.startsWith('/dashboard') ||
                              pathname.startsWith('/users') ||
                              pathname.startsWith('/products') ||
                              pathname.startsWith('/orders') ||
                              pathname.startsWith('/categories');

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
        // Ensure role is ADMIN/SUPER_ADMIN for protected areas
        if (isProtectedRoute) {
          let currentRoles = admin?.roles || undefined;
          if (!currentRoles) {  
            try {
              const me = await adminAuthApi.getAuthenticatedUser(String(hasValidToken));
              const roles: string[] | undefined = me?.roles || me?.data?.roles || me?.authorities;
              const permissions = me?.permissions || me?.data?.permissions;
              if (roles) {
                dispatch(setAdminInfo({ roles, permissions }));
                const stored = JSON.parse(sessionStorage.getItem('admin_user') || '{}');
                sessionStorage.setItem('admin_user', JSON.stringify({ ...stored, roles, permissions }));
                currentRoles = roles;
              }
            } catch {
              // If cannot fetch role, treat as unauthorized
              router.push('/auth/login');
              return;
            }
          }
          const effectiveRoles = Array.isArray(currentRoles) ? currentRoles : [];
          const isAdmin = effectiveRoles.includes('ADMIN') || effectiveRoles.includes('SUPER_ADMIN');
          if (!isAdmin) {
            router.push('/auth/login');
            return;
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, router, isClient, isAuthenticated, accessToken, dispatch]);

  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
