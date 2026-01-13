import { InterviewerStatus } from '@/types';
import { cn } from '@/lib/utils';

interface InterviewerStatusBadgeProps {
  status: InterviewerStatus;
  className?: string;
}

const statusConfig: Record<InterviewerStatus, { label: string; className: string }> = {
  draft: {
    label: 'DRAFT',
    className: 'status-badge-ready',
  },
  ready_to_test: {
    label: 'READY',
    className: 'status-badge-ready',
  },
  live: {
    label: 'LIVE',
    className: 'status-badge-live',
  },
  paused: {
    label: 'PAUSED',
    className: 'status-badge-paused',
  },
  archived: {
    label: 'ARCHIVED',
    className: 'status-badge-archived',
  },
  finished: {
    label: 'FINISHED',
    className: 'status-badge-finished',
  },
};

export function InterviewerStatusBadge({ status, className }: InterviewerStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(config.className, className)}>
      {config.label}
    </span>
  );
}

// Legacy alias for backward compatibility
export const AgentStatusBadge = InterviewerStatusBadge;
