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
  paused: {
    label: 'PAUSED',
    className: 'status-badge-paused',
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