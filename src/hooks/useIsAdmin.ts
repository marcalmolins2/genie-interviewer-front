import { useState, useEffect } from 'react';

// Mock admin check - in production this would check against Supabase user_roles table
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock implementation - check localStorage user for admin flag
    // In production, this would query the user_roles table via Supabase
    const checkAdmin = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          // Mock: check if user has admin role (for demo, we'll set this in localStorage)
          setIsAdmin(user.isAdmin === true);
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  return { isAdmin, loading };
}
