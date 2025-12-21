"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { useToast } from '@/providers/ToastProvider';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logoutRequest } from '@/features/auth/login';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState<string>('Admin User');
  const [adminEmail, setAdminEmail] = useState<string>('admin@fit.com');
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showSuccess } = useToast();
  const adminState = useAppSelector(state => state.adminAuth.admin);

  const handleLogout = () => {
    try {
      dispatch(logoutRequest());
      
      showSuccess(
        'Signed out successfully!',
        'You have been signed out of the admin panel.'
      );
      
      router.push('/auth/login');
      router.refresh(); 
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/auth/login');
    }
  };

  useEffect(() => {
    const hydrateAdmin = async () => {
      try {
        // Prefer Redux admin state
        if (adminState?.username) setAdminName(adminState.username);
        if (adminState?.email) setAdminEmail(adminState.email);

        // Fallback to session cache if Redux not yet populated
        if (!adminState?.username || !adminState?.email) {
          const cached = typeof window !== 'undefined' ? sessionStorage.getItem('admin_user') : null;
          if (cached) {
            const parsed = JSON.parse(cached);
            if (!adminState?.username && parsed?.username) setAdminName(parsed.username);
            if (!adminState?.email && parsed?.email) setAdminEmail(parsed.email);
          }
        }
      } catch {
        // ignore parsing errors
      }
    };
    hydrateAdmin();
  }, [adminState]);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
    },
    { 
      name: 'User Management', 
      href: '/users', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
    { 
      name: 'Product Management', 
      href: '/products', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM6 9.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm.5 2.5a.5.5 0 000 1h7a.5.5 0 000-1h-7z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    { 
      name: 'Variables Management', 
      href: '/system-variables', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1V3zM11 3a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V3zM4 10a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM11 10a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z" />
        </svg>
      ),
    },
    
    { 
      name: 'Category Management', 
      href: '/categories', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM6 9.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm.5 2.5a.5.5 0 000 1h7a.5.5 0 000-1h-7z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    { 
      name: 'Voucher Management', 
      href: '/vouchers', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm6 5a2 2 0 11-4 0 2 2 0 014 0zm-2 7a5 5 0 014.473-4.976L13 8h-2.5a.5.5 0 110-1H13l-.527-.976A5 5 0 008 11v3z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    { 
      name: 'Promotion Management', 
      href: '/promotions', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm6 5a2 2 0 11-4 0 2 2 0 014 0zm-2 7a5 5 0 014.473-4.976L13 8h-2.5a.5.5 0 110-1H13l-.527-.976A5 5 0 008 11v3z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    { 
      name: 'Orders Management', 
      href: '/orders', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    { 
      name: 'Refund Management', 
      href: '/refunds', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
      ),
    },
  ];

  // Build multi-level breadcrumb from pathname
  const segmentLabel = (seg: string) => {
    switch (seg) {
      case 'dashboard':
        return 'Dashboard';
      case 'users':
        return 'User Management';
      case 'products':
        return 'Product Management';
      case 'system-variables':
        return 'Variables Management';
      case 'colors':
        return 'Color Management';
      case 'sizes':
        return 'Size Management';
      case 'categories':
        return 'Category Management';
      case 'vouchers':
        return 'Voucher Management';
      case 'promotions':
        return 'Promotion Management';
      case 'orders':
        return 'Orders Management';
      case 'refunds':
        return 'Refund Management';
      case 'import-csv':
        return 'Import CSV';
      default:
        return null;
    }
  };
  const segments = (usePathname() || '').split('/').filter(Boolean);
  const crumbs: Array<{ name: string; href?: string }> = [{ name: 'FIT Admin', href: '/dashboard' }];
  let accum = '';
  segments.forEach((seg) => {
    accum += `/${seg}`;
    const label = segmentLabel(seg);
    if (label) {
      crumbs.push({ name: label, href: accum });
    }
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center h-16 px-6 bg-black">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold text-white">FIT Admin</span>
          </div>
         
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-black text-white shadow-lg transform scale-105"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span
                    className={clsx(
                      "mr-4 flex-shrink-0 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-600"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">{adminName?.[0] || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{adminName}</p>
              <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 group cursor-pointer"
              title="Sign out"
            >
              <svg
                className="w-5 h-5 cursor-pointer"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="shadow-sm border-b border-gray-200 backdrop-blur-sm bg-white/90">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-500 hover:text-gray-700 lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Breadcrumb */}
              <nav className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                {crumbs.map((c, idx) => {
                  const isLast = idx === crumbs.length - 1;
                  return (
                    <React.Fragment key={`${c.name}-${idx}`}>
                      {isLast ? (
                        <span className="text-gray-900 font-medium">{c.name}</span>
                      ) : (
                        <Link href={c.href || '#'} className="hover:text-gray-900 font-medium">
                          {c.name}
                        </Link>
                      )}
                      {!isLast && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </React.Fragment>
                  );
                })}
              </nav>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              <span className="hidden md:block text-sm text-gray-700 font-medium">Hello, Admin</span>
              <button 
                onClick={handleLogout}
                className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-md bg-black/20 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
