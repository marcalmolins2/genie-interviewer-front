export type FeatureFlagKey = 
  | 'ASSISTED_CONFIGURATION'
  | 'MANUAL_CONFIGURATION'
  | 'CROSS_SESSION_INSIGHTS'
  | 'CHATBOT'
  | 'ROADMAP_EXAMPLE';

export type FeatureFlagCategory = 'production' | 'experimental' | 'roadmap';

interface FeatureFlagDefinition {
  key: FeatureFlagKey;
  defaultEnabled: boolean;
  description: string;
  category: FeatureFlagCategory;
}

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

// Get current flag state (localStorage overrides > defaults)
export function getFeatureFlag(key: FeatureFlagKey): boolean {
  const override = localStorage.getItem(`ff_${key}`);
  if (override !== null) {
    return override === 'true';
  }
  return FEATURE_FLAGS[key].defaultEnabled;
}

// Set flag override
export function setFeatureFlag(key: FeatureFlagKey, enabled: boolean): void {
  localStorage.setItem(`ff_${key}`, String(enabled));
  window.dispatchEvent(new CustomEvent('featureFlagChange', { detail: { key, enabled } }));
}

// Clear override (revert to default)
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

// Get flags by category
export function getFeatureFlagsByCategory(category: FeatureFlagCategory): Array<FeatureFlagDefinition & { currentValue: boolean; hasOverride: boolean }> {
  return getAllFeatureFlags().filter(flag => flag.category === category);
}
