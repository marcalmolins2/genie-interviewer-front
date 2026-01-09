import { useState, useEffect, useMemo } from 'react';
import { ProjectRole } from '@/types';
import { projectsService } from '@/services/projects';

interface UseProjectPermissionResult {
  role: ProjectRole | null;
  isOwner: boolean;
  canEdit: boolean;
  canView: boolean;
  canManageMembers: boolean;
  canDelete: boolean;
  loading: boolean;
}

export function useProjectPermission(projectId: string | undefined): UseProjectPermissionResult {
  const [role, setRole] = useState<ProjectRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const userRole = await projectsService.getUserProjectRole(projectId);
        setRole(userRole);
      } catch (error) {
        console.error('Failed to load project permission:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, [projectId]);

  const derived = useMemo(() => {
    const isOwner = role === 'owner';
    const canEdit = role === 'owner' || role === 'editor';
    const canView = role !== null;
    const canManageMembers = role === 'owner';
    const canDelete = role === 'owner';

    return {
      isOwner,
      canEdit,
      canView,
      canManageMembers,
      canDelete,
    };
  }, [role]);

  return {
    role,
    ...derived,
    loading,
  };
}
