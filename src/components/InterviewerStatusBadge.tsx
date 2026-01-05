import { InterviewerStatus } from '@/types';
import { cn } from '@/lib/utils';

interface InterviewerStatusBadgeProps {
  status: InterviewerStatus;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
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
  draft: {
    label: 'DRAFT',
    className: 'status-badge-ready',
  },
  published: {
    label: 'LIVE',
    className: 'status-badge-live',
  },
  unpublished: {
    label: 'PAUSED',
    className: 'status-badge-paused',
  },
};

export function InterviewerStatusBadge({ status, className }: InterviewerStatusBadgeProps) {
  const config = statusConfig[status] || { label: status.toUpperCase(), className: 'status-badge-ready' };
  
  return (
    <span className={cn(config.className, className)}>
      {config.label}
    </span>
  );
}
