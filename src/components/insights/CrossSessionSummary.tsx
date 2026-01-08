import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Calendar, Clock, Users } from 'lucide-react';
import { CrossSessionSummary as CrossSessionSummaryType } from '@/types';

interface CrossSessionSummaryProps {
  summary: CrossSessionSummaryType;
}

export function CrossSessionSummary({ summary }: CrossSessionSummaryProps) {
  const { headline = 'Executive Summary', narrativeParagraph, keyTakeaways, stats } = summary;

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    
    if (startDate.getFullYear() !== endDate.getFullYear()) {
      return `${startDate.toLocaleDateString('en-US', { ...options, year: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
    }
    return `${startDate.toLocaleDateString('en-US', options)} – ${endDate.toLocaleDateString('en-US', options)}, ${endDate.getFullYear()}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <Card className="bg-muted/40 border-muted">
      <CardContent className="pt-5 pb-5 space-y-4">
        {/* Header row with headline and stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-lg font-semibold">{headline}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <Users className="h-3 w-3" />
              {stats.sessionCount} sessions
            </Badge>
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <Clock className="h-3 w-3" />
              {formatDuration(stats.totalDurationMinutes)}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <Calendar className="h-3 w-3" />
              {formatDateRange(stats.dateRange.start, stats.dateRange.end)}
            </Badge>
          </div>
        </div>

        {/* Narrative paragraph */}
        <p className="text-muted-foreground leading-relaxed">
          {narrativeParagraph}
        </p>

        {/* Key takeaways */}
        <ul className="space-y-2">
          {keyTakeaways.map((takeaway, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm">{takeaway}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
