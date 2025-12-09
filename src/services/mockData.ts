import { User, Project, ProjectMembership, Interviewer, InterviewerMembership, Session } from '@/types';

// ============= Mock Users =============
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'sarah.chen@bcg.com',
    name: 'Sarah Chen',
    isActive: true,
    isSuperuser: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z'
  },
  {
    id: 'user-2',
    email: 'michael.park@bcg.com',
    name: 'Michael Park',
    isActive: true,
    isSuperuser: false,
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-11-15T10:00:00Z'
  },
  {
    id: 'user-3',
    email: 'emma.wilson@bcg.com',
    name: 'Emma Wilson',
    isActive: true,
    isSuperuser: false,
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-11-20T10:00:00Z'
  },
  {
    id: 'user-4',
    email: 'james.rodriguez@bcg.com',
    name: 'James Rodriguez',
    isActive: true,
    isSuperuser: false,
    createdAt: '2024-04-05T10:00:00Z',
    updatedAt: '2024-10-30T10:00:00Z'
  },
  {
    id: 'user-5',
    email: 'lisa.thompson@bcg.com',
    name: 'Lisa Thompson',
    isActive: false, // Inactive user
    isSuperuser: false,
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-09-15T10:00:00Z'
  }
];

// ============= Mock Projects =============
export const mockProjects: Project[] = [
  {
    id: 'project-1',
    caseCode: 'BCG-2024-001',
    name: 'Retail Transformation Study',
    description: 'Customer experience research for major retail client',
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z'
  },
  {
    id: 'project-2',
    caseCode: 'BCG-2024-002',
    name: 'Healthcare Innovation',
    description: 'Expert interviews for healthcare technology assessment',
    createdAt: '2024-07-15T10:00:00Z',
    updatedAt: '2024-11-20T10:00:00Z'
  },
  {
    id: 'project-3',
    caseCode: 'BCG-2024-003',
    name: 'Financial Services DD',
    description: 'Due diligence interviews for fintech acquisition',
    createdAt: '2024-08-20T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z'
  }
];

// ============= Mock Project Memberships =============
export const mockProjectMemberships: ProjectMembership[] = [
  // Project 1 - Retail
  { id: 'pm-1', userId: 'user-1', projectId: 'project-1', role: 'owner', createdAt: '2024-06-01T10:00:00Z', updatedAt: '2024-06-01T10:00:00Z' },
  { id: 'pm-2', userId: 'user-2', projectId: 'project-1', role: 'editor', createdAt: '2024-06-05T10:00:00Z', updatedAt: '2024-06-05T10:00:00Z' },
  { id: 'pm-3', userId: 'user-3', projectId: 'project-1', role: 'viewer', createdAt: '2024-06-10T10:00:00Z', updatedAt: '2024-06-10T10:00:00Z' },
  // Project 2 - Healthcare
  { id: 'pm-4', userId: 'user-2', projectId: 'project-2', role: 'owner', createdAt: '2024-07-15T10:00:00Z', updatedAt: '2024-07-15T10:00:00Z' },
  { id: 'pm-5', userId: 'user-1', projectId: 'project-2', role: 'editor', createdAt: '2024-07-20T10:00:00Z', updatedAt: '2024-07-20T10:00:00Z' },
  { id: 'pm-6', userId: 'user-4', projectId: 'project-2', role: 'viewer', createdAt: '2024-07-25T10:00:00Z', updatedAt: '2024-07-25T10:00:00Z' },
  // Project 3 - Financial
  { id: 'pm-7', userId: 'user-3', projectId: 'project-3', role: 'owner', createdAt: '2024-08-20T10:00:00Z', updatedAt: '2024-08-20T10:00:00Z' },
  { id: 'pm-8', userId: 'user-4', projectId: 'project-3', role: 'editor', createdAt: '2024-08-25T10:00:00Z', updatedAt: '2024-08-25T10:00:00Z' },
];

