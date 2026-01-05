import { AgentStatus } from '@/types';
import { cn } from '@/lib/utils';

interface AgentStatusBadgeProps {
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

export function AgentStatusBadge({ status, className }: AgentStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(config.className, className)}>
      {config.label}
    </span>
  );
}