import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Phone, MessageSquare } from 'lucide-react';
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
      <CardContent className="p-6 space-y-4">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold leading-tight">{summary.headline}</h2>
          
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Calendar className="h-3 w-3" />
              {date}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {duration}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <ChannelIcon className="h-3 w-3" />
              {channel === 'inbound_call' ? 'Call' : 'Chat'}
            </Badge>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          {summary.narrativeParagraph}
        </p>
      </CardContent>
    </Card>
  );
}
