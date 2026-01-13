import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import type {
  Project,
  ProjectMembership,
  ProjectRole,
  ProjectType,
  User,
} from '@/types';
import type {
  Profile,
  ProjectInsert,
  ProjectWithMembership,
  ProjectRow,
  ProjectMembershipRow,
  profileToUser,
  rowToProject,
  rowToProjectMembership,
} from '@/integrations/supabase/database.types';

// Extended membership type with user
export type ProjectMembershipWithUser = ProjectMembership & {
  user?: User;
};

export interface CreateProjectInput {
  name: string;
  caseCode?: string;
  projectType?: ProjectType;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  caseCode?: string;
  projectType?: ProjectType;
  description?: string;
}

// Mock data for when Supabase is not configured
const mockProjects: Project[] = [
  {
    id: 'proj-1',
    caseCode: 'CASE-001',
    name: 'Consumer Research Q1',
    description: 'Q1 consumer research initiatives',
    projectType: 'internal_work',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    caseCode: 'CASE-002',
    name: 'B2B Healthcare Study',
    description: 'Enterprise healthcare decision maker interviews',
    projectType: 'client_work',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let mockMemberships: ProjectMembership[] = [
  {
    id: 'pm-1',
    projectId: 'proj-1',
    userId: 'user-1',
    role: 'owner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pm-2',
    projectId: 'proj-2',
    userId: 'user-1',
    role: 'owner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Test User',
    isActive: true,
    isSuperuser: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const projectsService = {
  /**
   * Get all projects accessible by the current user
   */
  async getProjects(): Promise<ProjectWithMembership[]> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return mockProjects.map(p => ({ 
        ...p, 
        membership: mockMemberships.find(m => m.projectId === p.id) 
      }));
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: memberships, error: membershipError } = await supabase
      .from('project_memberships')
      .select(`
        *,
        project:projects(*)
      `)
      .eq('user_id', user.id);

    if (membershipError) throw membershipError;

    return (memberships || []).map(m => {
      const projectRow = m.project as unknown as ProjectRow;
      const project: Project = {
        id: projectRow.id,
        caseCode: projectRow.case_code || '',
        name: projectRow.name,
        description: projectRow.description || undefined,
        projectType: projectRow.project_type as ProjectType,
        createdAt: projectRow.created_at,
        updatedAt: projectRow.updated_at,
      };
      const membership: ProjectMembership = {
        id: m.id,
        projectId: m.project_id,
        userId: m.user_id,
        role: m.role as ProjectRole,
        createdAt: m.created_at,
        updatedAt: m.created_at,
      };
      return { ...project, membership };
    });
  },

  /**
   * Get a single project by ID
   */
  async getProject(projectId: string): Promise<ProjectWithMembership | null> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 50));
      const project = mockProjects.find(p => p.id === projectId);
      return project ? { 
        ...project, 
        membership: mockMemberships.find(m => m.projectId === projectId) 
      } : null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const projectRow = data as ProjectRow;
    const project: Project = {
      id: projectRow.id,
      caseCode: projectRow.case_code || '',
      name: projectRow.name,
      description: projectRow.description || undefined,
      projectType: projectRow.project_type as ProjectType,
      createdAt: projectRow.created_at,
      updatedAt: projectRow.updated_at,
    };

    const { data: membership } = await supabase
      .from('project_memberships')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (membership) {
      const mem: ProjectMembership = {
        id: membership.id,
        projectId: membership.project_id,
        userId: membership.user_id,
        role: membership.role as ProjectRole,
        createdAt: membership.created_at,
        updatedAt: membership.created_at,
      };
      return { ...project, membership: mem };
    }

    return project;
  },

  /**
   * Get current user's role in a project
   */
  async getUserProjectRole(projectId: string): Promise<ProjectRole | null> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 50));
      const membership = mockMemberships.find(m => m.projectId === projectId);
      return membership?.role || null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('project_memberships')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !data) return null;
    return data.role as ProjectRole;
  },

  /**
   * Create a new project (current user becomes owner)
   */
  async createProject(input: CreateProjectInput): Promise<Project> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        caseCode: input.caseCode || '',
        name: input.name,
        description: input.description,
        projectType: input.projectType || 'internal_work',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockProjects.push(newProject);
      mockMemberships.push({
        id: `pm-${Date.now()}`,
        projectId: newProject.id,
        userId: 'user-1',
        role: 'owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return newProject;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const projectData: ProjectInsert = {
      name: input.name,
      description: input.description || null,
      project_type: input.projectType || 'internal_work',
      case_code: input.caseCode,
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) throw error;

    const { error: membershipError } = await supabase
      .from('project_memberships')
      .insert({
        project_id: data.id,
        user_id: user.id,
        role: 'owner',
      });

    if (membershipError) {
      await supabase.from('projects').delete().eq('id', data.id);
      throw membershipError;
    }

    const projectRow = data as ProjectRow;
    return {
      id: projectRow.id,
      caseCode: projectRow.case_code || '',
      name: projectRow.name,
      description: projectRow.description || undefined,
      projectType: projectRow.project_type as ProjectType,
      createdAt: projectRow.created_at,
      updatedAt: projectRow.updated_at,
    };
  },

  /**
   * Update a project
   */
  async updateProject(projectId: string, input: UpdateProjectInput): Promise<Project> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 150));
      const index = mockProjects.findIndex(p => p.id === projectId);
      if (index === -1) throw new Error('Project not found');
      mockProjects[index] = {
        ...mockProjects[index],
        name: input.name ?? mockProjects[index].name,
        caseCode: input.caseCode ?? mockProjects[index].caseCode,
        description: input.description ?? mockProjects[index].description,
        projectType: input.projectType ?? mockProjects[index].projectType,
        updatedAt: new Date().toISOString(),
      };
      return mockProjects[index];
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (input.name) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.projectType) updateData.project_type = input.projectType;
    if (input.caseCode !== undefined) updateData.case_code = input.caseCode;

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;

    const projectRow = data as ProjectRow;
    return {
      id: projectRow.id,
      caseCode: projectRow.case_code || '',
      name: projectRow.name,
      description: projectRow.description || undefined,
      projectType: projectRow.project_type as ProjectType,
      createdAt: projectRow.created_at,
      updatedAt: projectRow.updated_at,
    };
  },

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 150));
      const index = mockProjects.findIndex(p => p.id === projectId);
      if (index !== -1) mockProjects.splice(index, 1);
      mockMemberships = mockMemberships.filter(m => m.projectId !== projectId);
      return;
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  },

  /**
   * Get all members of a project
   */
  async getProjectMembers(projectId: string): Promise<ProjectMembershipWithUser[]> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return mockMemberships
        .filter(m => m.projectId === projectId)
        .map(m => ({
          ...m,
          user: mockUsers.find(u => u.id === m.userId),
        }));
    }

    const { data, error } = await supabase
      .from('project_memberships')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('project_id', projectId);

    if (error) throw error;

    return (data || []).map(m => {
      const profile = m.profile as unknown as { id: string; email: string; name: string | null; avatar_url: string | null; created_at: string; updated_at: string } | null;
      const membership: ProjectMembershipWithUser = {
        id: m.id,
        projectId: m.project_id,
        userId: m.user_id,
        role: m.role as ProjectRole,
        createdAt: m.created_at,
        updatedAt: m.created_at,
      };
      if (profile) {
        membership.user = {
          id: profile.id,
          email: profile.email || '',
          name: profile.name || '',
          avatar: profile.avatar_url || undefined,
          isActive: true,
          isSuperuser: false,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        };
      }
      return membership;
    });
  },

  /**
   * Add a member to a project
   */
  async addProjectMember(
    projectId: string,
    userId: string,
    role: ProjectRole = 'viewer'
  ): Promise<ProjectMembership> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 150));
      const existing = mockMemberships.find(
        m => m.projectId === projectId && m.userId === userId
      );
      if (existing) throw new Error('User is already a member');
      
      const membership: ProjectMembership = {
        id: `pm-${Date.now()}`,
        projectId,
        userId,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockMemberships.push(membership);
      return membership;
    }

    const { data, error } = await supabase
      .from('project_memberships')
      .insert({
        project_id: projectId,
        user_id: userId,
        role,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      projectId: data.project_id,
      userId: data.user_id,
      role: data.role as ProjectRole,
      createdAt: data.created_at,
      updatedAt: data.created_at,
    };
  },

  /**
   * Update a member's role
   */
  async updateMemberRole(
    projectId: string,
    userId: string,
    role: ProjectRole
  ): Promise<ProjectMembership> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const index = mockMemberships.findIndex(
        m => m.projectId === projectId && m.userId === userId
      );
      if (index === -1) throw new Error('Membership not found');
      mockMemberships[index].role = role;
      mockMemberships[index].updatedAt = new Date().toISOString();
      return mockMemberships[index];
    }

    const { data, error } = await supabase
      .from('project_memberships')
      .update({ role })
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      projectId: data.project_id,
      userId: data.user_id,
      role: data.role as ProjectRole,
      createdAt: data.created_at,
      updatedAt: data.created_at,
    };
  },

  /**
   * Remove a member from a project
   */
  async removeMember(projectId: string, userId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      mockMemberships = mockMemberships.filter(
        m => !(m.projectId === projectId && m.userId === userId)
      );
      return;
    }

    const { error } = await supabase
      .from('project_memberships')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Search users (for inviting)
   */
  async searchUsers(query: string): Promise<User[]> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return mockUsers.filter(u => 
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      );
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return (data || []).map(profile => ({
      id: profile.id,
      email: profile.email || '',
      name: profile.name || '',
      avatar: profile.avatar_url || undefined,
      isActive: true,
      isSuperuser: false,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    }));
  },
};
