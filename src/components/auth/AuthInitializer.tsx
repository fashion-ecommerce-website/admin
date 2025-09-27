'use client';

import { useEffect } from 'react';

export const AuthInitializer: React.FC = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');  
      localStorage.removeItem('admin_user');
    
    }
  }, []);

  return null;
};