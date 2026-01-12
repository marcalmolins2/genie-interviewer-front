import { ReactNode } from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { FeatureFlagKey } from '@/lib/featureFlags';

interface FeatureFlagProps {
  flag: FeatureFlagKey;
  children: ReactNode;
  fallback?: ReactNode;
  invert?: boolean;
}

export function FeatureFlag({ flag, children, fallback = null, invert = false }: FeatureFlagProps) {
  const enabled = useFeatureFlag(flag);
  const shouldShow = invert ? !enabled : enabled;
  
  return <>{shouldShow ? children : fallback}</>;
}
