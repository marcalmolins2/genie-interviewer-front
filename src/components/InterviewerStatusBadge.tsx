import { AgentStatus } from '@/types';
import { cn } from '@/lib/utils';

interface InterviewerStatusBadgeProps {
  status: AgentStatus;
  className?: string;
}

const statusConfig = {
  live: {
    label: 'LIVE',
    className: 'status-badge-live',
  },
  ready_to_test: {
    label: 'DRAFT',
    className: 'status-badge-ready',
  },
  suspended: {
    label: 'SUSPENDED',
    className: 'status-badge-suspended',
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
