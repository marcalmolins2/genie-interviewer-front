import { Button } from '@/components/ui/button';
import WaitlistDialog from '@/components/WaitlistDialog';
import { Link } from 'react-router-dom';
import genieLogo from '@/assets/genie-g-logo.png';
import { Clock, Users, Brain, Settings, Play, BarChart3, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[hsl(168,35%,18%)] text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 bg-[hsl(168,35%,18%)]/80 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-[1400px] mx-auto">
          <div className="flex items-center">
            <span className="text-2xl text-white genie-logo">genie</span>
            <span className="genie-logo-ai text-white/70">AI</span>
          </div>
          <div className="text-white font-bold text-xl tracking-wider">
            BCG X
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-20">
        <div className="w-full max-w-[1400px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Genie "g" Graphic */}
          <div className="relative flex items-center justify-center lg:justify-start animate-fade-in">
            <img 
              src={genieLogo} 
              alt="Genie AI" 
              className="w-[300px] h-auto lg:w-[420px] drop-shadow-[0_0_60px_rgba(100,200,150,0.3)]"
            />
          </div>

          {/* Right Side - Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight mb-6 animate-fade-in">
              Qualitative Interviews
              <br />
              <span className="text-primary">at Scale</span>
            </h1>
            
            <p className="text-xl text-white/70 mb-10 max-w-lg animate-slide-up">
              Get the richness of one-on-one conversations at the scale your projects demand.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-scale-in">
              <Link to="/login">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary-dark text-primary-foreground px-12 py-6 text-lg rounded-full w-full sm:w-auto"
                >
                  Sign In with SSO
                </Button>
              </Link>
            </div>

            <div className="mt-6 animate-scale-in">
              <WaitlistDialog>
                <button className="text-white/60 hover:text-white/90 text-sm underline underline-offset-4 transition-colors">
                  Don't have access? Join the waitlist
                </button>
              </WaitlistDialog>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-[hsl(168,35%,15%)]">
        <div className="max-w-[1400px] mx-auto px-8">
          <h2 className="text-3xl md:text-4xl font-serif text-white text-center mb-16">
            Why Teams Choose Genie
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Save Time</h3>
              <p className="text-white/60 leading-relaxed">
                Deploy interviews in minutes, not weeks. Let AI handle the conversations while you focus on analysis.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Scale Effortlessly</h3>
              <p className="text-white/60 leading-relaxed">
                Run dozens of interviews simultaneously. No scheduling conflicts, no interviewer fatigue.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                <Brain className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Get Deeper Insights</h3>
              <p className="text-white/60 leading-relaxed">
                Consistent, unbiased questioning with full transcription and AI-powered analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="max-w-[1400px] mx-auto px-8">
          <h2 className="text-3xl md:text-4xl font-serif text-white text-center mb-4">
            How It Works
          </h2>
          <p className="text-white/60 text-center mb-16 text-lg">
            Launch your first AI interviewer in three simple steps
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-14 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            
            {/* Step 1 */}
            <div className="text-center relative">
              <div className="w-28 h-28 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-6 relative z-10 bg-[hsl(168,35%,18%)]">
                <Settings className="w-12 h-12 text-primary" />
              </div>
              <div className="text-primary font-bold text-sm mb-2">STEP 1</div>
              <h3 className="text-2xl font-semibold text-white mb-3">Configure</h3>
              <p className="text-white/60 max-w-xs mx-auto">
                Set up your interview guide, choose your AI interviewer's voice, and define screener questions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center relative">
              <div className="w-28 h-28 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-6 relative z-10 bg-[hsl(168,35%,18%)]">
                <Play className="w-12 h-12 text-primary" />
              </div>
              <div className="text-primary font-bold text-sm mb-2">STEP 2</div>
              <h3 className="text-2xl font-semibold text-white mb-3">Run</h3>
              <p className="text-white/60 max-w-xs mx-auto">
                Share your interview link or phone number. AI conducts natural, conversational interviews 24/7.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center relative">
              <div className="w-28 h-28 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-6 relative z-10 bg-[hsl(168,35%,18%)]">
                <BarChart3 className="w-12 h-12 text-primary" />
              </div>
              <div className="text-primary font-bold text-sm mb-2">STEP 3</div>
              <h3 className="text-2xl font-semibold text-white mb-3">Analyze</h3>
              <p className="text-white/60 max-w-xs mx-auto">
                Review cleaned transcripts, search across responses, and ask questions about your data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 bg-[hsl(168,35%,15%)]">
        <div className="max-w-[1400px] mx-auto px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">
            Great For
          </h2>
          <p className="text-white/60 mb-12 text-lg">
            Genie excels across a variety of qualitative research needs
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'Expert Deep Dives',
              'Customer Research',
              'Client Stakeholder Interviews',
              'Rapid Diagnostic Calls',
              'Market Exploration',
              'User Discovery',
              'Internal Feedback'
            ].map((useCase) => (
              <span 
                key={useCase}
                className="px-6 py-3 bg-white/5 border border-white/20 rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                {useCase}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-[800px] mx-auto px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-white/60 mb-10 text-lg">
            Launch your first AI interviewer today and discover insights at scale.
          </p>
          <Link to="/login">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-dark text-primary-foreground px-12 py-6 text-lg rounded-full group"
            >
              Sign In with SSO
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <span className="text-lg text-white/60 genie-logo">genie</span>
            <span className="text-sm text-white/40 ml-1">AI</span>
          </div>
          <p className="text-sm text-white/50">
            © Genie 2025 · Built by BCG X
          </p>
        </div>
      </footer>
    </div>
  );
}
