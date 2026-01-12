import { useState, useEffect, useCallback } from 'react';
import { FeatureFlagKey, getFeatureFlag } from '@/lib/featureFlags';

export function useFeatureFlag(key: FeatureFlagKey): boolean {
  const [enabled, setEnabled] = useState(() => getFeatureFlag(key));

  const refreshFlag = useCallback(() => {
    setEnabled(getFeatureFlag(key));
  }, [key]);

  useEffect(() => {
    // Same-tab updates via custom event
    const handleChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: FeatureFlagKey }>;
      if (customEvent.detail.key === key) {
        refreshFlag();
      }
    };

    // Cross-tab updates via storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === `ff_${key}`) {
        refreshFlag();
      }
    };

    window.addEventListener('featureFlagChange', handleChange);
    window.addEventListener('storage', handleStorage);
    
    return () => {
      window.removeEventListener('featureFlagChange', handleChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [key, refreshFlag]);

  return enabled;
}

// Hook for multiple flags
export function useFeatureFlags(keys: FeatureFlagKey[]): Record<FeatureFlagKey, boolean> {
  const [flags, setFlags] = useState(() => 
    Object.fromEntries(keys.map(k => [k, getFeatureFlag(k)])) as Record<FeatureFlagKey, boolean>
  );

  const refreshFlags = useCallback(() => {
    setFlags(Object.fromEntries(keys.map(k => [k, getFeatureFlag(k)])) as Record<FeatureFlagKey, boolean>);
  }, [keys]);

  useEffect(() => {
    // Same-tab updates via custom event
    const handleChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: FeatureFlagKey }>;
      if (keys.includes(customEvent.detail.key)) {
        setFlags(prev => ({ ...prev, [customEvent.detail.key]: getFeatureFlag(customEvent.detail.key) }));
      }
    };

    // Cross-tab updates via storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith('ff_')) {
        const flagKey = e.key.replace('ff_', '') as FeatureFlagKey;
        if (keys.includes(flagKey)) {
          setFlags(prev => ({ ...prev, [flagKey]: getFeatureFlag(flagKey) }));
        }
      }
    };

    window.addEventListener('featureFlagChange', handleChange);
    window.addEventListener('storage', handleStorage);
    
    return () => {
      window.removeEventListener('featureFlagChange', handleChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [keys, refreshFlags]);

  return flags;
}
