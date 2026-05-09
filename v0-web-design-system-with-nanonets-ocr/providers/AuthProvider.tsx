'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { restoreSession } from '@/store/slices/authSlice';
import { getAccessToken, getRefreshToken, getStoredUser } from '@/lib/auth';

const PUBLIC_PATHS = ['/login'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = getAccessToken();
    const refresh = getRefreshToken();
    const user = getStoredUser();

    if (token && refresh && user) {
      dispatch(restoreSession({ user, accessToken: token, refreshToken: refresh }));
    } else {
      dispatch(restoreSession(null));
    }
  }, [dispatch]);

  // Redirect logic
  useEffect(() => {
    const isPublic = PUBLIC_PATHS.includes(pathname);
    if (!isAuthenticated && !isPublic) {
      const token = getAccessToken();
      // Only redirect if truly no token (not just redux not hydrated yet)
      if (!token) router.replace('/login');
    }
    if (isAuthenticated && pathname === '/login') {
      router.replace('/projects');
    }
  }, [isAuthenticated, pathname, router]);

  return <>{children}</>;
}
