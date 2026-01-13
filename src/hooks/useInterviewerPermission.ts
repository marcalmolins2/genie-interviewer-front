import { useState, useEffect, useMemo } from 'react';
import { AgentPermission, AgentCollaborator } from '@/types';
import { interviewersService } from '@/services/interviewers';

interface UseInterviewerPermissionResult {
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

export function useInterviewerPermission(interviewerId: string | undefined): UseInterviewerPermissionResult {
  const [permission, setPermission] = useState<AgentPermission | null>(null);
  const [collaborators, setCollaborators] = useState<AgentCollaborator[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!interviewerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [userPermission, collabs] = await Promise.all([
        interviewersService.getUserPermission(interviewerId),
        interviewersService.getAgentCollaborators(interviewerId)
      ]);
      // Extract the role from the permission object
      if (userPermission) {
        setPermission(userPermission.role);
      } else {
        setPermission(null);
      }
      // Map collabs to AgentCollaborator format
      const mappedCollabs: AgentCollaborator[] = collabs.map(c => ({
        id: c.id,
        agentId: interviewerId,
        userId: c.userId,
        user: c.user ? {
          id: c.user.id,
          email: c.user.email,
          name: c.user.name,
          avatar: c.user.avatar,
        } : { id: c.userId, email: '', name: 'Unknown' },
        permission: c.role as AgentPermission,
        createdAt: c.createdAt,
        updatedAt: c.createdAt,
      }));
      setCollaborators(mappedCollabs);
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
  }, [interviewerId]);

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

// Legacy alias for backward compatibility
export const useAgentPermission = useInterviewerPermission;