// ============= Mock Interviewers =============
export const mockInterviewers: Interviewer[] = [
  // Project 1 - Retail
  {
    id: 'interviewer-1',
    projectId: 'project-1',
    name: 'Customer Experience Bot',
    archetype: 'customer_user',
    status: 'published',
    channel: 'chat',
    language: 'en',
    contact: { chatUrl: 'https://genie.bcg.com/chat/abc123', chatPassword: 'retail2024' },
    credentialsReady: true,
    targetDurationMin: 15,
    createdAt: '2024-06-05T10:00:00Z',
    updatedAt: '2024-11-01T10:00:00Z',
    sessionsCount: 47
  },
  {
    id: 'interviewer-2',
    projectId: 'project-1',
    name: 'Store Manager Insights',
    archetype: 'client_stakeholder',
    status: 'published',
    channel: 'inbound_call',
    language: 'en',
    contact: { phoneNumber: '+1-555-0101' },
    credentialsReady: true,
    targetDurationMin: 30,
    createdAt: '2024-06-10T10:00:00Z',
    updatedAt: '2024-10-15T10:00:00Z',
    sessionsCount: 23
  },
  // Project 2 - Healthcare
  {
    id: 'interviewer-3',
    projectId: 'project-2',
    name: 'Medical Device Expert',
    archetype: 'expert_deep_dive',
    status: 'published',
    channel: 'outbound_call',
    language: 'en',
    contact: { phoneNumber: '+1-555-0102' },
    credentialsReady: true,
    targetDurationMin: 45,
    createdAt: '2024-07-20T10:00:00Z',
    updatedAt: '2024-11-10T10:00:00Z',
    sessionsCount: 18
  },
  {
    id: 'interviewer-4',
    projectId: 'project-2',
    name: 'Patient Feedback',
    archetype: 'customer_user',
    status: 'draft',
    channel: 'chat',
    language: 'en',
    contact: {},
    credentialsReady: false,
    targetDurationMin: 10,
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-11-01T10:00:00Z',
    sessionsCount: 0
  },
  // Project 3 - Financial
  {
    id: 'interviewer-5',
    projectId: 'project-3',
    name: 'Fintech DD Expert',
    archetype: 'investigative',
    status: 'published',
    channel: 'outbound_call',
    language: 'en',
    contact: { phoneNumber: '+1-555-0103' },
    credentialsReady: true,
    targetDurationMin: 60,
    createdAt: '2024-08-25T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
    sessionsCount: 31
  },
  {
    id: 'interviewer-6',
    projectId: 'project-3',
    name: 'Market Analysis',
    archetype: 'rapid_survey',
    status: 'archived',
    channel: 'chat',
    language: 'en',
    contact: { chatUrl: 'https://genie.bcg.com/chat/xyz789' },
    credentialsReady: true,
    targetDurationMin: 5,
    createdAt: '2024-09-01T10:00:00Z',
    updatedAt: '2024-10-01T10:00:00Z',
    sessionsCount: 156
  }
];

// ============= Mock Interviewer Memberships (Overrides) =============
export const mockInterviewerMemberships: InterviewerMembership[] = [
  // User 3 has viewer on project-1 but owner on interviewer-1
  { id: 'im-1', userId: 'user-3', interviewerId: 'interviewer-1', role: 'owner', createdAt: '2024-06-15T10:00:00Z', updatedAt: '2024-06-15T10:00:00Z' },
  // User 4 has viewer on project-2 but no access to interviewer-3 (sensitive)
  { id: 'im-2', userId: 'user-4', interviewerId: 'interviewer-3', role: 'none', createdAt: '2024-08-01T10:00:00Z', updatedAt: '2024-08-01T10:00:00Z' },
];

