import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import type {
  AppRole,
  Profile,
  Project,
  ProjectRole,
  FeatureFlag,
  FeatureFlagCategory,
} from '@/integrations/supabase/database.types';

// User role type
export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

// Archetype info for admin management
export interface ArchetypeInfo {
  id: string;
  title: string;
  description: string;
  icon: string;
  useCase: string;
  examples: string[];
  hasVariant?: boolean;
}

// Mock archetype storage
let mockArchetypes: ArchetypeInfo[] = [
  {
    id: 'market_research',
    title: 'Market Research',
    description: 'In-depth market and competitive analysis interviews',
    icon: 'TrendingUp',
    useCase: 'Market sizing, competitive intelligence, trend analysis',
    examples: ['Market opportunity assessment', 'Competitive landscape analysis'],
  },
  {
    id: 'ux_research',
    title: 'UX Research',
    description: 'User experience and usability research',
    icon: 'Users',
    useCase: 'User feedback, usability testing, journey mapping',
    examples: ['User interview sessions', 'Product feedback collection'],
  },
  {
    id: 'academic',
    title: 'Academic Research',
    description: 'Academic and scholarly research interviews',
    icon: 'BookOpen',
    useCase: 'Qualitative research, data collection, scholarly inquiry',
    examples: ['Research interviews', 'Data collection sessions'],
  },
  {
    id: 'custom',
    title: 'Custom',
    description: 'Fully customizable interview format',
    icon: 'Settings',
    useCase: 'Specialized use cases requiring unique configurations',
    examples: ['Custom interview formats', 'Specialized assessments'],
  },
];

// Analytics types
export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: ProjectRole;
}

export interface ProjectAnalytics {
  projectId: string;
  projectName: string;
  caseCode: string;
  projectType: string;
  lastActivityDate: string;
  teamSize: number;
  membersByRole: { role: ProjectRole; count: number }[];
  members: ProjectMember[];
  totalInterviewers: number;
  interviewersByStatus: { status: string; count: number }[];
  interviewersByChannel: { channel: string; count: number }[];
  totalSessions: number;
  liveSessions: number;
  testSessions: number;
  completedSessions: number;
  completedLiveSessions: number;
  completionRate: number;
  avgDurationSec: number;
  totalDurationHours: number;
  sessionsByDay: { date: string; live: number; test: number }[];
}

export interface ProjectListItem {
  id: string;
  name: string;
  caseCode: string;
}

