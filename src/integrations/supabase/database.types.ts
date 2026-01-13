export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enum types matching database
export type ProjectRole = 'owner' | 'editor' | 'viewer';
export type InterviewerRole = 'owner' | 'editor' | 'viewer';
export type ProjectType = 'consumer' | 'b2b' | 'internal' | 'other';
export type InterviewerStatus = 'draft' | 'active' | 'paused' | 'archived' | 'deleted';
export type ConversationType = 'structured' | 'exploratory' | 'mixed';
export type ChannelType = 'web' | 'phone' | 'sms';
export type ArchetypeType = 'market_research' | 'ux_research' | 'academic' | 'custom';
export type ExpertSourceType = 'glg' | 'alphasights' | 'direct' | 'other';
export type AppRole = 'admin' | 'user';
export type FeatureFlagCategory = 'production' | 'experimental' | 'roadmap';

// Table row types
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

export interface Project {
  id: string;
  name: string;
  description: string | null;
  project_type: ProjectType;
  created_at: string;
  updated_at: string;
}

export interface ProjectMembership {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  created_at: string;
}

export interface Interviewer {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  archetype: ArchetypeType;
  status: InterviewerStatus;
  channel: ChannelType;
  conversation_type: ConversationType;
  expert_source: ExpertSourceType | null;
  voice: string | null;
  interview_guide: Json | null;
  knowledge_assets: Json | null;
  short_code: string | null;
  phone_number: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  deleted_at: string | null;
}

export interface Session {
  id: string;
  interviewer_id: string;
  respondent_name: string | null;
  respondent_email: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  duration_minutes: number | null;
  transcript: Json | null;
  summary: Json | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

// Insert types
export type ProfileInsert = Partial<Profile> & { id: string; email: string };
export type ProjectInsert = Partial<Project> & { name: string };
export type ProjectMembershipInsert = Partial<ProjectMembership> & { project_id: string; user_id: string };
export type InterviewerInsert = Partial<Interviewer> & { project_id: string; name: string };
export type SessionInsert = Partial<Session> & { interviewer_id: string };

// Update types
export type ProfileUpdate = Partial<Profile>;
export type ProjectUpdate = Partial<Project>;
export type InterviewerUpdate = Partial<Interviewer>;
export type SessionUpdate = Partial<Session>;

// Extended types with relations
export type ProjectWithMembership = Project & {
  membership?: ProjectMembership;
};

export type InterviewerWithProject = Interviewer & {
  project?: Project;
};