// ============= Mock Sessions =============
export const mockSessions: Session[] = [
  // Interviewer 1 sessions
  { id: 'session-1', interviewerId: 'interviewer-1', conversationType: 'live', startedAt: '2024-11-15T14:30:00Z', endedAt: '2024-11-15T14:45:00Z', durationSec: 892, completed: true, createdAt: '2024-11-15T14:30:00Z' },
  { id: 'session-2', interviewerId: 'interviewer-1', conversationType: 'live', startedAt: '2024-11-16T10:00:00Z', endedAt: '2024-11-16T10:12:00Z', durationSec: 720, completed: true, createdAt: '2024-11-16T10:00:00Z' },
  { id: 'session-3', interviewerId: 'interviewer-1', conversationType: 'test', startedAt: '2024-06-05T11:00:00Z', endedAt: '2024-06-05T11:05:00Z', durationSec: 300, completed: true, createdAt: '2024-06-05T11:00:00Z' },
  // Interviewer 2 sessions
  { id: 'session-4', interviewerId: 'interviewer-2', conversationType: 'live', startedAt: '2024-11-20T09:00:00Z', endedAt: '2024-11-20T09:32:00Z', durationSec: 1920, completed: true, createdAt: '2024-11-20T09:00:00Z' },
  { id: 'session-5', interviewerId: 'interviewer-2', conversationType: 'live', startedAt: '2024-11-21T15:00:00Z', durationSec: 0, completed: false, createdAt: '2024-11-21T15:00:00Z' }, // Incomplete
  // Interviewer 3 sessions
  { id: 'session-6', interviewerId: 'interviewer-3', conversationType: 'live', startedAt: '2024-11-18T11:00:00Z', endedAt: '2024-11-18T11:48:00Z', durationSec: 2880, completed: true, createdAt: '2024-11-18T11:00:00Z' },
  // Interviewer 5 sessions
  { id: 'session-7', interviewerId: 'interviewer-5', conversationType: 'live', startedAt: '2024-12-01T10:00:00Z', endedAt: '2024-12-01T11:02:00Z', durationSec: 3720, completed: true, createdAt: '2024-12-01T10:00:00Z' },
  { id: 'session-8', interviewerId: 'interviewer-5', conversationType: 'live', startedAt: '2024-12-02T14:00:00Z', endedAt: '2024-12-02T14:55:00Z', durationSec: 3300, completed: true, createdAt: '2024-12-02T14:00:00Z' },
  // Interviewer 6 sessions (archived but has many)
  { id: 'session-9', interviewerId: 'interviewer-6', conversationType: 'live', startedAt: '2024-09-15T10:00:00Z', endedAt: '2024-09-15T10:04:00Z', durationSec: 240, completed: true, createdAt: '2024-09-15T10:00:00Z' },
  { id: 'session-10', interviewerId: 'interviewer-6', conversationType: 'live', startedAt: '2024-09-16T11:00:00Z', endedAt: '2024-09-16T11:05:00Z', durationSec: 300, completed: true, createdAt: '2024-09-16T11:00:00Z' },
];

// ============= Helper functions to get populated data =============

export function getUserById(id: string): User | undefined {
  return mockUsers.find(u => u.id === id);
}

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find(p => p.id === id);
}

export function getInterviewerById(id: string): Interviewer | undefined {
  return mockInterviewers.find(i => i.id === id);
}

export function getProjectMembershipsForUser(userId: string): ProjectMembership[] {
  return mockProjectMemberships
    .filter(pm => pm.userId === userId)
    .map(pm => ({
      ...pm,
      user: getUserById(pm.userId),
      project: getProjectById(pm.projectId)
    }));
}

export function getProjectMembershipsForProject(projectId: string): ProjectMembership[] {
  return mockProjectMemberships
    .filter(pm => pm.projectId === projectId)
    .map(pm => ({
      ...pm,
      user: getUserById(pm.userId),
      project: getProjectById(pm.projectId)
    }));
}

export function getInterviewersForProject(projectId: string): Interviewer[] {
  return mockInterviewers
    .filter(i => i.projectId === projectId)
    .map(i => ({
      ...i,
      project: getProjectById(i.projectId)
    }));
}

export function getSessionsForInterviewer(interviewerId: string): Session[] {
  return mockSessions
    .filter(s => s.interviewerId === interviewerId)
    .map(s => ({
      ...s,
      interviewer: getInterviewerById(s.interviewerId)
    }));
}
