import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getFeatureFlag, 
  getFeatureFlagAsync, 
  setFeatureFlagAsync,
  FeatureFlagKey,
  getAllFeatureFlagsAsync,
  FeatureFlagCategory,
} from '@/lib/featureFlags';

// Query key factory
const featureFlagKeys = {
  all: ['featureFlags'] as const,
  flag: (key: FeatureFlagKey) => ['featureFlags', key] as const,
};

// Hook for single feature flag with real-time updates
export function useFeatureFlag(key: FeatureFlagKey): boolean {
  // Synchronous initial value from cache/localStorage
  const [value, setValue] = useState(() => getFeatureFlag(key));
  
  // Fetch from Supabase asynchronously
  const { data } = useQuery({
    queryKey: featureFlagKeys.flag(key),
    queryFn: () => getFeatureFlagAsync(key),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
  
  // Update from query result
  useEffect(() => {
    if (data !== undefined) {
      setValue(data);
    }
  }, [data]);
  
  // Listen for localStorage changes (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `ff_${key}`) {
        setValue(e.newValue === 'true');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);
  
  // Listen for custom feature flag change events
  useEffect(() => {
    const handleFlagChange = (e: CustomEvent<{ key: FeatureFlagKey; enabled?: boolean }>) => {
      if (e.detail.key === key) {
        // Re-fetch the flag value
        getFeatureFlagAsync(key).then(setValue);
      }
    };
    
    window.addEventListener('featureFlagChange', handleFlagChange as EventListener);
    return () => window.removeEventListener('featureFlagChange', handleFlagChange as EventListener);
  }, [key]);
  
  return value;
}

// Hook for all feature flags (admin panel)
export function useAllFeatureFlags() {
  const queryClient = useQueryClient();
  
  const { data: flags, isLoading, error, refetch } = useQuery({
    queryKey: featureFlagKeys.all,
    queryFn: getAllFeatureFlagsAsync,
    staleTime: 30000, // 30 seconds
  });
  
  // Toggle a flag
  const toggleFlag = useCallback(async (key: FeatureFlagKey, enabled: boolean) => {
    await setFeatureFlagAsync(key, enabled);
    // Invalidate queries to refetch
    queryClient.invalidateQueries({ queryKey: featureFlagKeys.all });
    queryClient.invalidateQueries({ queryKey: featureFlagKeys.flag(key) });
  }, [queryClient]);
  
  // Get flags by category
  const getFlagsByCategory = useCallback((category: FeatureFlagCategory) => {
    return (flags || []).filter(flag => flag.category === category);
  }, [flags]);
  
  return {
    flags: flags || [],
    isLoading,
    error,
    refetch,
    toggleFlag,
    getFlagsByCategory,
  };
}

// Hook for checking multiple flags at once
export function useFeatureFlags(keys: FeatureFlagKey[]): Record<FeatureFlagKey, boolean> {
  const [values, setValues] = useState<Record<FeatureFlagKey, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    keys.forEach(key => {
      initial[key] = getFeatureFlag(key);
    });
    return initial as Record<FeatureFlagKey, boolean>;
  });
  
  useEffect(() => {
    const fetchFlags = async () => {
      const results: Record<string, boolean> = {};
      await Promise.all(
        keys.map(async key => {
          results[key] = await getFeatureFlagAsync(key);
        })
      );
      setValues(results as Record<FeatureFlagKey, boolean>);
    };
    
    fetchFlags();
  }, [keys.join(',')]);

  // Listen for changes
  useEffect(() => {
    const handleChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: FeatureFlagKey }>;
      if (keys.includes(customEvent.detail.key)) {
        getFeatureFlagAsync(customEvent.detail.key).then(val => {
          setValues(prev => ({ ...prev, [customEvent.detail.key]: val }));
        });
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith('ff_')) {
        const flagKey = e.key.replace('ff_', '') as FeatureFlagKey;
        if (keys.includes(flagKey)) {
          setValues(prev => ({ ...prev, [flagKey]: e.newValue === 'true' }));
        }
      }
    };

    window.addEventListener('featureFlagChange', handleChange);
    window.addEventListener('storage', handleStorage);
    
    return () => {
      window.removeEventListener('featureFlagChange', handleChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [keys]);
  
  return values;
}

export default useFeatureFlag;
