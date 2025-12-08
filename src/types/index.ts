// Core Types for Genie Interviewers

export type AgentStatus = 'live' | 'ready_to_test' | 'suspended' | 'finished';
export type Channel = 'chat' | 'inbound_call' | 'outbound_call';
export type Archetype = 'expert_deep_dive' | 'client_stakeholder' | 'customer_user' | 'rapid_survey' | 'diagnostic' | 'investigative' | 'panel_moderator';

// Agent permission types
export type AgentPermission = 'viewer' | 'editor' | 'owner';

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

// Permission descriptions for UI
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
export interface Agent {
  id: string;
  name: string;
  archetype: Archetype;
  createdAt: string; // ISO
  status: AgentStatus;
  language: string; // e.g., 'en', 'es', 'de'
  voiceId?: string; // optional for chat
  channel: Channel;
  interviewsCount: number;
  pricePerInterviewUsd: number; // computed from channel
  contact: { phoneNumber?: string; chatUrl?: string; chatPassword?: string };
  credentialsReady: boolean; // to show when phone/url is generated
  deletedAt?: string; // ISO timestamp when moved to trash
  archivedAt?: string; // ISO timestamp when archived
  hasActiveCall?: boolean; // true when an interview call is in progress
}

export interface InterviewGuide {
  id: string;
  agentId: string;
  rawText?: string;
  structured?: GuideSchema;
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
      options?: string[]; // for multi/single
      scale?: { min: number; max: number; labels?: Record<number, string> };
      followUps?: string[]; // dynamic prompts
    }[];
  }[];
  closing?: string;
}

export interface KnowledgeAsset {
  id: string;
  agentId: string;
  title: string;
  type: 'text' | 'file';
  contentText?: string;
  fileName?: string;
  fileSize?: number;
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

export interface InterviewSummary {
  id: string;
  agentId: string;
  startedAt: string;
  durationSec: number;
  channel: Channel;
  completed: boolean;
  respondentId?: string;
}

export interface ArchetypeInfo {
  id: Archetype;
  title: string;
  description: string;
  icon: string;
  useCase: string;
  examples: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  organizationId: string;
}

// Session-level insights types
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

// Pricing constants
export const PRICE_BY_CHANNEL: Record<Channel, number> = {
  chat: 10,
  inbound_call: 20,
  outbound_call: 30,
};

// Archetype definitions
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