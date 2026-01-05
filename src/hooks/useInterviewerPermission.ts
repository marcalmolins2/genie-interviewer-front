import { useState, useEffect, useMemo } from 'react';
import { InterviewerRole, InterviewerCollaborator } from '@/types';
import { interviewersService } from '@/services/interviewers';

interface UseInterviewerPermissionResult {
  permission: InterviewerRole | null;
  collaborators: InterviewerCollaborator[];
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
  const [permission, setPermission] = useState<InterviewerRole | null>(null);
  const [collaborators, setCollaborators] = useState<InterviewerCollaborator[]>([]);
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
        interviewersService.getInterviewerCollaborators(interviewerId)
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
