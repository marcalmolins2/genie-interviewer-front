import { Navigate, useLocation } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAdmin, loading } = useIsAdmin();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    // Redirect non-admins to agents page
    return <Navigate to="/app/agents" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
