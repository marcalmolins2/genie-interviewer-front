export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Re-export types from the main types file for compatibility
// These should match the existing types in src/types/index.ts
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

// Insert types for Supabase operations
export interface ProfileInsert {
  id: string;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
}

export interface ProjectInsert {
  name: string;
  caseCode?: string;
  description?: string | null;
  projectType?: string;
}

export interface ProjectMembershipInsert {
  project_id: string;
  user_id: string;
  role?: string;
}

export interface InterviewerInsert {
  project_id: string;
  name: string;
  title?: string;
  description?: string | null;
  archetype?: string;
  channel?: string;
  language?: string;
  voice_id?: string;
  target_duration_min?: number;
  created_by?: string | null;
}

export interface SessionInsert {
  interviewer_id: string;
  conversation_type?: string;
  respondent_id?: string;
}

// Update types
export type ProfileUpdate = Partial<ProfileInsert>;
export type ProjectUpdate = Partial<ProjectInsert>;
export type InterviewerUpdate = Partial<InterviewerInsert> & {
  status?: string;
  archived_at?: string | null;
  deleted_at?: string | null;
};
export type SessionUpdate = Partial<SessionInsert> & {
  started_at?: string | null;
  ended_at?: string | null;
  duration_sec?: number | null;
  completed?: boolean;
};

// Extended types with relations (for Supabase queries)
import type { Project, ProjectMembership, Interviewer } from '@/types';

export type ProjectWithMembership = Project & {
  membership?: ProjectMembership;
};

export type InterviewerWithProject = Interviewer & {
  project?: Project;
};
