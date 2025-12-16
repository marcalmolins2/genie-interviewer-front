import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface InterviewUnavailableProps {
  message: string;
}

export function InterviewUnavailable({ message }: InterviewUnavailableProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Interview Unavailable</CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact the person who shared this link with you.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
