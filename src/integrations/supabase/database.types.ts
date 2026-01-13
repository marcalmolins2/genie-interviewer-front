export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Re-export types from the main types file for compatibility
export type { 
  ProjectRole, 
  InterviewerRole, 
  ProjectType, 
  InterviewerStatus,
  ConversationType,
  Channel as ChannelType,
  Archetype as ArchetypeType,
  ExpertSource as ExpertSourceType,
  User,
  Project,
  ProjectMembership,
  Interviewer,
  InterviewerMembership,
  Session,
} from '@/types';

import type { 
  Project, 
  ProjectMembership, 
  Interviewer,
  Session,
  ProjectRole,
  InterviewerRole,
  ProjectType,
  InterviewerStatus,
  Channel,
  Archetype,
  ConversationType,
  User,
} from '@/types';

// Supabase-specific types
export type AppRole = 'admin' | 'user';
export type FeatureFlagCategory = 'production' | 'experimental' | 'roadmap';

// Profile matches the profiles table (different from User type)
export interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  description: string | null;
  category: FeatureFlagCategory;
  created_at: string;
  updated_at: string;
}

// Insert types for Supabase operations (snake_case for database)
export interface ProfileInsert {
  id: string;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
}

export interface ProjectInsert {
  name: string;
  case_code?: string;
  description?: string | null;
  project_type?: ProjectType;
}

export interface ProjectMembershipInsert {
  project_id: string;
  user_id: string;
  role?: ProjectRole;
}

export interface InterviewerInsert {
  project_id: string;
  name: string;
  title?: string;
  description?: string | null;
  archetype?: Archetype;
  status?: InterviewerStatus;
  channel?: Channel;
  language?: string;
  voice_id?: string | null;
  target_duration_min?: number | null;
  short_code?: string | null;
  phone_number?: string | null;
  chat_url?: string | null;
  link_id?: string | null;
  credentials_ready?: boolean;
  created_by?: string | null;
}

export interface SessionInsert {
  interviewer_id: string;
  conversation_type?: ConversationType;
  respondent_id?: string | null;
  respondent_name?: string | null;
  respondent_email?: string | null;
}

// Update types
export type ProfileUpdate = Partial<ProfileInsert>;
export type ProjectUpdate = Partial<ProjectInsert>;
export type InterviewerUpdate = Partial<Omit<InterviewerInsert, 'project_id'>> & {
  archived_at?: string | null;
  deleted_at?: string | null;
  updated_at?: string;
};
export type SessionUpdate = Partial<SessionInsert> & {
  started_at?: string | null;
  ended_at?: string | null;
  duration_sec?: number | null;
  completed?: boolean;
};

// Extended types with relations (for Supabase queries)
export type ProjectWithMembership = Project & {
  membership?: ProjectMembership;
};

export type InterviewerWithProject = Interviewer & {
  project?: Project;
};

// ============= Row types (what Supabase returns) =============

export interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  project_type: string;
  case_code?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectMembershipRow {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export interface InterviewerRow {
  id: string;
  project_id: string;
  name: string;
  title: string | null;
  description: string | null;
  archetype: string;
  status: string;
  channel: string;
  language: string;
  voice_id: string | null;
  short_code: string | null;
  phone_number: string | null;
  chat_url: string | null;
  chat_password: string | null;
  link_id: string | null;
  credentials_ready: boolean;
  target_duration_min: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  deleted_at: string | null;
}

export interface SessionRow {
  id: string;
  interviewer_id: string;
  conversation_type: string;
  respondent_id: string | null;
  respondent_name: string | null;
  respondent_email: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_sec: number | null;
  completed: boolean;
  created_at: string;
}

// ============= Mappers =============

/** Convert Supabase Profile to app User */
export function profileToUser(profile: Profile): User {
  return {
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

/** Convert Supabase ProjectRow to app Project */
export function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    caseCode: row.case_code || '',
    name: row.name,
    description: row.description || undefined,
    projectType: row.project_type as ProjectType,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Convert Supabase ProjectMembershipRow to app ProjectMembership */
export function rowToProjectMembership(row: ProjectMembershipRow): ProjectMembership {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    role: row.role as ProjectRole,
    createdAt: row.created_at,
    updatedAt: row.created_at,
  };
}

/** Convert Supabase InterviewerRow to app Interviewer */
export function rowToInterviewer(row: InterviewerRow): Interviewer {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title || row.name,
    description: row.description || undefined,
    name: row.name,
    archetype: row.archetype as Archetype,
    status: row.status as InterviewerStatus,
    channel: row.channel as Channel,
    language: row.language || 'en',
    voiceId: row.voice_id || undefined,
    contact: {
      phoneNumber: row.phone_number || undefined,
      chatUrl: row.chat_url || undefined,
      chatPassword: row.chat_password || undefined,
      linkId: row.link_id || row.short_code || undefined,
    },
    credentialsReady: row.credentials_ready || false,
    targetDurationMin: row.target_duration_min || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Convert Supabase SessionRow to app Session */
export function rowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    interviewerId: row.interviewer_id,
    conversationType: row.conversation_type as ConversationType,
    startedAt: row.started_at || row.created_at,
    endedAt: row.ended_at || undefined,
    durationSec: row.duration_sec || undefined,
    completed: row.completed,
    respondentId: row.respondent_id || undefined,
    createdAt: row.created_at,
  };
}
