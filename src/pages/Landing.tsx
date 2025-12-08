import { Button } from '@/components/ui/button';
import WaitlistDialog from '@/components/WaitlistDialog';
import { Link } from 'react-router-dom';

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
            {/* Stylized "g" - using gradients */}
            <div className="relative w-[400px] h-[500px] lg:w-[500px] lg:h-[600px]">
              {/* Sparkle */}
              <div className="absolute top-4 right-1/3 animate-sparkle">
                <svg 
                  width="60" 
                  height="60" 
                  viewBox="0 0 60 60" 
                  fill="none" 
                  className="text-white/90"
                >
                  <path 
                    d="M30 0L32.5 27.5L60 30L32.5 32.5L30 60L27.5 32.5L0 30L27.5 27.5L30 0Z" 
                    fill="currentColor"
                  />
                </svg>
              </div>
              
              {/* The "g" shape using SVG with gradient */}
              <svg 
                viewBox="0 0 400 500" 
                className="w-full h-full"
                style={{ filter: 'drop-shadow(0 0 40px rgba(100, 200, 150, 0.3))' }}
              >
                <defs>
                  <linearGradient id="genieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(180, 40%, 70%)" stopOpacity="0.9" />
                    <stop offset="30%" stopColor="hsl(160, 45%, 55%)" stopOpacity="0.85" />
                    <stop offset="60%" stopColor="hsl(140, 50%, 50%)" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="hsl(100, 60%, 50%)" stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(168, 35%, 18%)" />
                    <stop offset="100%" stopColor="hsl(168, 35%, 22%)" />
                  </linearGradient>
                </defs>
                
                {/* Outer g shape */}
                <path 
                  d="M200 60 
                     C 300 60, 340 130, 340 200 
                     C 340 270, 300 340, 200 340 
                     C 100 340, 60 270, 60 200 
                     C 60 130, 100 60, 200 60
                     M200 120
                     C 140 120, 110 160, 110 200
                     C 110 240, 140 280, 200 280
                     C 260 280, 290 240, 290 200
                     C 290 160, 260 120, 200 120"
                  fill="url(#genieGradient)"
                  fillRule="evenodd"
                />
                
                {/* Tail of g */}
                <path 
                  d="M290 280
                     C 300 320, 290 380, 250 420
                     C 210 460, 150 480, 120 470
                     C 100 465, 90 450, 100 440
                     C 110 430, 140 440, 180 430
                     C 220 420, 250 390, 260 340
                     C 265 310, 270 290, 290 280"
                  fill="url(#genieGradient)"
                />
                
                {/* Inner hole of g */}
                <ellipse 
                  cx="200" 
                  cy="200" 
                  rx="70" 
                  ry="70" 
                  fill="url(#innerGradient)"
                />
              </svg>
            </div>
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
