import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock } from 'lucide-react';

interface InterviewCompleteProps {
  duration: number;
}

export function InterviewComplete({ duration }: InterviewCompleteProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} seconds`;
    return `${mins} minute${mins !== 1 ? 's' : ''} ${secs > 0 ? `${secs} seconds` : ''}`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Thank You!</CardTitle>
          <CardDescription>
            Your interview has been completed successfully.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Duration: {formatDuration(duration)}</span>
          </div>

          <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
            <p>Your responses have been recorded and will be reviewed by the research team.</p>
          </div>

          <p className="text-sm text-muted-foreground">
            You may now close this window.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
