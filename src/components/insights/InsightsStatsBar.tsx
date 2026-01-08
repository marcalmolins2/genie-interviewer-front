import { MessageSquare, CheckCircle, Clock } from 'lucide-react';

interface InsightsStatsBarProps {
  totalSessions: number;
  completionRate: number;
  avgDuration: string;
}

export function InsightsStatsBar({ totalSessions, completionRate, avgDuration }: InsightsStatsBarProps) {
  return (
    <div className="flex items-center justify-start gap-6 px-4 py-3 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{totalSessions}</span>
        <span className="text-sm text-muted-foreground">Sessions</span>
      </div>
      
      <div className="h-4 w-px bg-border" />
      
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{completionRate}%</span>
        <span className="text-sm text-muted-foreground">Completion</span>
      </div>
      
      <div className="h-4 w-px bg-border" />
      
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{avgDuration}</span>
        <span className="text-sm text-muted-foreground">Avg Duration</span>
      </div>
    </div>
  );
}
