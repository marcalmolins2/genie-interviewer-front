import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Agent, ARCHETYPES } from '@/types';
import { Mic, Clock, Shield, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InterviewWelcomeProps {
  agent: Agent;
  onStart: () => void;
}

export function InterviewWelcome({ agent, onStart }: InterviewWelcomeProps) {
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isRequestingMic, setIsRequestingMic] = useState(false);
  const { toast } = useToast();

  const archetypeInfo = ARCHETYPES.find(a => a.id === agent.archetype);

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{agent.name}</CardTitle>
          <CardDescription>
            {archetypeInfo?.description || 'AI-powered interview'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Interview Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Estimated duration: 15-30 minutes</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>This interview will be recorded and transcribed</span>
            </div>
          </div>

          {/* Microphone Permission */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Microphone Access Required
            </h4>
            
            {micPermission === 'pending' && (
              <Button 
                onClick={requestMicrophonePermission} 
                className="w-full"
                disabled={isRequestingMic}
              >
                {isRequestingMic ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                    Requesting access...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Allow Microphone Access
                  </>
                )}
              </Button>
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

          {/* Privacy Note */}
          <p className="text-xs text-muted-foreground text-center">
            By starting this interview, you consent to the recording and processing of your responses for research purposes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
