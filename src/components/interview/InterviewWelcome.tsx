import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Agent } from '@/types';
import { Mic, Clock, Shield, AlertCircle, ExternalLink, Bot, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';

interface InterviewWelcomeProps {
  agent: Agent;
  onStart: () => void;
}

export function InterviewWelcome({ agent, onStart }: InterviewWelcomeProps) {
  const [step, setStep] = useState<'consent' | 'mic'>('consent');
  const [consentGiven, setConsentGiven] = useState(false);
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isRequestingMic, setIsRequestingMic] = useState(false);
  const { toast } = useToast();

  const requestMicrophonePermission = async () => {
    setIsRequestingMic(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      toast({
        title: 'Microphone enabled',
        description: 'You can now start the interview.',
      });
    } catch (error) {
      setMicPermission('denied');
      toast({
        title: 'Microphone access denied',
        description: 'Please allow microphone access to participate in the interview.',
        variant: 'destructive',
      });
    } finally {
      setIsRequestingMic(false);
    }
  };

  const handleConsentContinue = () => {
    setStep('mic');
    requestMicrophonePermission();
  };

  const estimatedDuration = (agent as any).targetDurationMin || 20;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {step === 'consent' ? (
              <Mic className="h-8 w-8 text-primary" />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {step === 'consent' ? 'Welcome!' : 'Almost there!'}
          </CardTitle>
          <CardDescription>
            {step === 'consent' 
              ? "We're excited to hear your thoughts. Here's what to expect:"
              : 'Just one more step before we begin.'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 'consent' && (
            <>
              {/* Interview Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Estimated duration: {estimatedDuration} minutes</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Bot className="h-4 w-4" />
                  <span>You'll be chatting with an AI interviewer</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Your responses will be recorded and transcribed</span>
                </div>
              </div>

              {/* Consent Section */}
              <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  By participating in this interview, you consent to the recording and processing of your responses.{' '}
                  <Link 
                    to="/privacy" 
                    target="_blank"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Privacy Policy
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </p>
                
                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="consent" 
                    checked={consentGiven}
                    onCheckedChange={(checked) => setConsentGiven(checked === true)}
                  />
                  <label 
                    htmlFor="consent" 
                    className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to participate in this interview
                  </label>
                </div>
              </div>

              {/* Continue Button */}
              <Button 
                onClick={handleConsentContinue} 
                className="w-full" 
                size="lg"
                disabled={!consentGiven}
              >
                Continue
              </Button>
            </>
          )}

          {step === 'mic' && (
            <>
              {/* Microphone Permission */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Microphone Access Required
                </h4>
                
                {micPermission === 'pending' && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Please allow microphone access when prompted by your browser.
                    </p>
                    {isRequestingMic && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                        Waiting for permission...
                      </div>
                    )}
                    {!isRequestingMic && (
                      <Button 
                        onClick={requestMicrophonePermission} 
                        variant="outline"
                        className="w-full"
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Request Microphone Access
                      </Button>
                    )}
                  </div>
                )}

                {micPermission === 'granted' && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Microphone enabled
                  </div>
                )}

                {micPermission === 'denied' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      Microphone access was denied
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Please enable microphone access in your browser settings and refresh the page.
                    </p>
                  </div>
                )}
              </div>

              {/* Start Button */}
              <Button 
                onClick={onStart} 
                className="w-full" 
                size="lg"
                disabled={micPermission !== 'granted'}
              >
                Start Interview
              </Button>

              {/* Back option */}
              <button 
                onClick={() => setStep('consent')}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
