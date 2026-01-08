import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Calendar, Clock, Phone, MessageSquare } from 'lucide-react';
import type { SessionSummary, Channel } from '@/types';

interface SessionExecutiveSummaryProps {
  summary?: SessionSummary;
  date: string;
  duration: string;
  channel: Channel;
}

export function SessionExecutiveSummary({ summary, date, duration, channel }: SessionExecutiveSummaryProps) {
  if (!summary) {
    return (
      <Card className="bg-muted/40 border-muted">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-sm">Summary not available for this session.</p>
        </CardContent>
      </Card>
    );
  }

  const ChannelIcon = channel === 'inbound_call' ? Phone : MessageSquare;

  return (
    <Card className="bg-muted/40 border-muted">
      <CardContent className="pt-5 pb-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-lg font-semibold">{summary.headline}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <Calendar className="h-3 w-3" />
              {date}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <Clock className="h-3 w-3" />
              {duration}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <ChannelIcon className="h-3 w-3" />
              {channel === 'inbound_call' ? 'Call' : 'Chat'}
            </Badge>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          {summary.narrativeParagraph}
        </p>

        {summary.keyTakeaways && summary.keyTakeaways.length > 0 && (
          <ul className="space-y-2">
            {summary.keyTakeaways.map((takeaway, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm">{takeaway}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
