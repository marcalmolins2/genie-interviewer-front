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
  const benefits = [
    {
      icon: Zap,
      title: 'Launch in Minutes',
      description: 'Create and deploy AI interview agents with an intuitive guided setup—no technical expertise required.',
    },
    {
      icon: MessageCircle,
      title: 'Multi-Channel Deployment',
      description: 'Deploy your agents across chat and voice channels to reach respondents where they are.',
    },
    {
      icon: BarChart3,
      title: 'Instant Insights',
      description: 'AI-powered analysis extracts themes, sentiments, and actionable insights from every conversation.',
    },
    {
      icon: Shield,
      title: 'Enterprise-Grade Security',
      description: 'Okta SSO integration and enterprise data protection built for BCG standards.',
    },
  ];

  const steps = [
    { 
      title: 'Choose Archetype', 
      description: 'Select from Expert Deep Dive, Maturity Assessment, Belief Audits, or Surveys at Scale', 
      icon: Sparkles 
    },
    { 
      title: 'Configure Agent', 
      description: 'Define interview flow, questions, and knowledge base in minutes', 
      icon: Settings 
    },
    { 
      title: 'Test & Refine', 
      description: 'Validate with sample conversations before going live', 
      icon: Play 
    },
    { 
      title: 'Deploy', 
      description: 'Launch on chat or voice with a unique case code', 
      icon: Rocket 
    },
    { 
      title: 'Analyze Results', 
      description: 'Extract insights with AI-powered analysis and export findings', 
      icon: TrendingUp 
    },
  ];

  const useCases = [
    {
      icon: Sparkles,
      title: 'Expert Deep Dive',
      description: 'Technical deep-dives with adaptive questioning',
      features: ['Probing follow-ups', 'Expertise-level adaptation', 'In-depth exploration']
    },
    {
      icon: BarChart3,
      title: 'Maturity Assessment',
      description: 'Evaluate organizational capabilities systematically',
      features: ['Consistent scoring framework', 'Multi-dimensional evaluation', 'Comparative benchmarking']
    },
    {
      icon: Users,
      title: 'Belief Audits',
      description: 'Uncover assumptions and mental models',
      features: ['Cultural pattern identification', 'Stakeholder belief mapping', 'Assumption exploration']
    },
    {
      icon: MessageCircle,
      title: 'Surveys at Scale',
      description: 'Structured interviews with statistical rigor',
      features: ['Standardized questions', 'Adaptive flow logic', 'Statistical aggregation']
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/0d665f3b-7af8-4635-bd06-54729cc704ea.png" 
              alt="Genie Logo" 
              className="h-10 w-auto"
            />
          </div>
          
          <Link to="/login">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 animate-fade-in">
              <Sparkles className="h-3 w-3 mr-1" />
              BCG Project Lumen
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in">
              AI-Powered Research
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Interviews at Scale
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up">
              Create specialized AI interview agents, deploy across chat and voice channels, 
              and extract actionable insights from every conversation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale-in">
              <Link to="/login">
                <Button size="lg" className="gap-2 text-lg px-8 h-14">
                  Launch Dashboard <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Trust Indicator */}
            <div className="mt-12 flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Secured by Okta SSO</span>
              <span className="text-muted-foreground/40">•</span>
              <span>Enterprise-grade data protection</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Why Genie Interviewers?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for BCG case teams to conduct scalable, consistent research interviews
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="group relative overflow-hidden border-0 bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="relative">
                  <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-base leading-relaxed">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              From Setup to Insights in 5 Steps
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Our guided workflow takes you from idea to actionable research data
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="relative flex gap-6 pb-12 last:pb-0"
              >
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-primary/10" />
                )}
                
                {/* Step Number & Icon */}
                <div className="relative flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                    {index + 1}
                  </div>
                </div>
                
                {/* Content */}
                <Card className="flex-1 border-0 bg-card hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <step.icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base leading-relaxed">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases / Archetypes */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Choose Your Interview Archetype
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Each archetype is optimized for specific research objectives and conversation styles
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card 
                key={index} 
                className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-muted/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="relative">
                  <div className="mb-4 inline-flex p-4 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110">
                    <useCase.icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors duration-300">
                    {useCase.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {useCase.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative">
                  <div className="space-y-2 mb-6">
                    {useCase.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link to="/login">
                    <Button className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Build This Agent <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link to="/login">
              <Button size="lg" className="gap-2 text-lg px-8 h-14">
                Start Creating Agents <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/0d665f3b-7af8-4635-bd06-54729cc704ea.png" 
                alt="Genie Logo" 
                className="h-8 w-auto"
              />
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2024 Genie Interviewers - BCG Project Lumen Internal Tool
            </p>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secured by Okta</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}