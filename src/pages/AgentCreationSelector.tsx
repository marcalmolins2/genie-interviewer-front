import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, MessageCircle, ArrowRight } from 'lucide-react';

export default function AgentCreationSelector() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Agent</h1>
        <p className="text-muted-foreground text-lg">
          Choose how you'd like to create your interview agent
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Manual Creation */}
        <Card className="hover:shadow-lg transition-all duration-200 hover:border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Manual Setup</CardTitle>
            <CardDescription className="text-base">
              Full control over every aspect of your agent configuration
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
              <Link to="/app/agents/new/manual" className="block">
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

        {/* AI-Assisted Creation */}
        <Card className="hover:shadow-lg transition-all duration-200 hover:border-primary/20 relative">
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
            Recommended
          </div>
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">AI-Assisted Setup</CardTitle>
            <CardDescription className="text-base">
              Let our AI guide you through creating the perfect agent
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
                <span>AI suggests optimal configurations</span>
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
              <Link to="/app/agents/new/assisted" className="block">
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
      </div>

      <div className="text-center mt-8 text-sm text-muted-foreground">
        Both methods create equally powerful agents. Choose based on your preference and experience level.
      </div>
    </div>
  );
}