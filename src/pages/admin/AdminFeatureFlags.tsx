import { useState, useEffect } from 'react';
import { Flag, RotateCcw, FlaskConical, Rocket, Beaker } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FeatureFlagKey, 
  FeatureFlagCategory,
  getAllFeatureFlags, 
  setFeatureFlag, 
  clearFeatureFlagOverride,
  FEATURE_FLAGS
} from '@/lib/featureFlags';

const categoryConfig: Record<FeatureFlagCategory, { label: string; icon: typeof Flag; description: string }> = {
  production: {
    label: 'Production',
    icon: Rocket,
    description: 'Live features that can be toggled for all users',
  },
  experimental: {
    label: 'Experimental',
    icon: FlaskConical,
    description: 'Features in testing phase',
  },
  roadmap: {
    label: 'Roadmap',
    icon: Beaker,
    description: 'Future features for exploration and design',
  },
};

export default function AdminFeatureFlags() {
  const [flags, setFlags] = useState(getAllFeatureFlags());

  useEffect(() => {
    const handleChange = () => {
      setFlags(getAllFeatureFlags());
    };

    window.addEventListener('featureFlagChange', handleChange);
    return () => window.removeEventListener('featureFlagChange', handleChange);
  }, []);

  const handleToggle = (key: FeatureFlagKey, enabled: boolean) => {
    setFeatureFlag(key, enabled);
  };

  const handleReset = (key: FeatureFlagKey) => {
    clearFeatureFlagOverride(key);
  };

  const getFlagsByCategory = (category: FeatureFlagCategory) => {
    return flags.filter(flag => flag.category === category);
  };

  const categories: FeatureFlagCategory[] = ['production', 'experimental', 'roadmap'];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Flag className="h-6 w-6" />
          Feature Flags
        </h1>
        <p className="text-muted-foreground mt-1">
          Control feature availability across the application
        </p>
      </div>

      <Tabs defaultValue="production" className="space-y-4">
        <TabsList>
          {categories.map(category => {
            const config = categoryConfig[category];
            const count = getFlagsByCategory(category).length;
            return (
              <TabsTrigger key={category} value={category} className="gap-2">
                <config.icon className="h-4 w-4" />
                {config.label}
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map(category => {
          const config = categoryConfig[category];
          const categoryFlags = getFlagsByCategory(category);

          return (
            <TabsContent key={category} value={category} className="space-y-4">
              <p className="text-sm text-muted-foreground">{config.description}</p>
              
              {categoryFlags.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No {config.label.toLowerCase()} flags configured
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {categoryFlags.map(flag => {
                    const isModified = flag.hasOverride;
                    const isDifferentFromDefault = flag.currentValue !== flag.defaultEnabled;

                    return (
                      <Card key={flag.key} className={isModified ? 'ring-1 ring-primary/20' : ''}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-base flex items-center gap-2">
                                {flag.key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                {isModified && (
                                  <Badge variant="outline" className="text-xs">
                                    Modified
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription>{flag.description}</CardDescription>
                            </div>
                            <Switch
                              checked={flag.currentValue}
                              onCheckedChange={(checked) => handleToggle(flag.key, checked)}
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <span>
                                Default: <span className={flag.defaultEnabled ? 'text-green-600' : 'text-red-600'}>
                                  {flag.defaultEnabled ? 'ON' : 'OFF'}
                                </span>
                              </span>
                              {isDifferentFromDefault && (
                                <span className="text-amber-600">
                                  (Currently {flag.currentValue ? 'ON' : 'OFF'})
                                </span>
                              )}
                            </div>
                            {isModified && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReset(flag.key)}
                                className="h-7 text-xs"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Reset to default
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Usage</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>In components:</strong>{' '}
            <code className="bg-muted px-1 py-0.5 rounded text-xs">
              {'<FeatureFlag flag="FLAG_NAME">...</FeatureFlag>'}
            </code>
          </p>
          <p>
            <strong>In hooks:</strong>{' '}
            <code className="bg-muted px-1 py-0.5 rounded text-xs">
              {'const enabled = useFeatureFlag("FLAG_NAME")'}
            </code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
