// ============= Core Tenancy Model =============

// Roles
export type ProjectRole = 'owner' | 'editor' | 'viewer';
export type InterviewerRole = 'owner' | 'editor' | 'viewer' | 'none';

// Project types
export type ProjectType = 'internal_work' | 'commercial_proposal' | 'client_investment' | 'client_work';

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  internal_work: 'Internal Work',
  commercial_proposal: 'Commercial Proposal',
  client_investment: 'Client Investment',
  client_work: 'Client Work',
};

// Interviewer status lifecycle (unified model)
export type InterviewerStatus = 'draft' | 'ready_to_test' | 'live' | 'paused' | 'archived' | 'finished';

// Session types
export type ConversationType = 'test' | 'live';

// Feedback types
export interface SessionFeedback {
  sessionId: string;
  rating: 'positive' | 'negative' | null;
  negativeReason?: string;
  submittedAt?: string;
  submittedBy?: string;
}

// Channel types
export type Channel = 'inbound_call' | 'web_link';

// Archetype types
export type Archetype = 'expert_interview' | 'belief_audit' | 'customer_interview' | 'maturity_assessment';

// Expert source variant (only applicable to expert_interview archetype)
export type ExpertSource = 'internal' | 'expert_network';

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
  projectType: ProjectType;
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
  title: string;                    // Interviewer title (e.g., "EU Battery Market Expert Interview")
  description?: string;             // Optional description of the interviewer's purpose
  name: string;                     // Agent persona name (e.g., "Sam")
  archetype: Archetype;
  status: InterviewerStatus;
  channel: Channel;
  language: string;
  voiceId?: string;
  contact: { phoneNumber?: string; chatUrl?: string; chatPassword?: string; linkId?: string };
  credentialsReady: boolean;
  targetDurationMin?: number;
  interviewContext?: string;        // Rich text research brief (guided config)
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
  citations?: string[]; // Array of section IDs referenced in the response
}

// ============= Cross-Session Summary Types =============

export interface CrossSessionSummary {
  headline?: string;                    // Optional custom headline, defaults to "Executive Summary"
  narrativeParagraph: string;           // 2-3 sentence executive overview
  keyTakeaways: string[];               // 3-5 actionable bullet points
  stats: {
    sessionCount: number;
    totalDurationMinutes: number;
    dateRange: { start: string; end: string };
  };
}

// ============= Key Findings Types =============

export interface KeyFinding {
  id: string;
  insight: string;
  supportingQuote: {
    text: string;
    sessionId: string;
    sessionDate: string;
  };
  sessionIds: string[];
}

export interface FindingsCategory {
  id: string;
  category: string;
  summary: string;
  findings: KeyFinding[];
  source?: 'interview_guide' | 'emergent';
  sessionCount?: number;
}

// ============= Archetype Types =============

export interface ArchetypeInfo {
  id: Archetype;
  title: string;
  description: string;
  icon: string;
  useCase: string;
  examples: string[];
  hasVariant?: boolean; // Flag for archetypes with secondary options (e.g., expert_interview)
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
  inbound_call: 50,
  web_link: 50,
};

export const ARCHETYPES: ArchetypeInfo[] = [
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

// ============= Legacy Compatibility (to be removed) =============

// Legacy alias - deprecated, use InterviewerStatus
export type AgentStatus = InterviewerStatus;
export type AgentPermission = 'viewer' | 'editor' | 'owner';

export interface Agent {
  id: string;
  name: string;
  title?: string;                      // Interviewer title
  description?: string;                // Optional description
  archetype: Archetype;
  createdAt: string;
  updatedAt?: string;
  status: AgentStatus;
  language: string;
  voiceId?: string;
  channel: Channel;
  interviewsCount: number;
  pricePerInterviewUsd: number;
  contact: { phoneNumber?: string; chatUrl?: string; chatPassword?: string; linkId?: string };
  credentialsReady: boolean;
  deletedAt?: string;
  archivedAt?: string;
  hasActiveCall?: boolean;
  // Configuration fields
  projectId?: string;
  targetDuration?: number;
  interviewContext?: string;
  introContext?: string;
  enableScreener?: boolean;
  screenerQuestions?: string;
  introductionQuestions?: string;
  closeContext?: string;
  caseCode?: string;
  pronunciationHints?: string;
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
  conversationType: ConversationType;
  respondentId?: string;
  feedback?: SessionFeedback;
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

// ============= Session-Level Summary Types =============

export interface SessionSummary {
  headline: string;
  narrativeParagraph: string;
  keyTakeaways?: string[];
}

export interface RespondentProfile {
  role: string;
  organization?: string;
  background: string;
  relevantContext: string[];
}

export interface TopicFinding {
  id: string;
  topicName: string;
  summary: string;
  keyInsights: string[];
  supportingQuote?: {
    text: string;
    timestamp?: string;
  };
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
  feedback?: SessionFeedback;
  recordingUrl?: string;
  summary?: SessionSummary;
  respondentProfile?: RespondentProfile;
  topicFindings?: TopicFinding[];
}
