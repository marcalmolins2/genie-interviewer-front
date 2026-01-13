import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import type {
  Project,
  ProjectInsert,
  ProjectUpdate,
  ProjectMembership,
  ProjectMembershipInsert,
  Profile,
  ProjectRole,
  ProjectWithMembership,
  ProjectType,
} from '@/integrations/supabase/database.types';

// Extended membership type with user profile
export type ProjectMembershipWithUser = ProjectMembership & {
  profile?: Profile;
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
    name: 'Consumer Research Q1',
    description: 'Q1 consumer research initiatives',
    project_type: 'consumer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    name: 'B2B Healthcare Study',
    description: 'Enterprise healthcare decision maker interviews',
    project_type: 'b2b',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let mockMemberships: ProjectMembership[] = [
  {
    id: 'pm-1',
    project_id: 'proj-1',
    user_id: 'user-1',
    role: 'owner',
    created_at: new Date().toISOString(),
  },
  {
    id: 'pm-2',
    project_id: 'proj-2',
    user_id: 'user-1',
    role: 'owner',
    created_at: new Date().toISOString(),
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
        membership: mockMemberships.find(m => m.project_id === p.id) 
      }));
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // RLS handles access control - user can only see projects they're members of
    const { data: memberships, error: membershipError } = await supabase
      .from('project_memberships')
      .select(`
        *,
        project:projects(*)
      `)
      .eq('user_id', user.id);

    if (membershipError) throw membershipError;

    return (memberships || []).map(m => ({
      ...(m.project as unknown as Project),
      membership: {
        id: m.id,
        project_id: m.project_id,
        user_id: m.user_id,
        role: m.role,
        created_at: m.created_at,
      },
    }));
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
        membership: mockMemberships.find(m => m.project_id === projectId) 
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

    // Get user's membership for this project
    const { data: membership } = await supabase
      .from('project_memberships')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .maybeSingle();

    return {
      ...data,
      membership: membership || undefined,
    };
  },

  /**
   * Get current user's role in a project
   */
  async getUserProjectRole(projectId: string): Promise<ProjectRole | null> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 50));
      const membership = mockMemberships.find(m => m.project_id === projectId);
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
    return data.role;
  },

  /**
   * Create a new project (current user becomes owner)
   */
  async createProject(input: CreateProjectInput): Promise<Project> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: input.name,
        description: input.description || null,
        project_type: input.projectType || 'other',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockProjects.push(newProject);
      mockMemberships.push({
        id: `pm-${Date.now()}`,
        project_id: newProject.id,
        user_id: 'user-1',
        role: 'owner',
        created_at: new Date().toISOString(),
      });
      return newProject;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const projectData: ProjectInsert = {
      name: input.name,
      description: input.description,
      project_type: input.projectType || 'other',
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) throw error;

    // Auto-create owner membership
    const membershipData: ProjectMembershipInsert = {
      project_id: data.id,
      user_id: user.id,
      role: 'owner',
    };

    const { error: membershipError } = await supabase
      .from('project_memberships')
      .insert(membershipData);

    if (membershipError) {
      // Rollback project creation if membership fails
      await supabase.from('projects').delete().eq('id', data.id);
      throw membershipError;
    }

    return data;
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
        description: input.description ?? mockProjects[index].description,
        project_type: input.projectType ?? mockProjects[index].project_type,
        updated_at: new Date().toISOString(),
      };
      return mockProjects[index];
    }

    const updateData: ProjectUpdate = {
      ...(input.name && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.projectType && { project_type: input.projectType }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 150));
      const index = mockProjects.findIndex(p => p.id === projectId);
      if (index !== -1) mockProjects.splice(index, 1);
      mockMemberships = mockMemberships.filter(m => m.project_id !== projectId);
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
        .filter(m => m.project_id === projectId)
        .map(m => ({
          ...m,
          profile: {
            id: m.user_id,
            email: 'mock@example.com',
            name: 'Mock User',
            avatar_url: null,
            created_at: m.created_at,
            updated_at: m.created_at,
          },
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

    return (data || []).map(m => ({
      id: m.id,
      project_id: m.project_id,
      user_id: m.user_id,
      role: m.role,
      created_at: m.created_at,
      profile: m.profile as unknown as Profile,
    }));
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
        m => m.project_id === projectId && m.user_id === userId
      );
      if (existing) throw new Error('User is already a member');
      
      const membership: ProjectMembership = {
        id: `pm-${Date.now()}`,
        project_id: projectId,
        user_id: userId,
        role,
        created_at: new Date().toISOString(),
      };
      mockMemberships.push(membership);
      return membership;
    }

    const membershipData: ProjectMembershipInsert = {
      project_id: projectId,
      user_id: userId,
      role,
    };

    const { data, error } = await supabase
      .from('project_memberships')
      .insert(membershipData)
      .select()
      .single();

    if (error) throw error;
    return data;
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
        m => m.project_id === projectId && m.user_id === userId
      );
      if (index === -1) throw new Error('Membership not found');
      mockMemberships[index].role = role;
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
    return data;
  },

  /**
   * Remove a member from a project
   */
  async removeMember(projectId: string, userId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      mockMemberships = mockMemberships.filter(
        m => !(m.project_id === projectId && m.user_id === userId)
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
  async searchUsers(query: string): Promise<Profile[]> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return [];
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return data || [];
  },
};
