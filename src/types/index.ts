// ============= Core Tenancy Model =============

// Roles
export type ProjectRole = 'owner' | 'editor' | 'viewer';
export type InterviewerRole = 'owner' | 'editor' | 'viewer' | 'none';

// Interviewer status lifecycle
export type InterviewerStatus = 'draft' | 'ready_to_test' | 'launching' | 'published' | 'unpublished' | 'archived' | 'deleted' | 'active';

// Session types
export type ConversationType = 'test' | 'live';

// Channel types
export type Channel = 'chat' | 'inbound_call' | 'outbound_call';

// Archetype types
export type Archetype = 'expert_deep_dive' | 'client_stakeholder' | 'customer_user' | 'rapid_survey' | 'diagnostic' | 'investigative' | 'panel_moderator';

// ============= Core Entities =============

/**
 * User - BCG employee identity
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isActive: boolean; // System access approved
  isSuperuser: boolean; // System admin
  createdAt: string;
  updatedAt: string;
}

/**
 * Project - Logical grouping of interviewers (e.g., a case/engagement)
 */
export interface Project {
  id: string;
  caseCode: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * ProjectMembership - Links user to project with role
 */
export interface ProjectMembership {
  id: string;
  userId: string;
  projectId: string;
  role: ProjectRole;
  createdAt: string;
  updatedAt: string;
  // Populated relations
  user?: User;
  project?: Project;
}

/**
 * Interviewer - AI interviewer agent configuration
 */
export interface Interviewer {
  id: string;
  projectId: string;
  name: string;
  archetype: Archetype;
  status: InterviewerStatus;
  channel: Channel;
  language: string;
  voiceId?: string;
  contact: { phoneNumber?: string; chatUrl?: string; chatPassword?: string };
  credentialsReady: boolean;
  targetDurationMin?: number;
  createdAt: string;
  updatedAt: string;
  // Populated relations
  project?: Project;
  sessionsCount?: number;
}

/**
 * InterviewerMembership - Optional override of user's project-level access
 */
export interface InterviewerMembership {
  id: string;
  userId: string;
  interviewerId: string;
  role: InterviewerRole; // 'none' = explicitly revoke access
  createdAt: string;
  updatedAt: string;
  // Populated relations
  user?: User;
  interviewer?: Interviewer;
}

/**
 * Session - A conversation/interview instance
 */
export interface Session {
  id: string;
  interviewerId: string;
  conversationType: ConversationType;
  startedAt: string;
  endedAt?: string;
  durationSec?: number;
  completed: boolean;
  respondentId?: string;
  createdAt: string;
  // Populated relations
  interviewer?: Interviewer;
  transcript?: CleanedTranscript;
}

// ============= Interview Content Types =============

export interface InterviewGuide {
  id: string;
  agentId?: string; // Legacy
  interviewerId?: string; // New model
  rawText?: string;
  structured?: GuideSchema;
  // New model fields
  introduction?: string;
  closingContext?: string;
  hasScreener?: boolean;
  screenerQuestions?: string;
  introductionQuestions?: string;
  guideContent?: string; // Rich text with sections
}

export interface GuideSchema {
  intro?: string;
  objectives: string[];
  sections: {
    title: string;
    questions: {
      id: string;
      type: 'open' | 'scale' | 'multi' | 'single';
      prompt: string;
      required?: boolean;
      options?: string[];
      scale?: { min: number; max: number; labels?: Record<number, string> };
      followUps?: string[];
    }[];
  }[];
  closing?: string;
}

export interface KnowledgeAsset {
  id: string;
  agentId?: string; // Legacy
  interviewerId?: string; // New model
  title: string;
  type: 'text' | 'file';
  contentText?: string;
  fileName?: string;
  fileSize?: number;
}

// ============= Transcript & Insights Types =============

export interface CleanedTranscript {
  sections: TranscriptSection[];
}

export interface TranscriptSection {
  id: string;
  question: string;
  answer: AnswerContent;
  timestamp?: string;
}

export interface AnswerContent {
  summary?: string;
  bulletPoints: string[];
  rawText?: string;
}

export interface QAConversation {
  id: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  messages: QAMessage[];
}

export interface QAMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ============= Archetype Types =============

export interface ArchetypeInfo {
  id: Archetype;
  title: string;
  description: string;
  icon: string;
  useCase: string;
  examples: string[];
}

// ============= Permission Descriptions =============

export const PROJECT_ROLES: Record<ProjectRole, {
  label: string;
  description: string;
  capabilities: string[];
}> = {
  viewer: {
    label: 'Viewer',
    description: 'View project and interviewer data only',
    capabilities: ['View all interviewers', 'View session insights', 'View analytics']
  },
  editor: {
    label: 'Editor',
    description: 'Edit interviewers within the project',
    capabilities: ['All Viewer capabilities', 'Create/edit interviewers', 'Manage interview guides', 'Manage knowledge base']
  },
  owner: {
    label: 'Owner',
    description: 'Full control over project',
    capabilities: ['All Editor capabilities', 'Invite/remove members', 'Change permissions', 'Archive or delete project']
  }
};

export const INTERVIEWER_ROLES: Record<InterviewerRole, {
  label: string;
  description: string;
}> = {
  owner: {
    label: 'Owner',
    description: 'Full control over this interviewer'
  },
  editor: {
    label: 'Editor',
    description: 'Can edit this interviewer'
  },
  viewer: {
    label: 'Viewer',
    description: 'Can only view this interviewer'
  },
  none: {
    label: 'No Access',
    description: 'Explicitly revoked access to this interviewer'
  }
};

// ============= Constants =============

export const PRICE_BY_CHANNEL: Record<Channel, number> = {
  chat: 10,
  inbound_call: 20,
  outbound_call: 30,
};

export const ARCHETYPES: ArchetypeInfo[] = [
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

// ============= Legacy Compatibility (to be removed) =============

// Keep Agent type as alias for Interviewer during migration
export type AgentStatus = 'live' | 'ready_to_test' | 'suspended' | 'finished';
export type AgentPermission = 'viewer' | 'editor' | 'owner';

export interface Agent {
  id: string;
  name: string;
  archetype: Archetype;
  createdAt: string;
  status: AgentStatus;
  language: string;
  voiceId?: string;
  channel: Channel;
  interviewsCount: number;
  pricePerInterviewUsd: number;
  contact: { phoneNumber?: string; chatUrl?: string; chatPassword?: string };
  credentialsReady: boolean;
  deletedAt?: string;
  archivedAt?: string;
  hasActiveCall?: boolean;
}

export interface AgentCollaborator {
  id: string;
  agentId: string;
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    department?: string;
  };
  permission: AgentPermission;
  invitedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export const AGENT_PERMISSIONS: Record<AgentPermission, {
  label: string;
  description: string;
  capabilities: string[];
}> = {
  viewer: {
    label: 'Viewer',
    description: 'View configuration and insights only',
    capabilities: ['View agent configuration', 'View interview insights', 'View analytics']
  },
  editor: {
    label: 'Editor',
    description: 'Edit agent configuration',
    capabilities: ['All Viewer capabilities', 'Edit agent configuration', 'Manage interview guide', 'Manage knowledge base']
  },
  owner: {
    label: 'Owner',
    description: 'Full control over agent',
    capabilities: ['All Editor capabilities', 'Invite/remove collaborators', 'Change permissions', 'Archive or delete agent', 'Transfer ownership']
  }
};

export interface InterviewSummary {
  id: string;
  agentId: string;
  startedAt: string;
  durationSec: number;
  channel: Channel;
  completed: boolean;
  respondentId?: string;
}

export interface AudienceUpload {
  id: string;
  agentId: string;
  fileName: string;
  status: 'processing' | 'ready' | 'error';
  totalContacts?: number;
  errors?: string[];
}

export interface Share {
  agentId: string;
  users: { email: string; role: 'owner' | 'editor' | 'viewer' }[];
}

export interface SessionDetail {
  id: string;
  agentId: string;
  startedAt: string;
  durationSec: number;
  completed: boolean;
  respondentId?: string;
  channel: Channel;
  transcript: CleanedTranscript;
}
