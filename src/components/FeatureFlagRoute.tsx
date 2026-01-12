import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { FeatureFlagKey } from '@/lib/featureFlags';

interface FeatureFlagRouteProps {
  flag: FeatureFlagKey;
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * Route-level feature flag gate.
 * Blocks access to routes when the specified feature flag is disabled.
 * Either redirects to a specified path or renders a fallback component.
 */
export function FeatureFlagRoute({ 
  flag, 
  children, 
  redirectTo = '/app/interviewers',
  fallback 
}: FeatureFlagRouteProps) {
  const enabled = useFeatureFlag(flag);

  if (!enabled) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
