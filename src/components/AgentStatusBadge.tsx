import { AgentStatus } from '@/types';
import { cn } from '@/lib/utils';

interface AgentStatusBadgeProps {
  status: AgentStatus;
  className?: string;
}

const statusConfig = {
  live: {
    label: 'Live',
    className: 'status-badge-live',
  },
  ready_to_test: {
    label: 'Ready to Test',
    className: 'status-badge-ready',
  },
  paused: {
    label: 'Paused',
    className: 'status-badge-paused',
  },
  finished: {
    label: 'Finished',
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