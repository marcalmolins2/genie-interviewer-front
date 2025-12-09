import { ArchetypeInfo, Archetype } from '@/types';

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
  // Simulate API delay
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

// Analytics types and mock data
export interface AnalyticsOverview {
  totalAgents: number;
  totalInterviews: number;
  activeUsers: number;
  completionRate: number;
}

export interface UsageByDay {
  date: string;
  interviews: number;
  agents: number;
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
  type: 'agent_created' | 'interview_completed' | 'user_joined';
  description: string;
  timestamp: string;
  user: string;
}

export interface ToolAnalytics {
  overview: AnalyticsOverview;
  usageByDay: UsageByDay[];
  usageByChannel: UsageByChannel[];
  usageByArchetype: UsageByArchetype[];
  recentActivity: RecentActivity[];
}

export async function getToolAnalytics(): Promise<ToolAnalytics> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate mock data for the last 30 days
  const usageByDay: UsageByDay[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    usageByDay.push({
      date: date.toISOString().split('T')[0],
      interviews: Math.floor(Math.random() * 50) + 10,
      agents: Math.floor(Math.random() * 5) + 1
    });
  }

  return {
    overview: {
      totalAgents: 47,
      totalInterviews: 1284,
      activeUsers: 23,
      completionRate: 87.5
    },
    usageByDay,
    usageByChannel: [
      { channel: 'Chat', count: 520, percentage: 40.5 },
      { channel: 'Inbound Call', count: 456, percentage: 35.5 },
      { channel: 'Outbound Call', count: 308, percentage: 24.0 }
    ],
    usageByArchetype: [
      { archetype: 'Customer User', count: 312 },
      { archetype: 'Expert Deep-Dive', count: 287 },
      { archetype: 'Client Stakeholder', count: 245 },
      { archetype: 'Rapid Survey', count: 198 },
      { archetype: 'Diagnostic', count: 132 },
      { archetype: 'Investigative', count: 78 },
      { archetype: 'Panel Moderator', count: 32 }
    ],
    recentActivity: [
      { id: '1', type: 'interview_completed', description: 'Interview completed for "Product Feedback Q4"', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), user: 'Sarah Chen' },
      { id: '2', type: 'agent_created', description: 'New agent created: "Customer Insights 2024"', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), user: 'Michael Park' },
      { id: '3', type: 'interview_completed', description: 'Interview completed for "Expert Validation"', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), user: 'Emma Wilson' },
      { id: '4', type: 'user_joined', description: 'New user joined the platform', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), user: 'James Rodriguez' },
      { id: '5', type: 'agent_created', description: 'New agent created: "Market Research Q1"', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), user: 'Lisa Thompson' }
    ]
  };
}
