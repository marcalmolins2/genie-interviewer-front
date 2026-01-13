import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import type { FeatureFlagCategory } from '@/integrations/supabase/database.types';

export type FeatureFlagKey = 
  | 'ASSISTED_CONFIGURATION'
  | 'MANUAL_CONFIGURATION'
  | 'CROSS_SESSION_INSIGHTS'
  | 'CHATBOT'
  | 'ROADMAP_EXAMPLE';

export type { FeatureFlagCategory };

interface FeatureFlagDefinition {
  key: FeatureFlagKey;
  defaultEnabled: boolean;
  description: string;
  category: FeatureFlagCategory;
}

// Default flag definitions (used as fallback when Supabase is unavailable)
export const FEATURE_FLAGS: Record<FeatureFlagKey, FeatureFlagDefinition> = {
  ASSISTED_CONFIGURATION: {
    key: 'ASSISTED_CONFIGURATION',
    defaultEnabled: true,
    description: 'Genie-assisted interviewer creation flow',
    category: 'production',
  },
  MANUAL_CONFIGURATION: {
    key: 'MANUAL_CONFIGURATION',
    defaultEnabled: true,
    description: 'Manual step-by-step interviewer creation',
    category: 'production',
  },
  CROSS_SESSION_INSIGHTS: {
    key: 'CROSS_SESSION_INSIGHTS',
    defaultEnabled: true,
    description: 'Cross-session Q&A and summary features',
    category: 'production',
  },
  CHATBOT: {
    key: 'CHATBOT',
    defaultEnabled: true,
    description: 'Genie assistant chatbot in header',
    category: 'production',
  },
  ROADMAP_EXAMPLE: {
    key: 'ROADMAP_EXAMPLE',
    defaultEnabled: false,
    description: 'Example future feature for exploration and design',
    category: 'roadmap',
  },
};

// In-memory cache for feature flags
let flagCache: Map<string, boolean> = new Map();
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute cache

// Fetch flags from Supabase and update cache
async function fetchAndCacheFlags(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  
  try {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('key, enabled');
    
    if (error) throw error;
    
    flagCache = new Map((data || []).map(f => [f.key, f.enabled]));
    cacheTimestamp = Date.now();
  } catch (error) {
    console.error('Failed to fetch feature flags:', error);
  }
}

// Check if cache is valid
function isCacheValid(): boolean {
  return Date.now() - cacheTimestamp < CACHE_TTL;
}

// Get current flag state (Supabase > localStorage overrides > defaults)
export function getFeatureFlag(key: FeatureFlagKey): boolean {
  // Check localStorage override first (allows local dev/testing)
  const override = localStorage.getItem(`ff_${key}`);
  if (override !== null) {
    return override === 'true';
  }
  
  // Check cache
  if (isCacheValid() && flagCache.has(key)) {
    return flagCache.get(key)!;
  }
  
  // Fall back to defaults
  return FEATURE_FLAGS[key].defaultEnabled;
}

// Async version that fetches from Supabase
export async function getFeatureFlagAsync(key: FeatureFlagKey): Promise<boolean> {
  // Check localStorage override first
  const override = localStorage.getItem(`ff_${key}`);
  if (override !== null) {
    return override === 'true';
  }
  
  if (!isSupabaseConfigured()) {
    return FEATURE_FLAGS[key].defaultEnabled;
  }
  
  // Refresh cache if stale
  if (!isCacheValid()) {
    await fetchAndCacheFlags();
  }
  
  if (flagCache.has(key)) {
    return flagCache.get(key)!;
  }
  
  return FEATURE_FLAGS[key].defaultEnabled;
}

// Set flag override (localStorage for local dev, Supabase for admin)
export function setFeatureFlag(key: FeatureFlagKey, enabled: boolean): void {
  localStorage.setItem(`ff_${key}`, String(enabled));
  window.dispatchEvent(new CustomEvent('featureFlagChange', { detail: { key, enabled } }));
}

// Set flag in Supabase (admin only)
export async function setFeatureFlagAsync(key: FeatureFlagKey, enabled: boolean): Promise<void> {
  if (!isSupabaseConfigured()) {
    setFeatureFlag(key, enabled);
    return;
  }
  
  const { error } = await supabase
    .from('feature_flags')
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq('key', key);
  
  if (error) throw error;
  
  // Update cache
  flagCache.set(key, enabled);
  
  // Dispatch event for React components
  window.dispatchEvent(new CustomEvent('featureFlagChange', { detail: { key, enabled } }));
}

// Clear override (revert to default or Supabase value)
export function clearFeatureFlagOverride(key: FeatureFlagKey): void {
  localStorage.removeItem(`ff_${key}`);
  window.dispatchEvent(new CustomEvent('featureFlagChange', { detail: { key } }));
}

// Get all flags with current states
export function getAllFeatureFlags(): Array<FeatureFlagDefinition & { currentValue: boolean; hasOverride: boolean }> {
  return Object.values(FEATURE_FLAGS).map(flag => ({
    ...flag,
    currentValue: getFeatureFlag(flag.key),
    hasOverride: localStorage.getItem(`ff_${flag.key}`) !== null,
  }));
}

// Async version that fetches from Supabase
export async function getAllFeatureFlagsAsync(): Promise<Array<FeatureFlagDefinition & { currentValue: boolean; hasOverride: boolean; supabaseValue?: boolean }>> {
  if (!isSupabaseConfigured()) {
    return getAllFeatureFlags();
  }
  
  // Refresh cache
  await fetchAndCacheFlags();
  
  return Object.values(FEATURE_FLAGS).map(flag => {
    const override = localStorage.getItem(`ff_${flag.key}`);
    const supabaseValue = flagCache.get(flag.key);
    
    return {
      ...flag,
      currentValue: override !== null 
        ? override === 'true' 
        : (supabaseValue ?? flag.defaultEnabled),
      hasOverride: override !== null,
      supabaseValue,
    };
  });
}

// Get flags by category
export function getFeatureFlagsByCategory(category: FeatureFlagCategory): Array<FeatureFlagDefinition & { currentValue: boolean; hasOverride: boolean }> {
  return getAllFeatureFlags().filter(flag => flag.category === category);
}

// Initialize flags from Supabase on app start
export async function initializeFeatureFlags(): Promise<void> {
  if (isSupabaseConfigured()) {
    await fetchAndCacheFlags();
  }
}
