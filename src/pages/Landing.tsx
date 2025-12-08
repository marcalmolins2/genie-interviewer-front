import { Button } from '@/components/ui/button';
import WaitlistDialog from '@/components/WaitlistDialog';
import { Link } from 'react-router-dom';
import genieLogo from '@/assets/genie-g-logo.png';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[hsl(168,35%,18%)] text-foreground relative overflow-hidden">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-8 py-6">
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
          {/* Genie Logo */}
          <div className="flex items-center">
            <span className="text-2xl text-white genie-logo">genie</span>
            <span className="genie-logo-ai text-white/70">AI</span>
          </div>
          
          {/* BCG X Logo */}
          <div className="text-white font-bold text-xl tracking-wider">
            BCG X
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen flex items-center">
        <div className="w-full max-w-[1800px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Genie "g" Graphic */}
          <div className="relative flex items-center justify-center lg:justify-start">
            <img 
              src={genieLogo} 
              alt="Genie AI" 
              className="w-[400px] h-auto lg:w-[500px] drop-shadow-[0_0_40px_rgba(100,200,150,0.3)]"
            />
          </div>

          {/* Right Side - Content */}
          <div className="text-center lg:text-left lg:pl-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight mb-6 animate-fade-in">
              Welcome
              <br />
              to the future of
              <br />
              AI Interviews
            </h1>
            
            <p className="text-lg text-white/70 mb-10 animate-slide-up">
              Log in to launch your first AI interviewer
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-scale-in">
              <Link to="/login">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary-dark text-primary-foreground px-12 py-6 text-lg rounded-full w-full sm:w-auto"
                >
                  SIGN IN With SSO
                </Button>
              </Link>
            </div>

            <div className="mt-8">
              <WaitlistDialog>
                <button className="text-white/60 hover:text-white/90 text-sm underline underline-offset-4 transition-colors">
                  Don't have access? Join the waitlist
                </button>
              </WaitlistDialog>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 px-8 py-6">
        <div className="max-w-[1800px] mx-auto flex justify-end">
          <p className="text-sm text-white/50">
            © Genie 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
