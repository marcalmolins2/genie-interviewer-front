import { ArchetypeInfo, Archetype, Project, ProjectRole, ProjectType, PROJECT_TYPE_LABELS } from '@/types';
import { 
  mockProjects, 
  mockProjectMemberships, 
  mockInterviewers, 
  mockSessions,
  mockUsers,
  getUserById,
  getProjectMembershipsForProject,
  getInterviewersForProject,
  getSessionsForInterviewer
} from './mockData';

// Mock archetype storage (in production this would be in Supabase)
let mockArchetypes: ArchetypeInfo[] = [
  {
    id: 'expert_interview',
    title: 'Expert Interview',
    description: 'In-depth technical discussions with subject matter experts',
    icon: 'Microscope',
    useCase: 'Technical validation, industry insights, specialized knowledge',
    examples: ['Technology expert interviews', 'Industry specialist discussions', 'Technical due diligence'],
    hasVariant: true
  },
  {
    id: 'belief_audit',
    title: 'Belief Audit',
    description: 'Explore assumptions, hypotheses, and mental models',
    icon: 'Brain',
    useCase: 'Strategic alignment, assumption testing, stakeholder perspectives',
    examples: ['Executive alignment sessions', 'Hypothesis validation', 'Strategic assumption testing']
  },
  {
    id: 'customer_interview',
    title: 'Customer Interview',
    description: 'Understanding end-user needs, experiences, and feedback',
    icon: 'Heart',
    useCase: 'User research, product feedback, customer satisfaction',
    examples: ['Product usability studies', 'Customer satisfaction research', 'User journey mapping']
  },
  {
    id: 'maturity_assessment',
    title: 'Maturity Assessment',
    description: 'Evaluate capabilities, processes, and organizational readiness',
    icon: 'Target',
    useCase: 'Capability assessments, benchmarking, gap analysis',
    examples: ['Digital maturity assessment', 'Process capability evaluation', 'Organizational readiness']
  }
];

// Archetype CRUD operations
export async function getArchetypes(): Promise<ArchetypeInfo[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...mockArchetypes];
}

export async function createArchetype(data: Omit<ArchetypeInfo, 'id'> & { id: string }): Promise<ArchetypeInfo> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newArchetype: ArchetypeInfo = {
    ...data,
    id: data.id as Archetype
  };
  mockArchetypes.push(newArchetype);
  return newArchetype;
}

export async function updateArchetype(id: string, data: Partial<ArchetypeInfo>): Promise<ArchetypeInfo> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = mockArchetypes.findIndex(a => a.id === id);
  if (index === -1) throw new Error('Archetype not found');
  
  mockArchetypes[index] = { ...mockArchetypes[index], ...data };
  return mockArchetypes[index];
}

export async function deleteArchetype(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  mockArchetypes = mockArchetypes.filter(a => a.id !== id);
}

// ============= Project Analytics Types =============

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
  projectType: ProjectType;
  lastActivityDate: string;
  
  // Team composition
  teamSize: number;
  membersByRole: { role: ProjectRole; count: number }[];
  members: ProjectMember[];
  
  // Interviewer stats
  totalInterviewers: number;
  interviewersByStatus: { status: string; count: number }[];
  interviewersByChannel: { channel: string; count: number }[];
  
  // Session metrics
  totalSessions: number;
  liveSessions: number;
  testSessions: number;
  completedSessions: number;
  completedLiveSessions: number;
  completionRate: number;
  avgDurationSec: number;
  totalDurationHours: number;
  
  // Activity over time (last 14 days)
  sessionsByDay: { date: string; live: number; test: number }[];
}

export interface ProjectListItem {
  id: string;
  name: string;
  caseCode: string;
}

// Get list of all projects for selector
export async function getProjectList(): Promise<ProjectListItem[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockProjects.map(p => ({
    id: p.id,
    name: p.name,
    caseCode: p.caseCode
  }));
}

