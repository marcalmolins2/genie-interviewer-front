import { useState, useEffect, useMemo } from 'react';
import { AgentPermission, AgentCollaborator } from '@/types';
import { agentsService } from '@/services/agents';

interface UseAgentPermissionResult {
  permission: AgentPermission | null;
  collaborators: AgentCollaborator[];
  isOwner: boolean;
  canEdit: boolean;
  canView: boolean;
  canManageCollaborators: boolean;
  canArchive: boolean;
  canDelete: boolean;
  loading: boolean;
  reload: () => Promise<void>;
}

export function useAgentPermission(agentId: string | undefined): UseAgentPermissionResult {
  const [permission, setPermission] = useState<AgentPermission | null>(null);
  const [collaborators, setCollaborators] = useState<AgentCollaborator[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!agentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [userPermission, collabs] = await Promise.all([
        agentsService.getUserPermission(agentId),
        agentsService.getAgentCollaborators(agentId)
      ]);
      setPermission(userPermission);
      setCollaborators(collabs);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      setPermission(null);
      setCollaborators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [agentId]);

  const derived = useMemo(() => {
    const isOwner = permission === 'owner';
    const canEdit = permission === 'owner' || permission === 'editor';
    const canView = permission !== null;
    const canManageCollaborators = permission === 'owner';
    const canArchive = permission === 'owner';
    const canDelete = permission === 'owner';

    return {
      isOwner,
      canEdit,
      canView,
      canManageCollaborators,
      canArchive,
      canDelete
    };
  }, [permission]);

  return {
    permission,
    collaborators,
    ...derived,
    loading,
    reload: loadData
  };
}
