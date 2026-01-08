import { Link } from 'react-router-dom';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';

interface SessionInfo {
  id: string;
  date: string;
  interviewerId: string;
}

interface SessionCitationProps {
  sessions: SessionInfo[];
  displayNumbers: number[];
  className?: string;
}

export function SessionCitation({ sessions, displayNumbers, className }: SessionCitationProps) {
  if (sessions.length === 0 || displayNumbers.length === 0) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 cursor-pointer",
            className
          )}
        >
          {displayNumbers.map((num) => (
            <span
              key={num}
              className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-medium rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
            >
              {num}
            </span>
          ))}
        </span>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-64 p-2">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Sources ({sessions.length})
          </p>
          {sessions.map((session, index) => (
            <Link
              key={session.id}
              to={`/app/interviewers/${session.interviewerId}/sessions/${session.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-1.5 rounded hover:bg-muted transition-colors text-sm"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded bg-primary/20 text-primary text-[10px] flex items-center justify-center font-medium">
                {displayNumbers[index]}
              </span>
              <span className="text-foreground hover:text-primary transition-colors">
                Session from {formatDate(session.date)}
              </span>
            </Link>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