// Get analytics for a specific project
export async function getProjectAnalytics(projectId: string): Promise<ProjectAnalytics | null> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const project = mockProjects.find(p => p.id === projectId);
  if (!project) return null;
  
  // Get team members
  const memberships = getProjectMembershipsForProject(projectId);
  const membersByRole: { role: ProjectRole; count: number }[] = [
    { role: 'owner', count: memberships.filter(m => m.role === 'owner').length },
    { role: 'editor', count: memberships.filter(m => m.role === 'editor').length },
    { role: 'viewer', count: memberships.filter(m => m.role === 'viewer').length }
  ];
  
  // Get member details
  const members: ProjectMember[] = memberships.map(m => {
    const user = getUserById(m.userId);
    return {
      id: m.userId,
      name: user?.name || 'Unknown',
      email: user?.email || '',
      role: m.role
    };
  });
  
  // Get interviewers
  const interviewers = getInterviewersForProject(projectId);
  
  // Count by status
  const statusCounts = interviewers.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const interviewersByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
  
  // Count by channel
  const channelCounts = interviewers.reduce((acc, i) => {
    acc[i.channel] = (acc[i.channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const interviewersByChannel = Object.entries(channelCounts).map(([channel, count]) => ({ channel, count }));
  
  // Get all sessions for project's interviewers
  const allSessions = interviewers.flatMap(i => getSessionsForInterviewer(i.id));
  
  const liveSessions = allSessions.filter(s => s.conversationType === 'live');
  const testSessions = allSessions.filter(s => s.conversationType === 'test');
  const completedSessions = allSessions.filter(s => s.completed);
  const completedLiveSessions = liveSessions.filter(s => s.completed);
  
  const totalDurationSec = allSessions.reduce((sum, s) => sum + (s.durationSec || 0), 0);
  const avgDurationSec = allSessions.length > 0 ? totalDurationSec / allSessions.length : 0;
  
  // Find last activity date (most recent session or project update)
  const sortedSessions = [...allSessions].sort((a, b) => 
    new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
  const lastActivityDate = sortedSessions.length > 0 
    ? sortedSessions[0].startedAt 
    : project.updatedAt;
  
  // Generate sessions by day (last 14 days)
  const sessionsByDay: { date: string; live: number; test: number }[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayLive = liveSessions.filter(s => s.startedAt.startsWith(dateStr)).length;
    const dayTest = testSessions.filter(s => s.startedAt.startsWith(dateStr)).length;
    
    sessionsByDay.push({ date: dateStr, live: dayLive, test: dayTest });
  }
  
  return {
    projectId: project.id,
    projectName: project.name,
    caseCode: project.caseCode,
    projectType: project.projectType,
    lastActivityDate,
    teamSize: memberships.length,
    membersByRole,
    members,
    totalInterviewers: interviewers.length,
    interviewersByStatus,
    interviewersByChannel,
    totalSessions: allSessions.length,
    liveSessions: liveSessions.length,
    testSessions: testSessions.length,
    completedSessions: completedSessions.length,
    completedLiveSessions: completedLiveSessions.length,
    completionRate: allSessions.length > 0 ? (completedSessions.length / allSessions.length) * 100 : 0,
    avgDurationSec,
    totalDurationHours: totalDurationSec / 3600,
    sessionsByDay
  };
}

// ============= User Analytics Types =============

export interface UserProjectDetail {
  projectId: string;
  projectName: string;
  caseCode: string;
  role: ProjectRole;
  sessionCount: number; // Live sessions only
  interviewerCount: number;
}

export interface UserInterviewerDetail {
  interviewerId: string;
  interviewerName: string;
  projectName: string;
  caseCode: string;
  status: string;
  channel: string;
  sessionCount: number; // Live sessions only
}

export interface UserAnalytics {
  userId: string;
  userName: string;
  email: string;
  isActive: boolean;
  
  // Projects
  totalProjects: number;
  projectsByRole: { role: ProjectRole; count: number }[];
  projects: UserProjectDetail[]; // For collapsible list
  
  // Interviewers
  totalInterviewers: number;
  interviewers: UserInterviewerDetail[]; // For collapsible list
  
  // Session metrics (live only across all accessible projects)
  completedLiveSessions: number;
  totalDurationMinutes: number;
  avgDurationMinutes: number;
  
  // Activity
  lastActivityDate: string;
  sessionsByDay: { date: string; live: number; test: number }[];
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

// Get list of all users for selector
export async function getUserList(): Promise<UserListItem[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockUsers.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    isActive: u.isActive
  }));
}

// Get analytics for a specific user
export async function getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return null;
  
  // Get all project memberships for this user
  const memberships = mockProjectMemberships.filter(m => m.userId === userId);
  
  // Projects by role
  const projectsByRole: { role: ProjectRole; count: number }[] = [
    { role: 'owner', count: memberships.filter(m => m.role === 'owner').length },
    { role: 'editor', count: memberships.filter(m => m.role === 'editor').length },
    { role: 'viewer', count: memberships.filter(m => m.role === 'viewer').length }
  ];
  
  // Get detailed project info with session counts
  const projectDetails: UserProjectDetail[] = [];
  const interviewerDetails: UserInterviewerDetail[] = [];
  let allLiveSessions: typeof mockSessions = [];
  let allTestSessions: typeof mockSessions = [];
  
  for (const membership of memberships) {
    const project = mockProjects.find(p => p.id === membership.projectId);
    if (!project) continue;
    
    // Get all interviewers for this project
    const interviewers = getInterviewersForProject(project.id);
    
    // Get all sessions for these interviewers
    const projectSessions = interviewers.flatMap(i => getSessionsForInterviewer(i.id));
    const liveSessions = projectSessions.filter(s => s.conversationType === 'live' && s.completed);
    const testSessions = projectSessions.filter(s => s.conversationType === 'test');
    
    allLiveSessions = [...allLiveSessions, ...liveSessions];
    allTestSessions = [...allTestSessions, ...testSessions];
    
    // Add interviewer details
    for (const interviewer of interviewers) {
      const interviewerSessions = getSessionsForInterviewer(interviewer.id);
      const interviewerLiveSessions = interviewerSessions.filter(s => s.conversationType === 'live' && s.completed);
      
      interviewerDetails.push({
        interviewerId: interviewer.id,
        interviewerName: interviewer.name,
        projectName: project.name,
        caseCode: project.caseCode,
        status: interviewer.status,
        channel: interviewer.channel,
        sessionCount: interviewerLiveSessions.length
      });
    }
    
    projectDetails.push({
      projectId: project.id,
      projectName: project.name,
      caseCode: project.caseCode,
      role: membership.role,
      sessionCount: liveSessions.length,
      interviewerCount: interviewers.length
    });
  }
  
  // Calculate total metrics
  const totalDurationSec = allLiveSessions.reduce((sum, s) => sum + (s.durationSec || 0), 0);
  const totalDurationMinutes = totalDurationSec / 60;
  const avgDurationMinutes = allLiveSessions.length > 0 ? totalDurationMinutes / allLiveSessions.length : 0;
  
  // Find last activity date
  const allSessions = [...allLiveSessions, ...allTestSessions];
  const sortedSessions = [...allSessions].sort((a, b) => 
    new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
  const lastActivityDate = sortedSessions.length > 0 
    ? sortedSessions[0].startedAt 
    : new Date().toISOString();
  
  // Generate sessions by day (last 14 days)
  const sessionsByDay: { date: string; live: number; test: number }[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayLive = allLiveSessions.filter(s => s.startedAt.startsWith(dateStr)).length;
    const dayTest = allTestSessions.filter(s => s.startedAt.startsWith(dateStr)).length;
    
    sessionsByDay.push({ date: dateStr, live: dayLive, test: dayTest });
  }
  
  return {
    userId: user.id,
    userName: user.name,
    email: user.email,
    isActive: user.isActive,
    totalProjects: memberships.length,
    projectsByRole,
    projects: projectDetails,
    totalInterviewers: interviewerDetails.length,
    interviewers: interviewerDetails,
    completedLiveSessions: allLiveSessions.length,
    totalDurationMinutes,
    avgDurationMinutes,
    lastActivityDate,
    sessionsByDay
  };
}

// ============= System Overview Analytics (existing) =============

export interface AnalyticsOverview {
  totalProjects: number;
  totalInterviewers: number;
  totalSessions: number;
  activeUsers: number;
  completionRate: number;
}

export interface UsageByDay {
  date: string;
  sessions: number;
}

export interface UsageByChannel {
  channel: string;
  count: number;
  percentage: number;
}

export interface UsageByArchetype {
  archetype: string;
  count: number;
}

export interface RecentActivity {
  id: string;
  type: 'interviewer_created' | 'session_completed' | 'project_created';
  description: string;
  timestamp: string;
  user: string;
}

export interface SystemAnalytics {
  overview: AnalyticsOverview;
  usageByDay: UsageByDay[];
  usageByChannel: UsageByChannel[];
  usageByArchetype: UsageByArchetype[];
  recentActivity: RecentActivity[];
}

export async function getSystemAnalytics(): Promise<SystemAnalytics> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const activeUsers = mockUsers.filter(u => u.isActive).length;
  const allSessions = mockSessions;
  const completedSessions = allSessions.filter(s => s.completed);
  
  // Channel distribution
  const channelCounts = mockInterviewers.reduce((acc, i) => {
    const sessions = mockSessions.filter(s => s.interviewerId === i.id);
    acc[i.channel] = (acc[i.channel] || 0) + sessions.length;
    return acc;
  }, {} as Record<string, number>);
  
  const totalSessionsByChannel = Object.values(channelCounts).reduce((a, b) => a + b, 0);
  const usageByChannel = Object.entries(channelCounts).map(([channel, count]) => ({
    channel: 'Inbound Call',
    count,
    percentage: totalSessionsByChannel > 0 ? Math.round((count / totalSessionsByChannel) * 100 * 10) / 10 : 0
  }));
  
  // Archetype distribution
  const archetypeCounts = mockInterviewers.reduce((acc, i) => {
    const sessions = mockSessions.filter(s => s.interviewerId === i.id);
    const archetype = mockArchetypes.find(a => a.id === i.archetype);
    const title = archetype?.title || i.archetype;
    acc[title] = (acc[title] || 0) + sessions.length;
    return acc;
  }, {} as Record<string, number>);
  
  const usageByArchetype = Object.entries(archetypeCounts)
    .map(([archetype, count]) => ({ archetype, count }))
    .sort((a, b) => b.count - a.count);
  
  // Usage by day (last 30 days)
  const usageByDay: UsageByDay[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const daySessions = allSessions.filter(s => s.startedAt.startsWith(dateStr)).length;
    // Add some mock data for visualization
    usageByDay.push({ 
      date: dateStr, 
      sessions: daySessions + Math.floor(Math.random() * 15) + 5 
    });
  }
  
  return {
    overview: {
      totalProjects: mockProjects.length,
      totalInterviewers: mockInterviewers.length,
      totalSessions: allSessions.length,
      activeUsers,
      completionRate: allSessions.length > 0 ? Math.round((completedSessions.length / allSessions.length) * 100 * 10) / 10 : 0
    },
    usageByDay,
    usageByChannel,
    usageByArchetype,
    recentActivity: [
      { id: '1', type: 'session_completed', description: 'Session completed for "Customer Experience Bot"', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), user: 'Sarah Chen' },
      { id: '2', type: 'interviewer_created', description: 'New interviewer: "Patient Feedback"', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), user: 'Michael Park' },
      { id: '3', type: 'project_created', description: 'New project: "Financial Services DD"', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), user: 'Emma Wilson' },
    ]
  };
}

// Legacy function for backward compatibility
export async function getToolAnalytics() {
  const systemAnalytics = await getSystemAnalytics();
  return {
    overview: {
      totalAgents: systemAnalytics.overview.totalInterviewers,
      totalInterviews: systemAnalytics.overview.totalSessions,
      activeUsers: systemAnalytics.overview.activeUsers,
      completionRate: systemAnalytics.overview.completionRate
    },
    usageByDay: systemAnalytics.usageByDay.map(d => ({ ...d, interviews: d.sessions, agents: 0 })),
    usageByChannel: systemAnalytics.usageByChannel,
    usageByArchetype: systemAnalytics.usageByArchetype,
    recentActivity: systemAnalytics.recentActivity.map(a => ({
      ...a,
      type: a.type === 'session_completed' ? 'interview_completed' as const : 
            a.type === 'interviewer_created' ? 'agent_created' as const : 'user_joined' as const
    }))
  };
}
