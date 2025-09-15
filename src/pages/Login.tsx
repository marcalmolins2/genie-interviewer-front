import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleOktaLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate Okta authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation, this would integrate with Okta Sign-In Widget
      // For demo purposes, we'll simulate successful login
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        email: 'consultant@bcg.com',
        name: 'Sarah Chen',
        organizationId: 'bcg-lumen'
      }));
      
      navigate('/agents');
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <img 
              src="/lovable-uploads/0d665f3b-7af8-4635-bd06-54729cc704ea.png" 
              alt="Genie Logo" 
              className="h-10 w-auto"
            />
          </Link>
          
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to your Genie Interviewers account
          </p>
        </div>

        {/* Login Card */}
        <Card className="card-elevated">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Use your credentials to access Genie Interviewers
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Okta SSO Button */}
            <Button 
              onClick={handleOktaLogin}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign in with Okta SSO'
              )}
            </Button>

            {/* Help Text */}
            <div className="text-center text-sm text-muted-foreground space-y-2 pt-4">
              <p>
                Having trouble signing in?{' '}
                <a href="#" className="text-primary hover:underline">
                  Contact IT Support
                </a>
              </p>
              <p className="text-xs">
                This application requires Okta credentials for production access.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            © 2024 Genie Interviewers. Enterprise security and compliance enabled.
          </p>
        </div>
      </div>
    </div>
  );
}