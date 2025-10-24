import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  BarChart3, 
  Users, 
  MessageCircle,
  Phone,
  PhoneCall,
  CheckCircle,
  Sparkles,
  Settings,
  Play,
  Rocket,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ARCHETYPES, PRICE_BY_CHANNEL } from '@/types';

export default function Landing() {
  const features = [
    {
      icon: Zap,
      title: 'Create in Minutes',
      description: 'Set up AI interview agents with our intuitive wizard in just a few clicks.',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Get instant insights from conversations with powerful analysis tools.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Okta SSO integration and enterprise-grade data protection.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Share agents and insights across your BCG case team.',
    },
  ];

  const steps = [
    { title: 'Create', description: 'Choose archetype and configure your agent', icon: Sparkles },
    { title: 'Configure', description: 'Add interview guide and knowledge base', icon: Settings },
    { title: 'Test', description: 'Validate with sample conversations', icon: Play },
    { title: 'Deploy', description: 'Go live with your case code', icon: Rocket },
    { title: 'Analyze', description: 'Extract insights from conversations', icon: TrendingUp },
  ];

  const channels = [
    { type: 'chat', icon: MessageCircle, name: 'Chat', price: PRICE_BY_CHANNEL.chat },
    { type: 'voice', icon: Phone, name: 'Voice', price: PRICE_BY_CHANNEL.inbound_call },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation & Hero Combined */}
      <div className="relative">
        {/* Navigation */}
        <nav className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/40 sticky top-0 z-50 relative">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/0d665f3b-7af8-4635-bd06-54729cc704ea.png" 
                alt="Genie Logo" 
                className="h-10 w-auto"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-16">
           <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Genie Interviewers
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up">
                Your internal platform for AI-powered research interviews. Create specialized interview agents, 
                deploy them across chat and voice channels, and extract insights from conversations.
              </p>
              
              <Link to="/login">
                <Button size="lg" className="gap-2">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>


      {/* Available Archetypes */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Available Interview Archetypes
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Select the archetype that best fits your research needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card/90 to-muted/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="p-6 flex-1 relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative">
                    <Sparkles className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">Expert Deep Dive</h3>
                </div>
                <div className="text-muted-foreground leading-relaxed space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-sm">Conducts technical deep-dives with industry expertise</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-sm">Follows up with probing questions based on responses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-sm">Adapts questioning style to interviewee expertise level</span>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0 relative">
                <Link to="/login">
                  <Button className="gap-2 w-full">
                    Build This Agent <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card/90 to-muted/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="p-6 flex-1 relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative">
                    <BarChart3 className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">Maturity Assessment</h3>
                </div>
                <div className="text-muted-foreground leading-relaxed space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-sm">Evaluates organizational capabilities across multiple dimensions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-sm">Maintains consistent scoring framework across interviews</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-sm">Generates comparative analysis and benchmarking insights</span>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0 relative">
                <Link to="/login">
                  <Button className="gap-2 w-full">
                    Build This Agent <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card/90 to-muted/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="p-6 flex-1 relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative">
                    <Users className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">Belief Audits</h3>
                </div>
                <div className="text-muted-foreground leading-relaxed space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-sm">Explores underlying assumptions and mental models</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-sm">Identifies cultural patterns and organizational beliefs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-sm">Maps belief systems across different stakeholder groups</span>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0 relative">
                <Link to="/login">
                  <Button className="gap-2 w-full">
                    Build This Agent <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card/90 to-muted/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="p-6 flex-1 relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative">
                    <MessageCircle className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">Surveys at Scale</h3>
                </div>
                <div className="text-muted-foreground leading-relaxed space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-sm">Conducts structured interviews with standardized questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-sm">Adapts question flow based on previous responses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-sm">Aggregates responses for statistical analysis</span>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0 relative">
                <Link to="/login">
                  <Button className="gap-2 w-full">
                    Build This Agent <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              © 2024 Genie Interviewers - BCG Internal Tool
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}