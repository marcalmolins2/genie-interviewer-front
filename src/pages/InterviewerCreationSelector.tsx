import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { FeatureFlag } from '@/components/FeatureFlag';
import { useFeatureFlags } from '@/hooks/useFeatureFlag';

export default function AgentCreationSelector() {
  const flags = useFeatureFlags(['ASSISTED_CONFIGURATION', 'MANUAL_CONFIGURATION', 'GUIDED_CONFIGURATION']);
  const manualEnabled = flags.MANUAL_CONFIGURATION;
  const guidedEnabled = flags.GUIDED_CONFIGURATION;

  // Count enabled options for grid layout
  const enabledCount = [flags.ASSISTED_CONFIGURATION, manualEnabled, guidedEnabled].filter(Boolean).length;

  const getGridCols = () => {
    if (enabledCount === 1) return '';
    if (enabledCount === 2) return 'md:grid-cols-2';
    return 'md:grid-cols-3';
  };

  return (
    <div className="container max-w-5xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Interviewer</h1>
        <p className="text-muted-foreground text-lg">
          Choose how you'd like to create your interviewer
        </p>
      </div>

      <div className={`grid grid-cols-1 ${getGridCols()} gap-6 max-w-5xl mx-auto`}>
        {/* Guided Setup - AI-powered (NEW) */}
        <FeatureFlag flag="GUIDED_CONFIGURATION">
          <Card className="hover:shadow-lg transition-all duration-200 hover:border-primary/20 relative border-primary/30">
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              New
            </div>
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Guided Setup</CardTitle>
              <CardDescription className="text-base">
                Describe your research and let AI create the perfect interview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>AI analyzes your research context</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Auto-generates interview guide & settings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Refine with AI-powered suggestions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Fastest path from idea to interview</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Link to="/app/interviewers/new/guided" className="block">
                  <Button className="w-full group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                Estimated time: 3-5 minutes
              </div>
            </CardContent>
          </Card>
        </FeatureFlag>

        {/* Manual Creation */}
        <FeatureFlag flag="MANUAL_CONFIGURATION">
          <Card className="hover:shadow-lg transition-all duration-200 hover:border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Manual Setup</CardTitle>
              <CardDescription className="text-base">
                Full control over every aspect of your interviewer configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Step-by-step configuration wizard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Detailed control over interview guide structure</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Advanced customization options</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Perfect for experienced users</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Link to="/app/interviewers/new/manual" className="block">
                  <Button className="w-full group">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                Estimated time: 10-15 minutes
              </div>
            </CardContent>
          </Card>
        </FeatureFlag>

        {/* AI-Assisted Creation */}
        <FeatureFlag flag="ASSISTED_CONFIGURATION">
          <Card className="hover:shadow-lg transition-all duration-200 hover:border-primary/20 relative">
            {manualEnabled && !guidedEnabled && (
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                Recommended
              </div>
            )}
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Genie-Assisted Setup</CardTitle>
              <CardDescription className="text-base">
                Let our genie guide you through creating the perfect interviewer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Conversational setup process</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Genie suggests optimal configurations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Automatic interview guide generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Perfect for beginners</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Link to="/app/interviewers/new/assisted" className="block">
                  <Button className="w-full group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                    Start Conversation
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                Estimated time: 5-8 minutes
              </div>
            </CardContent>
          </Card>
        </FeatureFlag>
      </div>

      <div className="text-center mt-8 text-sm text-muted-foreground">
        All methods create equally powerful interviewers. Choose based on your preference and experience level.
      </div>
    </div>
  );
}
