import { useState, useEffect } from 'react';
import { FeatureFlagKey, getFeatureFlag } from '@/lib/featureFlags';

export function useFeatureFlag(key: FeatureFlagKey): boolean {
  const [enabled, setEnabled] = useState(() => getFeatureFlag(key));

  useEffect(() => {
    const handleChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: FeatureFlagKey }>;
      if (customEvent.detail.key === key) {
        setEnabled(getFeatureFlag(key));
      }
    };

    window.addEventListener('featureFlagChange', handleChange);
    return () => window.removeEventListener('featureFlagChange', handleChange);
  }, [key]);

  return enabled;
}

// Hook for multiple flags
export function useFeatureFlags(keys: FeatureFlagKey[]): Record<FeatureFlagKey, boolean> {
  const [flags, setFlags] = useState(() => 
    Object.fromEntries(keys.map(k => [k, getFeatureFlag(k)])) as Record<FeatureFlagKey, boolean>
  );

  useEffect(() => {
    const handleChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: FeatureFlagKey }>;
      if (keys.includes(customEvent.detail.key)) {
        setFlags(prev => ({ ...prev, [customEvent.detail.key]: getFeatureFlag(customEvent.detail.key) }));
      }
    };

    window.addEventListener('featureFlagChange', handleChange);
    return () => window.removeEventListener('featureFlagChange', handleChange);
  }, [keys]);

  return flags;
}
