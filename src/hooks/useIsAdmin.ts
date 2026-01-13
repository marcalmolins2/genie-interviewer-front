import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin';

// Query key for admin status
const adminQueryKey = ['isAdmin'] as const;

export function useIsAdmin(): { isAdmin: boolean; loading: boolean } {
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: adminQueryKey,
    queryFn: () => adminService.isAdmin(),
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    isAdmin: isAdmin ?? false,
    loading: isLoading,
  };
}

// Synchronous check for initial render (uses cached value)
export function useIsAdminSync(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    adminService.isAdmin().then(setIsAdmin);
  }, []);

  return isAdmin;
}

export default useIsAdmin;