export interface UserAnalytics {
  userId: string;
  userName: string;
  email: string;
  isActive: boolean;
  totalProjects: number;
  projectsByRole: { role: ProjectRole; count: number }[];
  projects: Array<{
    projectId: string;
    projectName: string;
    caseCode: string;
    role: ProjectRole;
    sessionCount: number;
    interviewerCount: number;
  }>;
  totalInterviewers: number;
  interviewers: Array<{
    interviewerId: string;
    interviewerName: string;
    projectName: string;
    caseCode: string;
    status: string;
    channel: string;
    sessionCount: number;
  }>;
  completedLiveSessions: number;
  totalDurationMinutes: number;
  avgDurationMinutes: number;
  lastActivityDate: string;
  sessionsByDay: { date: string; live: number; test: number }[];
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export interface AnalyticsOverview {
  totalProjects: number;
  totalInterviewers: number;
  totalSessions: number;
  activeUsers: number;
  completionRate: number;
}

export interface SystemAnalytics {
  overview: AnalyticsOverview;
  usageByDay: { date: string; sessions: number }[];
  usageByChannel: { channel: string; count: number; percentage: number }[];
  usageByArchetype: { archetype: string; count: number }[];
  recentActivity: Array<{
    id: string;
    type: 'interviewer_created' | 'session_completed' | 'project_created';
    description: string;
    timestamp: string;
    user: string;
  }>;
}

// Admin service
export const adminService = {
  /**
   * Check if current user is an admin
   */
  async isAdmin(): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      // For demo, check localStorage mock
      const mockUser = localStorage.getItem('user');
      if (mockUser) {
        try {
          const user = JSON.parse(mockUser);
          return user.isAdmin === true;
        } catch {
          return false;
        }
      }
      return false;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Use the has_role function
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    });

    if (error) {
      console.error('Error checking admin role:', error);
      return false;
    }

    return data === true;
  },

  /**
   * Get user's roles
   */
  async getUserRoles(userId: string): Promise<AppRole[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(r => r.role);
  },

  /**
   * Add a role to a user (admin only)
   */
  async addUserRole(userId: string, role: AppRole): Promise<UserRole> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const { data, error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Remove a role from a user (admin only)
   */
  async removeUserRole(userId: string, role: AppRole): Promise<void> {
    if (!isSupabaseConfigured()) {
      return;
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);

    if (error) throw error;
  },

  /**
   * Get all users (admin only)
   */
  async getUsers(): Promise<Profile[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all feature flags (admin only)
   */
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('key');

    if (error) throw error;
    return data || [];
  },

  /**
   * Update a feature flag (admin only)
   */
  async updateFeatureFlag(key: string, enabled: boolean): Promise<FeatureFlag> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const { data, error } = await supabase
      .from('feature_flags')
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Archetype CRUD operations
  async getArchetypes(): Promise<ArchetypeInfo[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...mockArchetypes];
  },

  async createArchetype(data: Omit<ArchetypeInfo, 'id'> & { id: string }): Promise<ArchetypeInfo> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newArchetype: ArchetypeInfo = { ...data };
    mockArchetypes.push(newArchetype);
    return newArchetype;
  },

  async updateArchetype(id: string, data: Partial<ArchetypeInfo>): Promise<ArchetypeInfo> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockArchetypes.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Archetype not found');
    mockArchetypes[index] = { ...mockArchetypes[index], ...data };
    return mockArchetypes[index];
  },

  async deleteArchetype(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    mockArchetypes = mockArchetypes.filter(a => a.id !== id);
  },

  // Get list of all projects for selector
  async getProjectList(): Promise<ProjectListItem[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('projects')
      .select('id, name')
      .order('name');

    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id,
      name: p.name,
      caseCode: '', // Not stored in new schema
    }));
  },

  // Get analytics for a specific project
  async getProjectAnalytics(projectId: string): Promise<ProjectAnalytics | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error || !project) return null;

    const [
      { data: memberships },
      { data: interviewers },
    ] = await Promise.all([
      supabase
        .from('project_memberships')
        .select(`*, profile:profiles(*)`)
        .eq('project_id', projectId),
      supabase
        .from('interviewers')
        .select('*')
        .eq('project_id', projectId),
    ]);

    // Get all sessions for project's interviewers
    const interviewerIds = (interviewers || []).map(i => i.id);
    const { data: sessions } = interviewerIds.length > 0
      ? await supabase
          .from('sessions')
          .select('*')
          .in('interviewer_id', interviewerIds)
      : { data: [] };

    const members = (memberships || []).map(m => ({
      id: m.user_id,
      name: (m.profile as any)?.name || 'Unknown',
      email: (m.profile as any)?.email || '',
      role: m.role,
    }));

    const membersByRole = [
      { role: 'owner' as ProjectRole, count: members.filter(m => m.role === 'owner').length },
      { role: 'editor' as ProjectRole, count: members.filter(m => m.role === 'editor').length },
      { role: 'viewer' as ProjectRole, count: members.filter(m => m.role === 'viewer').length },
    ];

    const statusCounts = (interviewers || []).reduce((acc, i) => {
      acc[i.status] = (acc[i.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const channelCounts = (interviewers || []).reduce((acc, i) => {
      acc[i.channel] = (acc[i.channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const completedSessions = (sessions || []).filter(s => s.status === 'completed');
    const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration_minutes || 0) * 60, 0);

    return {
      projectId: project.id,
      projectName: project.name,
      caseCode: '',
      projectType: project.project_type,
      lastActivityDate: project.updated_at,
      teamSize: members.length,
      membersByRole,
      members,
      totalInterviewers: (interviewers || []).length,
      interviewersByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
      interviewersByChannel: Object.entries(channelCounts).map(([channel, count]) => ({ channel, count })),
      totalSessions: (sessions || []).length,
      liveSessions: (sessions || []).filter(s => s.status !== 'test').length,
      testSessions: (sessions || []).filter(s => s.status === 'test').length,
      completedSessions: completedSessions.length,
      completedLiveSessions: completedSessions.filter(s => s.status !== 'test').length,
      completionRate: (sessions || []).length > 0 ? (completedSessions.length / (sessions || []).length) * 100 : 0,
      avgDurationSec: completedSessions.length > 0 ? totalDuration / completedSessions.length : 0,
      totalDurationHours: totalDuration / 3600,
      sessionsByDay: [],
    };
  },

  // Get list of all users for selector
  async getUserList(): Promise<UserListItem[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');

    if (error) throw error;
    return (data || []).map(u => ({
      id: u.id,
      name: u.name || '',
      email: u.email,
      isActive: true,
    }));
  },

  // Get analytics for a specific user
  async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) return null;

    const { data: memberships } = await supabase
      .from('project_memberships')
      .select(`*, project:projects(*)`)
      .eq('user_id', userId);

    const projectsByRole = [
      { role: 'owner' as ProjectRole, count: (memberships || []).filter(m => m.role === 'owner').length },
      { role: 'editor' as ProjectRole, count: (memberships || []).filter(m => m.role === 'editor').length },
      { role: 'viewer' as ProjectRole, count: (memberships || []).filter(m => m.role === 'viewer').length },
    ];

    return {
      userId: profile.id,
      userName: profile.name || '',
      email: profile.email,
      isActive: true,
      totalProjects: (memberships || []).length,
      projectsByRole,
      projects: (memberships || []).map(m => ({
        projectId: m.project_id,
        projectName: (m.project as any)?.name || '',
        caseCode: '',
        role: m.role,
        sessionCount: 0,
        interviewerCount: 0,
      })),
      totalInterviewers: 0,
      interviewers: [],
      completedLiveSessions: 0,
      totalDurationMinutes: 0,
      avgDurationMinutes: 0,
      lastActivityDate: profile.updated_at,
      sessionsByDay: [],
    };
  },

  // Get system analytics
  async getSystemAnalytics(): Promise<SystemAnalytics> {
    if (!isSupabaseConfigured()) {
      return {
        overview: {
          totalProjects: 0,
          totalInterviewers: 0,
          totalSessions: 0,
          activeUsers: 0,
          completionRate: 0,
        },
        usageByDay: [],
        usageByChannel: [],
        usageByArchetype: [],
        recentActivity: [],
      };
    }

    const [
      { count: projectCount },
      { count: interviewerCount },
      { count: sessionCount },
      { count: userCount },
    ] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('interviewers').select('*', { count: 'exact', head: true }),
      supabase.from('sessions').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ]);

    return {
      overview: {
        totalProjects: projectCount || 0,
        totalInterviewers: interviewerCount || 0,
        totalSessions: sessionCount || 0,
        activeUsers: userCount || 0,
        completionRate: 0,
      },
      usageByDay: [],
      usageByChannel: [],
      usageByArchetype: [],
      recentActivity: [],
    };
  },

  // Legacy compatibility
  async getToolAnalytics() {
    return this.getSystemAnalytics();
  },
};

// Export individual functions for backward compatibility
export const getArchetypes = () => adminService.getArchetypes();
export const createArchetype = (data: Omit<ArchetypeInfo, 'id'> & { id: string }) => adminService.createArchetype(data);
export const updateArchetype = (id: string, data: Partial<ArchetypeInfo>) => adminService.updateArchetype(id, data);
export const deleteArchetype = (id: string) => adminService.deleteArchetype(id);
export const getProjectList = () => adminService.getProjectList();
export const getProjectAnalytics = (projectId: string) => adminService.getProjectAnalytics(projectId);
export const getUserList = () => adminService.getUserList();
export const getUserAnalytics = (userId: string) => adminService.getUserAnalytics(userId);
export const getSystemAnalytics = () => adminService.getSystemAnalytics();
