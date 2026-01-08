import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Quote, ExternalLink } from 'lucide-react';

export interface KeyQuote {
  id: string;
  text: string;
  sessionId: string;
  sessionDate: string;
  speakerType: 'respondent';
}

interface KeyQuotesListProps {
  quotes: KeyQuote[];
  interviewerId: string;
}

export function KeyQuotesList({ quotes, interviewerId }: KeyQuotesListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-3">
      {quotes.map((quote) => (
        <Card key={quote.id} className="relative">
          <CardContent className="pt-4 pb-3">
            <Quote className="absolute top-3 left-3 h-4 w-4 text-primary/30" />
            <div className="pl-6">
              <p className="text-sm italic text-foreground leading-relaxed mb-3">
                "{quote.text}"
              </p>
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="text-xs">
                  Respondent
                </Badge>
                <Link
                  to={`/app/interviewers/${interviewerId}/sessions/${quote.sessionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Session from {formatDate(quote.sessionDate)}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
