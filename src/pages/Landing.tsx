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
    { type: 'inbound_call', icon: Phone, name: 'Inbound Call', price: PRICE_BY_CHANNEL.inbound_call },
    { type: 'outbound_call', icon: PhoneCall, name: 'Outbound Call', price: PRICE_BY_CHANNEL.outbound_call },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation & Hero Combined */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-20" />
        
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
        <section className="py-12 relative">
           <div className="container relative">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Genie Interviewers
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up">
                Streamline your case team research with intelligent interview agents. 
                Create, deploy, and analyze conversations at scale.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Key Features Overview */}
      <section className="py-10">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Transform Your Research in Three Steps
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From setup to insights - powered by cutting-edge AI technology
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Easy Setup */}
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <Zap className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-3 transition-colors duration-300 group-hover:text-primary">
                  Easy User-Friendly Setup
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Create professional interview agents in minutes with our intuitive wizard. 
                  No technical expertise required - just configure and deploy.
                </p>
              </div>

              {/* Human-like Interviewers */}
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <MessageCircle className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-3 transition-colors duration-300 group-hover:text-primary">
                  Highly Human Interviewers
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Natural conversation flow with realistic human voices. 
                  Adaptive questioning that follows up and digs deeper just like a real interviewer.
                </p>
              </div>

              {/* Automated Insights */}
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <BarChart3 className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-3 transition-colors duration-300 group-hover:text-primary">
                  Automated Insights Extraction
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Real-time analysis and intelligent extraction of key insights. 
                  Transform conversations into actionable intelligence automatically.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Available Archetypes */}
      <section className="py-10 bg-muted/30">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Available Interview Archetypes
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose from our specialized AI interviewers, each designed for specific research scenarios
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">Expert Deep Dive</h3>
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
              <div className="p-6 pt-0">
                <Link to="/login">
                  <Button className="gap-2 w-full">
                    Build This Agent <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-shadow flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">Maturity Assessment</h3>
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
              <div className="p-6 pt-0">
                <Link to="/login">
                  <Button className="gap-2 w-full">
                    Build This Agent <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-shadow flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">Belief Audits</h3>
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
              <div className="p-6 pt-0">
                <Link to="/login">
                  <Button className="gap-2 w-full">
                    Build This Agent <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-shadow flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">Surveys at Scale</h3>
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
              <div className="p-6 pt-0">
                <Link to="/login">
                  <Button className="gap-2 w-full">
                    Build This Agent <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-lg text-muted-foreground italic">
              ... and many more specialized archetypes to come
            </p>
          </div>
        </div>
      </section>

      {/* Available Channels */}
      <section className="py-10">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Multiple Communication Channels
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Deploy your interview agents across different channels to reach your audience where they are
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {channels.map((channel) => (
              <Card key={channel.type} className="text-center hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                    <channel.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{channel.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {channel.type === 'chat' && 'Web-based text conversations with instant responses'}
                    {channel.type === 'inbound_call' && 'Receive calls with natural voice interactions'}
                    {channel.type === 'outbound_call' && 'Proactively reach out to interview participants'}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From concept to insights in five simple steps
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 shadow-lg">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold mb-2 transition-colors duration-300 group-hover:text-primary">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join BCG case teams already using Genie Interviewers to accelerate their research.
            </p>
            
            <Link to="/login">
              <Button size="lg" className="gap-2">
                Create Your First Agent <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              © 2024 Genie Interviewers. Built for case teams with enterprise security and compliance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}