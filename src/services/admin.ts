import { ArchetypeInfo, Archetype, Project, ProjectRole } from '@/types';
import { 
  mockProjects, 
  mockProjectMemberships, 
  mockInterviewers, 
  mockSessions,
  mockUsers,
  getProjectMembershipsForProject,
  getInterviewersForProject,
  getSessionsForInterviewer
} from './mockData';

// Mock archetype storage (in production this would be in Supabase)
let mockArchetypes: ArchetypeInfo[] = [
  {
    id: 'expert_deep_dive',
    title: 'Expert Deep-Dive',
    description: 'In-depth technical discussions with subject matter experts',
    icon: 'Microscope',
    useCase: 'Technical validation, detailed research insights',
    examples: ['Battery technology expert interviews', 'Software architecture discussions', 'Medical device validation']
  },
  {
    id: 'client_stakeholder',
    title: 'Client Stakeholder',
    description: 'Strategic conversations with business decision-makers',
    icon: 'Users',
    useCase: 'Requirements gathering, strategic alignment',
    examples: ['Executive interviews', 'Stakeholder alignment sessions', 'Strategic planning discussions']
  },
  {
    id: 'customer_user',
    title: 'Customer User',
    description: 'Understanding end-user needs and experiences',
    icon: 'Heart',
    useCase: 'User research, product feedback, experience mapping',
    examples: ['Product usability studies', 'Customer satisfaction research', 'User journey mapping']
  },
  {
    id: 'rapid_survey',
    title: 'Rapid Survey',
    description: 'Quick pulse checks and quantitative data collection',
    icon: 'Zap',
    useCase: 'Market research, quick polls, feedback collection',
    examples: ['NPS surveys', 'Market sentiment analysis', 'Quick preference polling']
  },
  {
    id: 'diagnostic',
    title: 'Diagnostic',
    description: 'Problem identification and root cause analysis',
    icon: 'Search',
    useCase: 'Issue investigation, process analysis',
    examples: ['Problem diagnosis interviews', 'Process improvement research', 'Issue investigation']
  },
  {
    id: 'investigative',
    title: 'Investigative',
    description: 'Deep research and fact-finding missions',
    icon: 'FileSearch',
    useCase: 'Market research, competitive analysis',
    examples: ['Competitive landscape research', 'Market analysis interviews', 'Due diligence research']
  },
  {
    id: 'panel_moderator',
    title: 'Panel Moderator',
    description: 'Facilitating group discussions and workshops',
    icon: 'Users2',
    useCase: 'Focus groups, workshops, collaborative sessions',
    examples: ['Focus groups', 'Workshop facilitation', 'Group ideation sessions']
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

export interface ProjectAnalytics {
  projectId: string;
  projectName: string;
  caseCode: string;
  
  // Team composition
  teamSize: number;
  membersByRole: { role: ProjectRole; count: number }[];
  
  // Interviewer stats
  totalInterviewers: number;
  interviewersByStatus: { status: string; count: number }[];
  interviewersByChannel: { channel: string; count: number }[];
  
  // Session metrics
  totalSessions: number;
  liveSessions: number;
  testSessions: number;
  completedSessions: number;
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
  
  const totalDurationSec = allSessions.reduce((sum, s) => sum + (s.durationSec || 0), 0);
  const avgDurationSec = allSessions.length > 0 ? totalDurationSec / allSessions.length : 0;
  
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
    teamSize: memberships.length,
    membersByRole,
    totalInterviewers: interviewers.length,
    interviewersByStatus,
    interviewersByChannel,
    totalSessions: allSessions.length,
    liveSessions: liveSessions.length,
    testSessions: testSessions.length,
    completedSessions: completedSessions.length,
    completionRate: allSessions.length > 0 ? (completedSessions.length / allSessions.length) * 100 : 0,
    avgDurationSec,
    totalDurationHours: totalDurationSec / 3600,
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
    channel: channel === 'chat' ? 'Chat' : channel === 'inbound_call' ? 'Inbound Call' : 'Outbound Call',
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
